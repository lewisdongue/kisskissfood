-- lovable-cron-fallback-reviewed: 1440 runs/day; official YUYU pricing needs a maximum 60-second reaction time to real calls, gifts, buys, and sells.
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Caakuser',
  country text NOT NULL DEFAULT 'Unknown',
  language text NOT NULL DEFAULT 'en',
  profile_picture text,
  yuyu_score numeric NOT NULL DEFAULT 0 CHECK (yuyu_score >= 0),
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  referral_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  referred_by text,
  hide_picture boolean NOT NULL DEFAULT false,
  is_premium boolean NOT NULL DEFAULT false,
  fcm_token text,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_select ON public.users;
CREATE POLICY users_own_select ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS users_own_insert ON public.users;
CREATE POLICY users_own_insert ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS users_own_update ON public.users;
CREATE POLICY users_own_update ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS users_own_delete ON public.users;
CREATE POLICY users_own_delete ON public.users FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  push_enabled boolean NOT NULL DEFAULT true,
  daily_reminders boolean NOT NULL DEFAULT true,
  timezone text NOT NULL DEFAULT 'UTC',
  max_notifications_per_day integer NOT NULL DEFAULT 8 CHECK (max_notifications_per_day BETWEEN 0 AND 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notification_preferences_own ON public.notification_preferences;
CREATE POLICY notification_preferences_own ON public.notification_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'daily_reminder',
  title text NOT NULL,
  message text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  slot_key text NOT NULL,
  local_day date NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','failed','cancelled')),
  attempts integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_day, slot_key)
);
GRANT SELECT ON public.notification_queue TO authenticated;
GRANT ALL ON public.notification_queue TO service_role;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notification_queue_own_read ON public.notification_queue;
CREATE POLICY notification_queue_own_read ON public.notification_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  delivery_status text,
  delivery_method text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_own_read ON public.notifications;
CREATE POLICY notifications_own_read ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS notifications_own_update ON public.notifications;
CREATE POLICY notifications_own_update ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS users_touch_updated_at ON public.users;
CREATE TRIGGER users_touch_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS notification_preferences_touch_updated_at ON public.notification_preferences;
CREATE TRIGGER notification_preferences_touch_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.enqueue_daily_notifications(p_user_id uuid, p_timezone text DEFAULT 'UTC')
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_day date; v_count integer := 0; v_limit integer := 8;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'Forbidden'; END IF;
  INSERT INTO public.notification_preferences(user_id, timezone) VALUES (p_user_id, COALESCE(NULLIF(p_timezone,''),'UTC'))
  ON CONFLICT(user_id) DO UPDATE SET timezone=excluded.timezone, updated_at=now();
  SELECT max_notifications_per_day INTO v_limit FROM public.notification_preferences WHERE user_id=p_user_id AND push_enabled AND daily_reminders;
  IF v_limit IS NULL OR v_limit = 0 THEN RETURN 0; END IF;
  v_day := (now() AT TIME ZONE p_timezone)::date;
  INSERT INTO public.notification_queue(user_id,type,title,message,data,slot_key,local_day,scheduled_for)
  SELECT p_user_id,'daily_reminder',s.title,s.message,jsonb_build_object('app_url','/call','slot',s.slot_key),s.slot_key,v_day,
         ((v_day + s.local_time) AT TIME ZONE p_timezone)
  FROM (VALUES
    (1,'morning-1','08:00'::time,'Good morning','Someone new is waiting to meet you on Caakus.'),
    (2,'morning-2','09:30'::time,'Daily bonus ready','Claim your YUYU bonus before it expires.'),
    (3,'noon-1','12:00'::time,'Lunch break?','One tap, one real human. Start a call now.'),
    (4,'noon-2','13:30'::time,'Keep your streak alive','A short call keeps your streak going.'),
    (5,'evening-1','18:00'::time,'Peak hours','People around the world are online now.'),
    (6,'evening-2','19:30'::time,'Meet someone new','Your next great conversation is one tap away.'),
    (7,'night-1','21:30'::time,'Late-night talks','Discover a new voice tonight.'),
    (8,'night-2','22:30'::time,'One last connection','End your day with someone new on Caakus.')
  ) AS s(slot_number,slot_key,local_time,title,message)
  WHERE s.slot_number <= v_limit
  ON CONFLICT(user_id,local_day,slot_key) DO NOTHING;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END; $$;
REVOKE ALL ON FUNCTION public.enqueue_daily_notifications(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enqueue_daily_notifications(uuid,text) TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.yuyu_transactions FROM authenticated, anon;
GRANT SELECT ON public.yuyu_transactions TO authenticated;
GRANT ALL ON public.yuyu_transactions TO service_role;

CREATE OR REPLACE FUNCTION public.buy_yuyu_at_market_price(p_user_id uuid, p_usd_amount numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_price numeric; v_fee numeric; v_yuyu numeric; v_balance numeric;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF p_usd_amount < 1 OR p_usd_amount > 1000 THEN RAISE EXCEPTION 'Amount must be between 1 and 1000 USD'; END IF;
  SELECT balance INTO v_balance FROM public.users WHERE id=p_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_usd_amount THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;
  SELECT current_price INTO v_price FROM public.yuyu_price LIMIT 1 FOR UPDATE;
  v_fee := round(p_usd_amount * 0.03, 8); v_yuyu := round((p_usd_amount-v_fee)/v_price, 8);
  UPDATE public.users SET balance=balance-p_usd_amount, yuyu_score=yuyu_score+v_yuyu WHERE id=p_user_id;
  INSERT INTO public.yuyu_transactions(user_id,type,amount,amount_usd,price) VALUES(p_user_id,'buy',v_yuyu,p_usd_amount,v_price);
  RETURN jsonb_build_object('success',true,'yuyu_received',v_yuyu,'fee_usd',v_fee,'price',v_price);
END; $$;
REVOKE ALL ON FUNCTION public.buy_yuyu_at_market_price(uuid,numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buy_yuyu_at_market_price(uuid,numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.sell_yuyu_at_market_price(p_user_id uuid, p_yuyu_amount numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_price numeric; v_gross numeric; v_fee numeric; v_net numeric; v_yuyu numeric;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF p_yuyu_amount < 5000 OR p_yuyu_amount > 100000 THEN RAISE EXCEPTION 'Amount must be between 5000 and 100000 YUYU'; END IF;
  SELECT yuyu_score INTO v_yuyu FROM public.users WHERE id=p_user_id FOR UPDATE;
  IF v_yuyu IS NULL OR v_yuyu < p_yuyu_amount THEN RAISE EXCEPTION 'Insufficient YUYU balance'; END IF;
  SELECT current_price INTO v_price FROM public.yuyu_price LIMIT 1 FOR UPDATE;
  v_gross := round(p_yuyu_amount*v_price,8); v_fee := round(v_gross*0.02,8); v_net := v_gross-v_fee;
  UPDATE public.users SET yuyu_score=yuyu_score-p_yuyu_amount, balance=balance+v_net WHERE id=p_user_id;
  INSERT INTO public.yuyu_transactions(user_id,type,amount,amount_usd,price) VALUES(p_user_id,'sell',p_yuyu_amount,v_gross,v_price);
  RETURN jsonb_build_object('success',true,'net_usd_received',v_net,'fee_usd',v_fee,'price',v_price);
END; $$;
REVOKE ALL ON FUNCTION public.sell_yuyu_at_market_price(uuid,numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sell_yuyu_at_market_price(uuid,numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_yuyu_price() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_anchor numeric:=0.10; v_floor numeric:=0.01; v_ceiling numeric:=0.50; v_price numeric; v_new numeric;
  v_calls integer:=0; v_gifts integer:=0; v_buy numeric:=0; v_sell numeric:=0; v_waiting integer:=0; v_in_call integer:=0;
  v_activity numeric:=0; v_flow numeric:=0; v_pressure numeric:=0; v_delta numeric:=0; v_cap numeric:=0.0015; v_phase text:='medium'; v_direction text:='neutral';
BEGIN
  SELECT current_price INTO v_price FROM public.yuyu_price LIMIT 1 FOR UPDATE; v_price:=COALESCE(NULLIF(v_price,0),v_anchor);
  SELECT count(*) INTO v_calls FROM public.match_history WHERE created_at>now()-interval '15 minutes';
  SELECT count(*) INTO v_gifts FROM public.gifts WHERE created_at>now()-interval '15 minutes';
  SELECT COALESCE(sum(amount_usd) FILTER(WHERE type='buy'),0),COALESCE(sum(amount_usd) FILTER(WHERE type='sell'),0) INTO v_buy,v_sell FROM public.yuyu_transactions WHERE created_at>now()-interval '60 minutes';
  SELECT count(*) INTO v_waiting FROM public.waiting_users;
  SELECT count(*) INTO v_in_call FROM public.match_history WHERE ended_at IS NULL AND created_at>now()-interval '2 hours';
  v_activity := (v_calls::numeric/60)+(v_gifts::numeric/30)+(v_in_call::numeric/80)+(v_waiting::numeric/40)+(least(v_buy+v_sell,50000)/5000);
  IF v_buy+v_sell>0 THEN v_flow:=(v_buy-v_sell)/(v_buy+v_sell); END IF;
  v_pressure := ln(1+greatest(v_activity,0));
  IF v_activity>=3 AND abs(v_flow)>=0.65 AND (v_buy+v_sell)>=10000 THEN
    v_phase:='explosive'; v_cap:=least(2.0,0.35+v_pressure*0.45); v_delta:=v_flow*v_cap+(random()-0.5)*0.12;
  ELSIF v_activity>=1 THEN
    v_phase:=CASE WHEN v_flow < -0.2 THEN 'declining' ELSE 'active' END; v_cap:=0.12; v_delta:=greatest(-v_cap,least(v_cap,v_flow*0.08+v_pressure*0.018+(random()-0.5)*0.025));
  ELSE
    v_phase:=CASE WHEN v_flow < -0.35 THEN 'declining' ELSE 'medium' END; v_cap:=0.012; v_delta:=greatest(-v_cap,least(v_cap,v_flow*0.008+(random()-0.5)*0.003+((v_anchor-v_price)/v_price)*0.01));
  END IF;
  v_new:=round(greatest(v_floor,least(v_ceiling,v_price*(1+v_delta))),8);
  v_direction:=CASE WHEN v_new>v_price THEN 'up' WHEN v_new<v_price THEN 'down' ELSE 'neutral' END;
  UPDATE public.yuyu_price SET current_price=v_new,market_phase=v_phase,momentum_direction=v_direction,updated_at=now();
  INSERT INTO public.yuyu_price_history(price,active_users,daily_calls,daily_gifts,buy_volume,sell_volume,market_phase,recorded_at) VALUES(v_new,v_in_call+v_waiting,v_calls,v_gifts,v_buy,v_sell,v_phase,now());
  RETURN jsonb_build_object('price',v_new,'previous_price',v_price,'delta_pct',round(v_delta*100,4),'activity',round(v_activity,4),'flow',round(v_flow,4),'calls_15m',v_calls,'gifts_15m',v_gifts,'buy_usd_60m',v_buy,'sell_usd_60m',v_sell,'market_cap',round(v_new*8000000000,2),'phase',v_phase);
END; $$;
REVOKE ALL ON FUNCTION public.update_yuyu_price() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_yuyu_price() TO service_role;

CREATE INDEX IF NOT EXISTS idx_match_history_created_at ON public.match_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_history_open ON public.match_history(created_at DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON public.gifts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yuyu_transactions_type_created ON public.yuyu_transactions(type,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yuyu_price_history_recorded ON public.yuyu_price_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_queue_due ON public.notification_queue(status,scheduled_for) WHERE status='pending';

SELECT cron.unschedule('update-yuyu-price') WHERE EXISTS(SELECT 1 FROM cron.job WHERE jobname='update-yuyu-price');
SELECT cron.schedule('update-yuyu-price','* * * * *',$$SELECT public.update_yuyu_price();$$);
NOTIFY pgrst, 'reload schema';