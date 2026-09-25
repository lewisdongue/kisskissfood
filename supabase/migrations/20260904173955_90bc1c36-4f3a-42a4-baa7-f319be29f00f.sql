CREATE TABLE IF NOT EXISTS public.waiting_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.waiting_users
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS last_seen timestamptz NOT NULL DEFAULT now();

GRANT ALL ON public.waiting_users TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS waiting_users_user_id_unique ON public.waiting_users (user_id);
CREATE INDEX IF NOT EXISTS waiting_users_queue_idx ON public.waiting_users (created_at ASC);
CREATE INDEX IF NOT EXISTS waiting_users_alive_idx ON public.waiting_users (last_seen DESC);
CREATE INDEX IF NOT EXISTS waiting_users_lang_idx ON public.waiting_users (language, created_at ASC);

CREATE INDEX IF NOT EXISTS match_history_pair_idx ON public.match_history (user_id, partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS match_history_pair_rev_idx ON public.match_history (partner_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS match_history_open_user_idx ON public.match_history (user_id, created_at DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS match_history_open_partner_idx ON public.match_history (partner_id, created_at DESC) WHERE ended_at IS NULL;

DROP FUNCTION IF EXISTS public.atomic_match_user(uuid, text);
DROP FUNCTION IF EXISTS public.atomic_match_user(uuid, text, uuid);
DROP FUNCTION IF EXISTS public.atomic_match_user(uuid, text, uuid, text, boolean);

CREATE FUNCTION public.atomic_match_user(
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

CREATE OR REPLACE FUNCTION public.heartbeat_waiting_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.waiting_users SET last_seen = now() WHERE user_id = p_user_id;
END;
$fn$;

REVOKE ALL ON FUNCTION public.atomic_match_user(uuid, text, uuid, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.heartbeat_waiting_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.atomic_match_user(uuid, text, uuid, text, boolean) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.heartbeat_waiting_user(uuid) TO anon, authenticated, service_role;