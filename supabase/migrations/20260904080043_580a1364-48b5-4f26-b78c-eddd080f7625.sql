-- 1. CRITICAL FIX: unqualified DELETE inside the leaderboard trigger broke every write to users
CREATE OR REPLACE FUNCTION public.refresh_yuyu_leaderboard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.yuyu_leaderboard WHERE true;
  INSERT INTO public.yuyu_leaderboard(user_id,name,country,yuyu_score,rank,profile_picture)
  SELECT
    u.id, u.name, u.country, u.yuyu_score,
    row_number() OVER (ORDER BY u.yuyu_score DESC, u.created_at ASC),
    CASE WHEN u.hide_picture THEN NULL ELSE u.profile_picture END
  FROM public.users u
  WHERE u.yuyu_score > 0
  ORDER BY u.yuyu_score DESC, u.created_at ASC
  LIMIT 100;
  RETURN NULL;
END;
$function$;

-- 2. Progression columns expected by the app
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS total_xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date date,
  ADD COLUMN IF NOT EXISTS streak_recovery_used_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz,
  ADD COLUMN IF NOT EXISTS welcome_bonus_granted boolean NOT NULL DEFAULT false;

-- 3. Daily streak RPC
CREATE OR REPLACE FUNCTION public.update_daily_streak()
RETURNS TABLE(streak_count integer, last_streak_date date, streak_recovery_used_at timestamptz, level integer, level_progress numeric, total_xp integer, last_active_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := current_date;
  v_prev date;
  v_streak integer;
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;

  SELECT u.last_streak_date, u.streak_count INTO v_prev, v_streak
  FROM public.users u WHERE u.id = v_uid;

  IF NOT FOUND THEN RETURN; END IF;

  IF v_prev IS NULL OR v_prev < v_today - 1 THEN
    v_streak := 1;
  ELSIF v_prev = v_today - 1 THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := COALESCE(v_streak, 1);
  END IF;

  UPDATE public.users u SET
    streak_count = v_streak,
    last_streak_date = v_today,
    last_active_at = now(),
    total_xp = u.total_xp + CASE WHEN u.last_streak_date IS DISTINCT FROM v_today THEN 10 ELSE 0 END,
    level = GREATEST(1, 1 + ((u.total_xp + CASE WHEN u.last_streak_date IS DISTINCT FROM v_today THEN 10 ELSE 0 END) / 100))
  WHERE u.id = v_uid;

  RETURN QUERY
  SELECT u.streak_count, u.last_streak_date, u.streak_recovery_used_at, u.level,
         ((u.total_xp % 100)::numeric / 100), u.total_xp, u.last_active_at
  FROM public.users u WHERE u.id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.update_daily_streak() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_daily_streak() TO authenticated;

-- 4. One-time welcome bonus
CREATE OR REPLACE FUNCTION public.credit_welcome_bonus_yuyu(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_score numeric;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'unauthorized');
  END IF;

  UPDATE public.users
     SET welcome_bonus_granted = true,
         yuyu_score = yuyu_score + 100
   WHERE id = p_user_id AND welcome_bonus_granted = false
   RETURNING yuyu_score INTO v_score;

  IF v_score IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_granted');
  END IF;

  RETURN jsonb_build_object('granted', true, 'new_yuyu_score', v_score);
END;
$$;

REVOKE ALL ON FUNCTION public.credit_welcome_bonus_yuyu(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.credit_welcome_bonus_yuyu(uuid) TO authenticated;

-- 5. Live market stats used by the Invest in YUYU screen
CREATE OR REPLACE FUNCTION public.get_yuyu_live_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'active_users',        (SELECT count(*) FROM public.users WHERE last_active_at > now() - interval '15 minutes'),
    'total_members',       (SELECT count(*) FROM public.users),
    'daily_calls',         (SELECT count(*) FROM public.match_history WHERE created_at > now() - interval '24 hours'),
    'total_calls_today',   (SELECT count(*) FROM public.match_history WHERE created_at::date = current_date),
    'total_calls',         (SELECT count(*) FROM public.match_history),
    'daily_gifts',         (SELECT count(*) FROM public.gifts WHERE created_at > now() - interval '24 hours'),
    'total_gifts_today',   (SELECT count(*) FROM public.gifts WHERE created_at::date = current_date),
    'total_gifts_sent',    (SELECT count(*) FROM public.gifts),
    'users_waiting',       (SELECT count(*) FROM public.waiting_users),
    'users_in_call',       (SELECT count(*) FROM public.match_history WHERE ended_at IS NULL) * 2,
    'buy_volume_24h',      COALESCE((SELECT sum(amount_usd) FROM public.yuyu_transactions WHERE type = 'buy'  AND created_at > now() - interval '24 hours'), 0),
    'sell_volume_24h',     COALESCE((SELECT sum(amount_usd) FROM public.yuyu_transactions WHERE type = 'sell' AND created_at > now() - interval '24 hours'), 0),
    'yuyu_in_circulation', COALESCE((SELECT sum(yuyu_score) FROM public.users), 0),
    'current_price',       COALESCE((SELECT current_price FROM public.yuyu_price ORDER BY updated_at DESC LIMIT 1), 0.10),
    'price_24h_ago',       COALESCE((SELECT price FROM public.yuyu_price_history WHERE recorded_at <= now() - interval '24 hours' ORDER BY recorded_at DESC LIMIT 1), 0.10),
    'market_phase',        COALESCE((SELECT market_phase FROM public.yuyu_price ORDER BY updated_at DESC LIMIT 1), 'medium'),
    'momentum_direction',  COALESCE((SELECT momentum_direction FROM public.yuyu_price ORDER BY updated_at DESC LIMIT 1), 'neutral')
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_yuyu_live_stats() TO anon, authenticated;