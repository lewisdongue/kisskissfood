-- lovable-cron-fallback-reviewed: 1440 runs/day; le prix du yuyu doit fluctuer chaque minute comme une vraie crypto, aucun déclencheur par événement ne peut produire un tick continu et mean-reverting.
-- 1. Tables du moteur YUYU ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.yuyu_price (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_price numeric NOT NULL DEFAULT 0.10,
  market_phase text NOT NULL DEFAULT 'medium',
  momentum_direction text NOT NULL DEFAULT 'neutral',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.yuyu_price TO anon;
GRANT SELECT ON public.yuyu_price TO authenticated;
GRANT ALL ON public.yuyu_price TO service_role;
ALTER TABLE public.yuyu_price ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='yuyu_price' AND policyname='yuyu_price_public_read') THEN
    CREATE POLICY "yuyu_price_public_read" ON public.yuyu_price FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.yuyu_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price numeric NOT NULL,
  active_users integer NOT NULL DEFAULT 0,
  daily_calls integer NOT NULL DEFAULT 0,
  daily_gifts integer NOT NULL DEFAULT 0,
  buy_volume numeric NOT NULL DEFAULT 0,
  sell_volume numeric NOT NULL DEFAULT 0,
  market_phase text NOT NULL DEFAULT 'medium',
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.yuyu_price_history TO anon;
GRANT SELECT ON public.yuyu_price_history TO authenticated;
GRANT ALL ON public.yuyu_price_history TO service_role;
ALTER TABLE public.yuyu_price_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='yuyu_price_history' AND policyname='yuyu_price_history_public_read') THEN
    CREATE POLICY "yuyu_price_history_public_read" ON public.yuyu_price_history FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.yuyu_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('buy','sell')),
  amount numeric NOT NULL DEFAULT 0,
  amount_usd numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0.10,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.yuyu_transactions TO authenticated;
GRANT ALL ON public.yuyu_transactions TO service_role;
ALTER TABLE public.yuyu_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='yuyu_transactions' AND policyname='yuyu_transactions_self') THEN
    CREATE POLICY "yuyu_transactions_self" ON public.yuyu_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "yuyu_transactions_self_insert" ON public.yuyu_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  gift_type text NOT NULL DEFAULT 'heart',
  value numeric NOT NULL DEFAULT 0,
  room_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.gifts TO authenticated;
GRANT ALL ON public.gifts TO service_role;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gifts' AND policyname='gifts_participants') THEN
    CREATE POLICY "gifts_participants" ON public.gifts FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
    CREATE POLICY "gifts_sender_insert" ON public.gifts FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

-- 2. Prix de départ ancré à 0,10 $ --------------------------------------------
INSERT INTO public.yuyu_price (current_price, market_phase, momentum_direction)
SELECT 0.10, 'medium', 'neutral'
WHERE NOT EXISTS (SELECT 1 FROM public.yuyu_price);

-- 3. Moteur de prix dynamique --------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_yuyu_price()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anchor        numeric := 0.10;
  v_floor         numeric := 0.01;
  v_ceiling       numeric := 0.50;
  v_price         numeric;
  v_new_price     numeric;
  v_calls         integer := 0;
  v_gifts         integer := 0;
  v_buy_usd       numeric := 0;
  v_sell_usd      numeric := 0;
  v_waiting       integer := 0;
  v_in_call       integer := 0;
  v_activity      numeric;
  v_flow          numeric;
  v_demand        numeric;
  v_noise         numeric;
  v_max_move      numeric;
  v_delta         numeric;
  v_phase         text;
  v_direction     text;
BEGIN
  SELECT current_price INTO v_price FROM public.yuyu_price LIMIT 1 FOR UPDATE;
  v_price := COALESCE(v_price, v_anchor);

  SELECT count(*) INTO v_calls
  FROM public.match_history
  WHERE created_at > now() - interval '15 minutes';

  SELECT count(*) INTO v_gifts
  FROM public.gifts
  WHERE created_at > now() - interval '15 minutes';

  SELECT COALESCE(sum(amount_usd), 0) INTO v_buy_usd
  FROM public.yuyu_transactions
  WHERE type = 'buy' AND created_at > now() - interval '60 minutes';

  SELECT COALESCE(sum(amount_usd), 0) INTO v_sell_usd
  FROM public.yuyu_transactions
  WHERE type = 'sell' AND created_at > now() - interval '60 minutes';

  SELECT count(*) INTO v_waiting FROM public.waiting_users;

  SELECT count(*) INTO v_in_call
  FROM public.match_history
  WHERE ended_at IS NULL AND created_at > now() - interval '2 hours';

  v_activity := least(
    1.0,
    (v_calls::numeric / 60.0)
    + (v_gifts::numeric / 30.0)
    + (v_in_call::numeric / 80.0)
    + (v_waiting::numeric / 40.0)
    + (least(v_buy_usd + v_sell_usd, 5000)::numeric / 5000.0)
  );

  IF (v_buy_usd + v_sell_usd) > 0 THEN
    v_flow := (v_buy_usd - v_sell_usd) / (v_buy_usd + v_sell_usd);
  ELSE
    v_flow := 0;
  END IF;

  v_demand := (v_activity * 0.9 + v_flow * 1.6) * 0.012;
  v_noise := (random() - 0.5) * 2 * (0.0006 + v_activity * 0.018);
  v_delta := v_demand + v_noise
           + ((v_anchor * (1 + v_activity * 0.35) - v_price) / v_price) * 0.02;
  v_max_move := 0.0015 + v_activity * 0.038;
  v_delta := greatest(-v_max_move, least(v_max_move, v_delta));

  v_new_price := round(greatest(v_floor, least(v_ceiling, v_price * (1 + v_delta))), 8);

  v_direction := CASE
    WHEN v_new_price > v_price THEN 'up'
    WHEN v_new_price < v_price THEN 'down'
    ELSE 'neutral'
  END;

  v_phase := CASE
    WHEN v_activity >= 0.6 AND v_delta > 0 THEN 'explosive'
    WHEN v_delta < -0.004 THEN 'declining'
    ELSE 'medium'
  END;

  UPDATE public.yuyu_price
  SET current_price      = v_new_price,
      market_phase       = v_phase,
      momentum_direction = v_direction,
      updated_at         = now();

  INSERT INTO public.yuyu_price_history
    (price, active_users, daily_calls, daily_gifts, buy_volume, sell_volume, market_phase, recorded_at)
  VALUES
    (v_new_price, v_in_call + v_waiting, v_calls, v_gifts, v_buy_usd, v_sell_usd, v_phase, now());

  RETURN jsonb_build_object(
    'price', v_new_price,
    'previous_price', v_price,
    'delta_pct', round(v_delta * 100, 4),
    'activity', round(v_activity, 4),
    'flow', round(v_flow, 4),
    'calls_15m', v_calls,
    'gifts_15m', v_gifts,
    'buy_usd_60m', v_buy_usd,
    'sell_usd_60m', v_sell_usd,
    'market_cap', round(v_new_price * 8000000000, 2),
    'phase', v_phase
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_yuyu_price() TO service_role;

-- 4. Indexes performance -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_match_history_created_at  ON public.match_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_history_open_calls  ON public.match_history (created_at DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_yuyu_price_history_recent ON public.yuyu_price_history (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_yuyu_transactions_recent  ON public.yuyu_transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gifts_recent              ON public.gifts (created_at DESC);

-- 5. Recalcul automatique chaque minute ----------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'update-yuyu-price') THEN
    PERFORM cron.unschedule('update-yuyu-price');
  END IF;
END $$;
SELECT cron.schedule('update-yuyu-price', '* * * * *', $$SELECT public.update_yuyu_price();$$);

NOTIFY pgrst, 'reload schema';