CREATE OR REPLACE FUNCTION public.update_yuyu_price()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_anchor numeric := 0.10;
  v_floor numeric := 0.01;
  v_ceiling numeric := 0.50;
  v_price numeric;
  v_new numeric;
  v_calls integer := 0;
  v_gifts integer := 0;
  v_gift_value numeric := 0;
  v_actives integer := 0;
  v_buy numeric := 0;
  v_sell numeric := 0;
  v_waiting integer := 0;
  v_in_call integer := 0;
  v_activity numeric := 0;
  v_baseline numeric := 0;
  v_momentum numeric := 0;
  v_flow numeric := 0;
  v_delta numeric := 0;
  v_cap numeric := 0.0015;
  v_phase text := 'medium';
  v_direction text := 'neutral';
BEGIN
  SELECT current_price INTO v_price FROM public.yuyu_price LIMIT 1 FOR UPDATE;
  v_price := COALESCE(NULLIF(v_price, 0), v_anchor);

  -- ---- Live human activity over the last 15 minutes -------------------
  SELECT count(*) INTO v_calls
    FROM public.match_history WHERE created_at > now() - interval '15 minutes';

  SELECT count(*), COALESCE(sum(value), 0) INTO v_gifts, v_gift_value
    FROM public.gifts WHERE created_at > now() - interval '15 minutes';

  SELECT count(*) INTO v_actives
    FROM public.users WHERE last_active_at > now() - interval '15 minutes';

  SELECT COALESCE(sum(amount_usd) FILTER (WHERE type = 'buy'), 0),
         COALESCE(sum(amount_usd) FILTER (WHERE type = 'sell'), 0)
    INTO v_buy, v_sell
    FROM public.yuyu_transactions WHERE created_at > now() - interval '60 minutes';

  SELECT count(*) INTO v_waiting FROM public.waiting_users;

  SELECT count(*) INTO v_in_call
    FROM public.match_history
   WHERE ended_at IS NULL AND created_at > now() - interval '2 hours';

  -- Weighted human-engagement score. Gifts weigh most (real money moved),
  -- then calls, then live presence.
  v_activity :=
      (v_calls::numeric / 60)
    + (v_gifts::numeric / 30)
    + (least(v_gift_value, 5000) / 2000)
    + (v_actives::numeric / 120)
    + (v_in_call::numeric / 80)
    + (v_waiting::numeric / 40)
    + (least(v_buy + v_sell, 50000) / 5000);

  -- ---- Baseline: what "normal" looked like over the last 24h ----------
  -- This is what makes the price fall when the community goes quiet,
  -- instead of only ever drifting upwards.
  SELECT COALESCE(avg((daily_calls::numeric / 60) + (daily_gifts::numeric / 30)), 0)
    INTO v_baseline
    FROM public.yuyu_price_history
   WHERE recorded_at > now() - interval '24 hours';

  v_momentum := greatest(-1, least(1,
    (v_activity - v_baseline) / greatest(v_baseline, 0.5)
  ));

  -- ---- Buy/sell pressure ---------------------------------------------
  IF v_buy + v_sell > 0 THEN
    v_flow := (v_buy - v_sell) / (v_buy + v_sell);
  END IF;

  -- ---- Phase selection -------------------------------------------------
  IF v_activity >= 3 AND abs(v_flow) >= 0.65 AND (v_buy + v_sell) >= 10000 THEN
    v_phase := 'explosive';
    v_cap := least(2.0, 0.35 + ln(1 + greatest(v_activity, 0)) * 0.45);
    v_delta := greatest(-v_cap, least(v_cap,
      v_flow * v_cap * 0.8 + v_momentum * v_cap * 0.2 + (random() - 0.5) * 0.12));
  ELSIF v_activity >= 1 THEN
    v_cap := 0.12;
    v_delta := greatest(-v_cap, least(v_cap,
      v_flow * 0.070 + v_momentum * 0.040 + (random() - 0.5) * 0.020));
    v_phase := CASE WHEN v_delta < -0.004 THEN 'declining' ELSE 'active' END;
  ELSE
    v_cap := 0.012;
    v_delta := greatest(-v_cap, least(v_cap,
      v_flow * 0.008
      + v_momentum * 0.006
      + (random() - 0.5) * 0.003
      + ((v_anchor - v_price) / v_price) * 0.010));
    v_phase := CASE WHEN v_delta < -0.0005 THEN 'declining' ELSE 'medium' END;
  END IF;

  v_new := round(greatest(v_floor, least(v_ceiling, v_price * (1 + v_delta))), 8);
  v_direction := CASE WHEN v_new > v_price THEN 'up' WHEN v_new < v_price THEN 'down' ELSE 'neutral' END;

  UPDATE public.yuyu_price
     SET current_price = v_new,
         market_phase = v_phase,
         momentum_direction = v_direction,
         updated_at = now();

  INSERT INTO public.yuyu_price_history
    (price, active_users, daily_calls, daily_gifts, buy_volume, sell_volume, market_phase, recorded_at)
  VALUES
    (v_new, GREATEST(v_actives, v_in_call + v_waiting), v_calls, v_gifts, v_buy, v_sell, v_phase, now());

  RETURN jsonb_build_object(
    'price', v_new,
    'previous_price', v_price,
    'delta_pct', round(v_delta * 100, 4),
    'activity', round(v_activity, 4),
    'baseline', round(v_baseline, 4),
    'momentum', round(v_momentum, 4),
    'flow', round(v_flow, 4),
    'calls_15m', v_calls,
    'gifts_15m', v_gifts,
    'gift_value_15m', v_gift_value,
    'active_users_15m', v_actives,
    'buy_usd_60m', v_buy,
    'sell_usd_60m', v_sell,
    'market_cap', round(v_new * 8000000000, 2),
    'phase', v_phase
  );
END;
$function$;