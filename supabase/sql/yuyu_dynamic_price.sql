-- ============================================================================
-- YUYU DYNAMIC PRICE ENGINE — activity-driven, BTC/ETH-like fluctuation
-- ----------------------------------------------------------------------------
-- Tokenomics
--   Circulating supply : 8,000,000,000 YUYU
--   Anchor price       : $0.10  → anchor market cap $800,000,000
--   Floor / ceiling    : $0.01 / $0.50 (hard safety rails)
--
-- The price re-computes every minute from REAL platform activity:
--   • calls started in the last 15 minutes      (demand / engagement)
--   • gifts sent in the last 15 minutes         (value burned into the economy)
--   • buy volume  (USD) in the last 60 minutes  (bid pressure)
--   • sell volume (USD) in the last 60 minutes  (ask pressure)
--   • users currently waiting / in call         (live liquidity of attention)
--   • inactivity decay pulling price back toward the anchor
--
-- Low activity  → micro-movements (< 0.15% per tick).
-- Activity spikes → large, visible moves (up to ±4% per tick), exactly like a
-- real crypto market, always mean-reverting toward the activity-weighted anchor.
-- Run this whole file in the SQL editor; it is idempotent and re-runnable.
-- ============================================================================

-- 1. Make sure the price row exists and starts at the anchor -----------------
INSERT INTO public.yuyu_price (current_price, market_phase, momentum_direction)
SELECT 0.10, 'medium', 'neutral'
WHERE NOT EXISTS (SELECT 1 FROM public.yuyu_price);

-- 2. The engine ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_yuyu_price()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anchor        numeric := 0.10;          -- $0.10 × 8B = $800M anchor market cap
  v_floor         numeric := 0.01;
  v_ceiling       numeric := 0.50;

  v_price         numeric;
  v_new_price     numeric;

  v_calls         integer := 0;             -- calls in the last 15 min
  v_gifts         integer := 0;             -- gifts in the last 15 min
  v_buy_usd       numeric := 0;             -- buy volume last 60 min
  v_sell_usd      numeric := 0;             -- sell volume last 60 min
  v_waiting       integer := 0;
  v_in_call       integer := 0;

  v_activity      numeric;                  -- 0 (dead) .. 1+ (viral)
  v_flow          numeric;                  -- -1 (sell pressure) .. +1 (buy pressure)
  v_demand        numeric;                  -- engagement-driven drift
  v_noise         numeric;                  -- market micro-volatility
  v_max_move      numeric;                  -- clamp for this tick
  v_delta         numeric;
  v_phase         text;
  v_direction     text;
BEGIN
  SELECT current_price INTO v_price FROM public.yuyu_price LIMIT 1 FOR UPDATE;
  v_price := COALESCE(v_price, v_anchor);

  -- ── Real platform activity ────────────────────────────────────────────────
  BEGIN
    SELECT count(*) INTO v_calls
    FROM public.match_history
    WHERE started_at > now() - interval '15 minutes';
  EXCEPTION WHEN undefined_table OR undefined_column THEN v_calls := 0; END;

  BEGIN
    SELECT count(*) INTO v_gifts
    FROM public.gifts
    WHERE created_at > now() - interval '15 minutes';
  EXCEPTION WHEN undefined_table OR undefined_column THEN v_gifts := 0; END;

  BEGIN
    SELECT COALESCE(sum(amount_usd), 0) INTO v_buy_usd
    FROM public.yuyu_transactions
    WHERE type = 'buy' AND created_at > now() - interval '60 minutes';
  EXCEPTION WHEN undefined_table OR undefined_column THEN v_buy_usd := 0; END;

  BEGIN
    SELECT COALESCE(sum(amount_usd), 0) INTO v_sell_usd
    FROM public.yuyu_transactions
    WHERE type = 'sell' AND created_at > now() - interval '60 minutes';
  EXCEPTION WHEN undefined_table OR undefined_column THEN v_sell_usd := 0; END;

  BEGIN
    SELECT count(*) INTO v_waiting FROM public.waiting_users;
  EXCEPTION WHEN undefined_table THEN v_waiting := 0; END;

  BEGIN
    SELECT count(*) INTO v_in_call
    FROM public.match_history
    WHERE ended_at IS NULL AND started_at > now() - interval '2 hours';
  EXCEPTION WHEN undefined_table OR undefined_column THEN v_in_call := 0; END;

  -- ── Normalised activity intensity (0 = silent, 1 = very busy) ─────────────
  v_activity := least(
    1.0,
    (v_calls::numeric / 60.0)
    + (v_gifts::numeric / 30.0)
    + (v_in_call::numeric / 80.0)
    + (v_waiting::numeric / 40.0)
    + (least(v_buy_usd + v_sell_usd, 5000)::numeric / 5000.0)
  );

  -- ── Net money flow: buys push up, sells push down ─────────────────────────
  IF (v_buy_usd + v_sell_usd) > 0 THEN
    v_flow := (v_buy_usd - v_sell_usd) / (v_buy_usd + v_sell_usd);
  ELSE
    v_flow := 0;
  END IF;

  -- ── Engagement demand: real usage slowly lifts the anchor ────────────────
  v_demand := (v_activity * 0.9 + v_flow * 1.6) * 0.012;         -- ±~2.2%/tick max

  -- ── Volatility scales with activity; a quiet market barely moves ─────────
  v_noise := (random() - 0.5) * 2 * (0.0006 + v_activity * 0.018);

  -- ── Mean reversion toward the activity-weighted anchor ───────────────────
  v_delta := v_demand
           + v_noise
           + ((v_anchor * (1 + v_activity * 0.35) - v_price) / v_price) * 0.02;

  -- ── Per-tick clamp: tiny when idle, wide during spikes ───────────────────
  v_max_move := 0.0015 + v_activity * 0.038;                      -- 0.15% .. 4%
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

  -- Historical tick (chart + 24h change)
  BEGIN
    INSERT INTO public.yuyu_price_history
      (price, active_users, daily_calls, daily_gifts, buy_volume, sell_volume, market_phase, recorded_at)
    VALUES
      (v_new_price, v_in_call + v_waiting, v_calls, v_gifts, v_buy_usd, v_sell_usd, v_phase, now());
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL; END;

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

-- 3. Indexes that keep the engine (and the app) fast under heavy load ---------
CREATE INDEX IF NOT EXISTS idx_match_history_started_at   ON public.match_history (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_history_open_calls   ON public.match_history (started_at DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_yuyu_price_history_recent  ON public.yuyu_price_history (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_waiting_users_joined_at    ON public.waiting_users (joined_at);

-- 4. Run it every minute ------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.unschedule('update-yuyu-price')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'update-yuyu-price');
SELECT cron.schedule('update-yuyu-price', '* * * * *', $$SELECT public.update_yuyu_price();$$);

NOTIFY pgrst, 'reload schema';
