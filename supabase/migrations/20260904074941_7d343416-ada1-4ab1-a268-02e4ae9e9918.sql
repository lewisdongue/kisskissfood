DROP VIEW IF EXISTS public.yuyu_leaderboard;

CREATE TABLE public.yuyu_leaderboard (
  user_id uuid PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL,
  yuyu_score numeric NOT NULL DEFAULT 0,
  rank bigint NOT NULL,
  profile_picture text
);
GRANT SELECT ON public.yuyu_leaderboard TO anon, authenticated;
GRANT ALL ON public.yuyu_leaderboard TO service_role;
ALTER TABLE public.yuyu_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY yuyu_leaderboard_public_read ON public.yuyu_leaderboard
  FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.refresh_yuyu_leaderboard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.yuyu_leaderboard;
  INSERT INTO public.yuyu_leaderboard(user_id,name,country,yuyu_score,rank,profile_picture)
  SELECT
    u.id,
    u.name,
    u.country,
    u.yuyu_score,
    row_number() OVER (ORDER BY u.yuyu_score DESC, u.created_at ASC),
    CASE WHEN u.hide_picture THEN NULL ELSE u.profile_picture END
  FROM public.users u
  WHERE u.yuyu_score > 0
  ORDER BY u.yuyu_score DESC, u.created_at ASC
  LIMIT 100;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.refresh_yuyu_leaderboard() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_yuyu_leaderboard() TO service_role;

DROP TRIGGER IF EXISTS users_refresh_yuyu_leaderboard ON public.users;
CREATE TRIGGER users_refresh_yuyu_leaderboard
AFTER INSERT OR DELETE OR UPDATE OF name,country,yuyu_score,profile_picture,hide_picture ON public.users
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_yuyu_leaderboard();

INSERT INTO public.yuyu_leaderboard(user_id,name,country,yuyu_score,rank,profile_picture)
SELECT
  u.id,
  u.name,
  u.country,
  u.yuyu_score,
  row_number() OVER (ORDER BY u.yuyu_score DESC, u.created_at ASC),
  CASE WHEN u.hide_picture THEN NULL ELSE u.profile_picture END
FROM public.users u
WHERE u.yuyu_score > 0
ORDER BY u.yuyu_score DESC, u.created_at ASC
LIMIT 100;
NOTIFY pgrst, 'reload schema';