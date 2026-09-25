-- Enable RLS on matchmaking tables
ALTER TABLE public.waiting_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

-- Authenticated users can remove themselves from the queue when they disconnect
DROP POLICY IF EXISTS "waiting_users_self_delete" ON public.waiting_users;
CREATE POLICY "waiting_users_self_delete"
  ON public.waiting_users FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can view their own match history rows
DROP POLICY IF EXISTS "match_history_self_select" ON public.match_history;
CREATE POLICY "match_history_self_select"
  ON public.match_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Secure helper to remove any user from the queue (used by guests / anon sessions too)
CREATE OR REPLACE FUNCTION public.cleanup_waiting_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.waiting_users WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_waiting_user(uuid) TO authenticated, anon, service_role;