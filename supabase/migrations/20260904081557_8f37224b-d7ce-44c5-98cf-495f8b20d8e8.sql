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
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.end_match_for_user(uuid, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.end_match_for_user(uuid, uuid, integer) TO anon, authenticated, service_role;

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

REVOKE ALL ON FUNCTION public.cleanup_waiting_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_waiting_user(uuid) TO anon, authenticated, service_role;