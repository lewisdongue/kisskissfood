GRANT SELECT ON public.match_history TO authenticated;
GRANT ALL ON public.match_history TO service_role;

GRANT INSERT ON public.moderation_events TO anon, authenticated;
GRANT SELECT ON public.moderation_events TO authenticated;
GRANT ALL ON public.moderation_events TO service_role;

GRANT ALL ON public.waiting_users TO service_role;

NOTIFY pgrst, 'reload schema';