CREATE OR REPLACE VIEW public.yuyu_leaderboard
WITH (security_invoker = off) AS
SELECT
  u.id,
  u.name,
  u.country,
  u.yuyu_score,
  u.hide_picture,
  CASE WHEN u.hide_picture THEN NULL ELSE u.profile_picture END AS profile_picture,
  ROW_NUMBER() OVER (ORDER BY u.yuyu_score DESC, u.created_at ASC)::int AS rank
FROM public.users u
WHERE u.yuyu_score > 0
ORDER BY u.yuyu_score DESC
LIMIT 100;

GRANT SELECT ON public.yuyu_leaderboard TO anon, authenticated;
GRANT ALL ON public.yuyu_leaderboard TO service_role;