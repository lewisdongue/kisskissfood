-- lovable-cron-fallback-reviewed: 1440 runs/day; due notification slots require at most 60 seconds of delivery delay, while daily queue generation remains hourly.
CREATE OR REPLACE FUNCTION public.atomic_match_user(p_user_id uuid, p_language text DEFAULT 'en')
RETURNS TABLE(room_name text, partner_id uuid, is_rematch boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner uuid;
  v_room text;
  v_existing record;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF NOT pg_try_advisory_xact_lock(hashtextextended(p_user_id::text, 0)) THEN
    RETURN;
  END IF;

  SELECT mh.user_id, mh.partner_id, mh.room_name
    INTO v_existing
  FROM public.match_history mh
  WHERE mh.ended_at IS NULL
    AND mh.created_at > now() - interval '2 minutes'
    AND (mh.user_id = p_user_id OR mh.partner_id = p_user_id)
  ORDER BY mh.created_at DESC
  LIMIT 1;

  IF v_existing.room_name IS NOT NULL THEN
    RETURN QUERY SELECT
      v_existing.room_name,
      CASE WHEN v_existing.user_id = p_user_id THEN v_existing.partner_id ELSE v_existing.user_id END,
      false;
    RETURN;
  END IF;

  SELECT w.user_id INTO v_partner
  FROM public.waiting_users w
  WHERE w.user_id <> p_user_id
    AND w.created_at > now() - interval '2 minutes'
  ORDER BY w.created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_partner IS NULL THEN
    INSERT INTO public.waiting_users (user_id, language, created_at)
    VALUES (p_user_id, COALESCE(NULLIF(p_language, ''), 'en'), now())
    ON CONFLICT (user_id) DO UPDATE
      SET language = excluded.language, created_at = excluded.created_at;
    RETURN;
  END IF;

  DELETE FROM public.waiting_users WHERE user_id IN (p_user_id, v_partner);
  v_room := 'caakus_' || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.match_history (user_id, partner_id, room_name, created_at)
  VALUES (p_user_id, v_partner, v_room, now());

  RETURN QUERY SELECT v_room, v_partner, false;
END;
$$;
REVOKE ALL ON FUNCTION public.atomic_match_user(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.atomic_match_user(uuid,text) TO anon, authenticated, service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'match_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_history;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.enqueue_all_daily_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  INSERT INTO public.notification_preferences(user_id, timezone)
  SELECT u.id, COALESCE(NULLIF(u.timezone, ''), 'UTC')
  FROM public.users u
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.notification_queue(user_id,type,title,message,data,slot_key,local_day,scheduled_for)
  SELECT
    p.user_id,
    'daily_reminder',
    s.title,
    s.message,
    jsonb_build_object('app_url','/call','slot',s.slot_key),
    s.slot_key,
    (now() AT TIME ZONE p.timezone)::date,
    (((now() AT TIME ZONE p.timezone)::date + s.local_time) AT TIME ZONE p.timezone)
  FROM public.notification_preferences p
  CROSS JOIN (VALUES
    (1,'morning-1','08:00'::time,'Good morning','Someone new is waiting to meet you on Caakus.'),
    (2,'morning-2','09:30'::time,'Daily bonus ready','Claim your YUYU bonus before it expires.'),
    (3,'noon-1','12:00'::time,'Lunch break?','One tap, one real human. Start a call now.'),
    (4,'noon-2','13:30'::time,'Keep your streak alive','A short call keeps your streak going.'),
    (5,'evening-1','18:00'::time,'Peak hours','People around the world are online now.'),
    (6,'evening-2','19:30'::time,'Meet someone new','Your next great conversation is one tap away.'),
    (7,'night-1','21:30'::time,'Late-night talks','Discover a new voice tonight.'),
    (8,'night-2','22:30'::time,'One last connection','End your day with someone new on Caakus.')
  ) AS s(slot_number,slot_key,local_time,title,message)
  WHERE p.push_enabled
    AND p.daily_reminders
    AND s.slot_number <= p.max_notifications_per_day
  ON CONFLICT(user_id,local_day,slot_key) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.enqueue_all_daily_notifications() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_all_daily_notifications() TO service_role;

CREATE OR REPLACE FUNCTION public.deliver_due_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  WITH due AS (
    UPDATE public.notification_queue q
       SET status = 'sent', processed_at = now(), last_attempt_at = now(), attempts = attempts + 1
     WHERE q.status = 'pending' AND q.scheduled_for <= now()
     RETURNING q.*
  ), inserted AS (
    INSERT INTO public.notifications(user_id,type,title,message,data,delivery_status,delivery_method,sent_at)
    SELECT user_id,type,title,message,data,'sent','in_app',now()
    FROM due
    RETURNING 1
  )
  SELECT count(*) INTO v_count FROM inserted;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.deliver_due_notifications() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deliver_due_notifications() TO service_role;

SELECT cron.unschedule('enqueue-daily-notifications')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='enqueue-daily-notifications');
SELECT cron.schedule('enqueue-daily-notifications','5 * * * *',$$SELECT public.enqueue_all_daily_notifications();$$);
SELECT cron.unschedule('deliver-due-notifications')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='deliver-due-notifications');
SELECT cron.schedule('deliver-due-notifications','* * * * *',$$SELECT public.deliver_due_notifications();$$);

SELECT public.enqueue_all_daily_notifications();
NOTIFY pgrst, 'reload schema';

ALTER TABLE public.notification_preferences
  DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey,
  ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.notification_queue
  DROP CONSTRAINT IF EXISTS notification_queue_user_id_fkey,
  ADD CONSTRAINT notification_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;