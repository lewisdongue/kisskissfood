CREATE TABLE IF NOT EXISTS public.waiting_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waiting_users
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.match_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  room_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE public.match_history
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

CREATE TABLE IF NOT EXISTS public.moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_name text,
  reason text NOT NULL,
  source text NOT NULL DEFAULT 'nsfwjs-client',
  banned_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_events
  ADD COLUMN IF NOT EXISTS banned_until timestamptz,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'nsfwjs-client';

CREATE UNIQUE INDEX IF NOT EXISTS waiting_users_user_id_unique ON public.waiting_users (user_id);
CREATE INDEX IF NOT EXISTS waiting_users_queue_idx ON public.waiting_users (created_at ASC);
CREATE INDEX IF NOT EXISTS match_history_user_idx ON public.match_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS match_history_partner_idx ON public.match_history (partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_history_open ON public.match_history (created_at DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS moderation_events_user_idx ON public.moderation_events (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.moderation_events TO authenticated;
GRANT INSERT ON public.moderation_events TO anon;
GRANT ALL ON public.moderation_events TO service_role;
GRANT ALL ON public.waiting_users TO service_role;
GRANT ALL ON public.match_history TO service_role;
GRANT SELECT ON public.match_history TO authenticated;

ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own moderation events readable" ON public.moderation_events;
CREATE POLICY "own moderation events readable"
  ON public.moderation_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "moderation events insertable" ON public.moderation_events;
CREATE POLICY "moderation events insertable"
  ON public.moderation_events FOR INSERT TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "match_history_self_select" ON public.match_history;
CREATE POLICY "match_history_self_select"
  ON public.match_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

DROP FUNCTION IF EXISTS public.atomic_match_user(uuid, text);
DROP FUNCTION IF EXISTS public.atomic_match_user(uuid, text, uuid);

CREATE FUNCTION public.atomic_match_user(
  p_user_id uuid,
  p_language text DEFAULT 'en',
  p_exclude_partner uuid DEFAULT NULL
)
RETURNS TABLE (room_name text, partner_id uuid, is_rematch boolean)
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

  DELETE FROM public.waiting_users
  WHERE created_at < now() - interval '2 minutes';

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
      true;
    RETURN;
  END IF;

  SELECT w.user_id INTO v_partner
  FROM public.waiting_users w
  WHERE w.user_id <> p_user_id
    AND (p_exclude_partner IS NULL OR w.user_id <> p_exclude_partner)
    AND w.created_at > now() - interval '2 minutes'
  ORDER BY
    (w.language IS NOT DISTINCT FROM COALESCE(NULLIF(trim(p_language), ''), 'en')) DESC,
    w.created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_partner IS NULL AND p_exclude_partner IS NOT NULL THEN
    SELECT w.user_id INTO v_partner
    FROM public.waiting_users w
    WHERE w.user_id <> p_user_id
      AND w.created_at > now() - interval '2 minutes'
    ORDER BY w.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1;
  END IF;

  IF v_partner IS NULL THEN
    INSERT INTO public.waiting_users (user_id, language, created_at)
    VALUES (p_user_id, COALESCE(NULLIF(trim(p_language), ''), 'en'), now())
    ON CONFLICT (user_id) DO UPDATE
      SET language = EXCLUDED.language, created_at = now();
    RETURN;
  END IF;

  DELETE FROM public.waiting_users WHERE user_id IN (p_user_id, v_partner);

  v_room := 'caakus_' || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.match_history (user_id, partner_id, room_name, created_at)
  VALUES (p_user_id, v_partner, v_room, now());

  RETURN QUERY SELECT v_room, v_partner, false;
END;
$$;

CREATE OR REPLACE FUNCTION public.end_match_for_user(
  p_user_id uuid,
  p_partner_id uuid DEFAULT NULL,
  p_duration_seconds integer DEFAULT 0
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.match_history
     SET ended_at = COALESCE(ended_at, now())
   WHERE ended_at IS NULL
     AND (user_id = p_user_id OR partner_id = p_user_id)
     AND (
       p_partner_id IS NULL
       OR (user_id = p_user_id AND partner_id = p_partner_id)
       OR (user_id = p_partner_id AND partner_id = p_user_id)
     );

  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM public.waiting_users WHERE user_id = p_user_id;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_waiting_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  DELETE FROM public.waiting_users WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.atomic_match_user(uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.end_match_for_user(uuid, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_waiting_user(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.atomic_match_user(uuid, text, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.end_match_for_user(uuid, uuid, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_waiting_user(uuid) TO anon, authenticated, service_role;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.match_history;
EXCEPTION WHEN duplicate_object OR undefined_object THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';