ALTER TABLE public.match_history
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration_seconds integer NOT NULL DEFAULT 0;

UPDATE public.match_history
SET started_at = created_at
WHERE started_at IS NULL;

ALTER TABLE public.match_history
  ALTER COLUMN started_at SET DEFAULT now(),
  ALTER COLUMN started_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_match_history_started_at
  ON public.match_history (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_history_open_calls
  ON public.match_history (started_at DESC)
  WHERE ended_at IS NULL;

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
     SET ended_at = COALESCE(ended_at, now()),
         duration_seconds = GREATEST(duration_seconds, GREATEST(COALESCE(p_duration_seconds, 0), 0))
   WHERE ended_at IS NULL
     AND (user_id = p_user_id OR partner_id = p_user_id)
     AND (
       p_partner_id IS NULL
       OR (user_id = p_user_id AND partner_id = p_partner_id)
       OR (user_id = p_partner_id AND partner_id = p_user_id)
     );

  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM public.waiting_users
  WHERE user_id = p_user_id;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.end_match_for_user(uuid, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.end_match_for_user(uuid, uuid, integer)
  TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';