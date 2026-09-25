-- lovable-cron-fallback-reviewed: 24 runs/day; hourly reconciliation backstop only — hot-path purge of waiting_users already happens inside atomic_match_user on every match attempt

BEGIN;

CREATE INDEX IF NOT EXISTS users_active_idx           ON public.users (last_active_at DESC);
CREATE INDEX IF NOT EXISTS users_score_idx            ON public.users (yuyu_score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS users_referral_code_idx    ON public.users (referral_code);

CREATE INDEX IF NOT EXISTS gifts_receiver_time_idx    ON public.gifts (receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS gifts_sender_time_idx      ON public.gifts (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS gifts_time_idx             ON public.gifts (created_at DESC);

CREATE INDEX IF NOT EXISTS yuyu_tx_user_time_idx      ON public.yuyu_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS yuyu_tx_type_time_idx      ON public.yuyu_transactions (type, created_at DESC);
CREATE INDEX IF NOT EXISTS yuyu_price_hist_time_idx   ON public.yuyu_price_history (recorded_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_idx     ON public.notifications (user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS notif_queue_due_idx        ON public.notification_queue (status, scheduled_for) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS online_users_seen_idx      ON public.online_users (last_seen DESC);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx     ON public.referrals (referrer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_user_time_idx   ON public.moderation_events (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.match_rate_limit (
  user_id      uuid PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  attempts     integer     NOT NULL DEFAULT 0,
  blocked_until timestamptz
);
GRANT SELECT ON public.match_rate_limit TO authenticated;
GRANT ALL    ON public.match_rate_limit TO service_role;
ALTER TABLE public.match_rate_limit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS match_rate_limit_own_read ON public.match_rate_limit;
CREATE POLICY match_rate_limit_own_read ON public.match_rate_limit
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.match_throttled(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_row public.match_rate_limit%ROWTYPE;
  v_limit integer := 45;
  v_penalty interval;
BEGIN
  INSERT INTO public.match_rate_limit (user_id, window_start, attempts)
  VALUES (p_user_id, now(), 1)
  ON CONFLICT (user_id) DO UPDATE
    SET attempts = CASE WHEN public.match_rate_limit.window_start < now() - interval '1 minute'
                        THEN 1 ELSE public.match_rate_limit.attempts + 1 END,
        window_start = CASE WHEN public.match_rate_limit.window_start < now() - interval '1 minute'
                        THEN now() ELSE public.match_rate_limit.window_start END
  RETURNING * INTO v_row;

  IF v_row.blocked_until IS NOT NULL AND v_row.blocked_until > now() THEN
    RETURN true;
  END IF;

  IF v_row.attempts > v_limit THEN
    v_penalty := least(30, power(2, least(v_row.attempts - v_limit, 5))) * interval '1 second';
    UPDATE public.match_rate_limit SET blocked_until = now() + v_penalty WHERE user_id = p_user_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$fn$;

REVOKE ALL ON FUNCTION public.match_throttled(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_throttled(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.atomic_match_user(
  p_user_id uuid,
  p_language text DEFAULT 'en',
  p_exclude_partner uuid DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_expand boolean DEFAULT true
)
RETURNS TABLE (room_name text, partner_id uuid, is_rematch boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_partner uuid;
  v_room text;
  v_existing record;
  v_lang text := COALESCE(NULLIF(trim(p_language), ''), 'en');
  v_seen boolean := false;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF public.match_throttled(p_user_id) THEN
    RETURN;
  END IF;

  IF NOT pg_try_advisory_xact_lock(hashtextextended(p_user_id::text, 0)) THEN
    RETURN;
  END IF;

  DELETE FROM public.waiting_users WHERE last_seen < now() - interval '45 seconds';

  SELECT mh.user_id, mh.partner_id, mh.room_name INTO v_existing
  FROM public.match_history mh
  WHERE mh.ended_at IS NULL
    AND mh.created_at > now() - interval '2 minutes'
    AND (mh.user_id = p_user_id OR mh.partner_id = p_user_id)
  ORDER BY mh.created_at DESC
  LIMIT 1;

  IF v_existing.room_name IS NOT NULL THEN
    RETURN QUERY SELECT v_existing.room_name,
      CASE WHEN v_existing.user_id = p_user_id THEN v_existing.partner_id ELSE v_existing.user_id END,
      true;
    RETURN;
  END IF;

  SELECT w.user_id INTO v_partner
  FROM public.waiting_users w
  LEFT JOIN LATERAL (
    SELECT 1 AS hit FROM public.match_history mh
    WHERE mh.created_at > now() - interval '7 days'
      AND ((mh.user_id = p_user_id AND mh.partner_id = w.user_id)
        OR (mh.partner_id = p_user_id AND mh.user_id = w.user_id))
    LIMIT 1
  ) prev ON true
  WHERE w.user_id <> p_user_id
    AND (p_exclude_partner IS NULL OR w.user_id <> p_exclude_partner)
    AND w.last_seen > now() - interval '45 seconds'
  ORDER BY
    (prev.hit IS NOT NULL),
    (w.language IS NOT DISTINCT FROM v_lang) DESC,
    (p_country IS NOT NULL AND w.country IS NOT DISTINCT FROM p_country) DESC,
    w.created_at ASC
  FOR UPDATE OF w SKIP LOCKED
  LIMIT 1;

  IF v_partner IS NULL AND p_exclude_partner IS NOT NULL AND p_expand THEN
    SELECT w.user_id INTO v_partner
    FROM public.waiting_users w
    WHERE w.user_id <> p_user_id
      AND w.last_seen > now() - interval '45 seconds'
    ORDER BY w.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1;
  END IF;

  IF v_partner IS NULL THEN
    INSERT INTO public.waiting_users (user_id, language, country, created_at, last_seen)
    VALUES (p_user_id, v_lang, NULLIF(trim(COALESCE(p_country,'')), ''), now(), now())
    ON CONFLICT (user_id) DO UPDATE
      SET language = EXCLUDED.language,
          country = EXCLUDED.country,
          last_seen = now();
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.match_history mh
    WHERE (mh.user_id = p_user_id AND mh.partner_id = v_partner)
       OR (mh.partner_id = p_user_id AND mh.user_id = v_partner)
  ) INTO v_seen;

  DELETE FROM public.waiting_users WHERE user_id IN (p_user_id, v_partner);

  v_room := 'caakus_' || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.match_history (user_id, partner_id, room_name, created_at)
  VALUES (p_user_id, v_partner, v_room, now());

  RETURN QUERY SELECT v_room, v_partner, v_seen;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.purge_ephemeral_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_waiting integer; v_online integer; v_matches integer;
  v_queue integer; v_notif integer; v_hist integer; v_rate integer;
BEGIN
  DELETE FROM public.waiting_users WHERE last_seen < now() - interval '45 seconds';
  GET DIAGNOSTICS v_waiting = ROW_COUNT;

  DELETE FROM public.online_users WHERE last_seen < now() - interval '10 minutes';
  GET DIAGNOSTICS v_online = ROW_COUNT;

  UPDATE public.match_history
     SET ended_at = now()
   WHERE ended_at IS NULL AND created_at < now() - interval '3 hours';
  GET DIAGNOSTICS v_matches = ROW_COUNT;

  DELETE FROM public.notification_queue
   WHERE status <> 'pending' AND processed_at < now() - interval '7 days';
  GET DIAGNOSTICS v_queue = ROW_COUNT;

  DELETE FROM public.notifications
   WHERE read = true AND created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_notif = ROW_COUNT;

  DELETE FROM public.yuyu_price_history WHERE recorded_at < now() - interval '90 days';
  GET DIAGNOSTICS v_hist = ROW_COUNT;

  DELETE FROM public.match_rate_limit
   WHERE window_start < now() - interval '1 hour'
     AND (blocked_until IS NULL OR blocked_until < now());
  GET DIAGNOSTICS v_rate = ROW_COUNT;

  RETURN jsonb_build_object('waiting',v_waiting,'online',v_online,'stale_matches',v_matches,
                            'queue',v_queue,'notifications',v_notif,'price_history',v_hist,'rate_limit',v_rate);
END;
$fn$;

REVOKE ALL ON FUNCTION public.purge_ephemeral_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_ephemeral_data() TO service_role;

COMMIT;

DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'caakus-purge-ephemeral';
    PERFORM cron.schedule('caakus-purge-ephemeral', '0 * * * *', 'SELECT public.purge_ephemeral_data();');
  END IF;
END;
$cron$;

NOTIFY pgrst, 'reload schema';