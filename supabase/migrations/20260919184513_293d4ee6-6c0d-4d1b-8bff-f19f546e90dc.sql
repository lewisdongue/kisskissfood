ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referral_premium_expires_at timestamptz;

ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS credited_at timestamptz;

CREATE TABLE IF NOT EXISTS public.referral_campaigns (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  target integer NOT NULL CHECK (target IN (5, 10, 50)),
  start_referral_count integer NOT NULL DEFAULT 0 CHECK (start_referral_count >= 0),
  completed_cycles integer NOT NULL DEFAULT 0 CHECK (completed_cycles >= 0),
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.referral_campaigns TO authenticated;
GRANT ALL ON public.referral_campaigns TO service_role;
ALTER TABLE public.referral_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS referral_campaigns_own_read ON public.referral_campaigns;
CREATE POLICY referral_campaigns_own_read ON public.referral_campaigns FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.viral_clip_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  room_name text NOT NULL,
  amount integer NOT NULL DEFAULT 50 CHECK (amount = 50),
  started_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  UNIQUE (user_id, room_name)
);
GRANT SELECT ON public.viral_clip_rewards TO authenticated;
GRANT ALL ON public.viral_clip_rewards TO service_role;
ALTER TABLE public.viral_clip_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS viral_clip_rewards_own_read ON public.viral_clip_rewards;
CREATE POLICY viral_clip_rewards_own_read ON public.viral_clip_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.start_referral_campaign(p_target integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_uid uuid := auth.uid(); v_count integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF p_target NOT IN (5,10,50) THEN RAISE EXCEPTION 'Invalid referral target'; END IF;
  SELECT count(*)::integer INTO v_count FROM public.referrals WHERE referrer_id = v_uid AND credited_at IS NOT NULL;
  INSERT INTO public.referral_campaigns(user_id,target,start_referral_count,started_at,updated_at)
  VALUES(v_uid,p_target,v_count,now(),now())
  ON CONFLICT(user_id) DO UPDATE SET target=excluded.target,start_referral_count=v_count,started_at=now(),updated_at=now();
  RETURN jsonb_build_object('target',p_target,'progress',0,'verified_referrals',v_count);
END; $$;

CREATE OR REPLACE FUNCTION public.get_referral_unlock_status()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE v_uid uuid := auth.uid(); v_count integer; v_campaign public.referral_campaigns%ROWTYPE; v_expiry timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT count(*)::integer INTO v_count FROM public.referrals WHERE referrer_id=v_uid AND credited_at IS NOT NULL;
  SELECT * INTO v_campaign FROM public.referral_campaigns WHERE user_id=v_uid;
  SELECT referral_premium_expires_at INTO v_expiry FROM public.users WHERE id=v_uid;
  RETURN jsonb_build_object(
    'verified_referrals',v_count,
    'target',COALESCE(v_campaign.target,1),
    'progress',CASE WHEN v_campaign.user_id IS NULL THEN least(v_count,1) ELSE greatest(0,v_count-v_campaign.start_referral_count) END,
    'premium_expires_at',v_expiry,
    'completed_cycles',COALESCE(v_campaign.completed_cycles,0)
  );
END; $$;

CREATE OR REPLACE FUNCTION public.register_verified_referral(p_ref text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_uid uuid := auth.uid(); v_referrer uuid; v_confirmed timestamptz; v_inserted uuid;
  v_count integer; v_campaign public.referral_campaigns%ROWTYPE; v_bonus_days integer := 1; v_expiry timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF p_ref IS NULL OR btrim(p_ref) = '' THEN RETURN public.get_referral_unlock_status(); END IF;
  SELECT email_confirmed_at INTO v_confirmed FROM auth.users WHERE id=v_uid;
  IF v_confirmed IS NULL THEN RAISE EXCEPTION 'Verified account required'; END IF;
  SELECT id INTO v_referrer FROM public.users
   WHERE id::text=btrim(p_ref) OR upper(referral_code)=upper(btrim(p_ref)) LIMIT 1;
  IF v_referrer IS NULL THEN RAISE EXCEPTION 'Invalid referral'; END IF;
  IF v_referrer=v_uid THEN RAISE EXCEPTION 'Self referral is not allowed'; END IF;

  INSERT INTO public.referrals(referrer_id,referred_user_id,bonus_awarded,verified_at,credited_at)
  VALUES(v_referrer,v_uid,true,v_confirmed,now())
  ON CONFLICT(referred_user_id) DO NOTHING RETURNING id INTO v_inserted;

  IF v_inserted IS NOT NULL THEN
    SELECT count(*)::integer INTO v_count FROM public.referrals WHERE referrer_id=v_referrer AND credited_at IS NOT NULL;
    SELECT * INTO v_campaign FROM public.referral_campaigns WHERE user_id=v_referrer FOR UPDATE;
    IF v_campaign.user_id IS NOT NULL AND v_count-v_campaign.start_referral_count >= v_campaign.target THEN
      v_bonus_days := v_bonus_days + 30;
      UPDATE public.referral_campaigns SET start_referral_count=v_count,completed_cycles=completed_cycles+1,started_at=now(),updated_at=now() WHERE user_id=v_referrer;
    END IF;
    UPDATE public.users SET referral_premium_expires_at = greatest(COALESCE(referral_premium_expires_at,now()),now()) + make_interval(days=>v_bonus_days)
     WHERE id=v_referrer RETURNING referral_premium_expires_at INTO v_expiry;
  ELSE
    SELECT referral_premium_expires_at INTO v_expiry FROM public.users WHERE id=v_referrer;
  END IF;
  RETURN jsonb_build_object('credited',v_inserted IS NOT NULL,'days_added',CASE WHEN v_inserted IS NULL THEN 0 ELSE v_bonus_days END,'premium_expires_at',v_expiry);
END; $$;

CREATE OR REPLACE FUNCTION public.begin_viral_clip_reward(p_room_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid:=auth.uid(); v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF p_room_name IS NULL OR btrim(p_room_name)='' THEN RAISE EXCEPTION 'Room required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.match_history WHERE room_name=p_room_name AND (user_id=v_uid OR partner_id=v_uid)) THEN RAISE EXCEPTION 'Invalid match'; END IF;
  INSERT INTO public.viral_clip_rewards(user_id,room_name) VALUES(v_uid,p_room_name)
  ON CONFLICT(user_id,room_name) DO UPDATE SET room_name=excluded.room_name
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.claim_viral_clip_reward(p_reward_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid:=auth.uid(); v_amount integer; v_balance integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE public.viral_clip_rewards SET claimed_at=now()
   WHERE id=p_reward_id AND user_id=v_uid AND claimed_at IS NULL AND started_at <= now()-interval '3 seconds'
   RETURNING amount INTO v_amount;
  IF v_amount IS NULL THEN RETURN jsonb_build_object('credited',false); END IF;
  UPDATE public.users SET yuyu_score=yuyu_score+v_amount WHERE id=v_uid RETURNING yuyu_score INTO v_balance;
  RETURN jsonb_build_object('credited',true,'amount',v_amount,'balance',v_balance);
END; $$;

GRANT EXECUTE ON FUNCTION public.start_referral_campaign(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_unlock_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_verified_referral(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.begin_viral_clip_reward(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_viral_clip_reward(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.start_referral_campaign(integer) FROM anon;
REVOKE ALL ON FUNCTION public.get_referral_unlock_status() FROM anon;
REVOKE ALL ON FUNCTION public.register_verified_referral(text) FROM anon;
REVOKE ALL ON FUNCTION public.begin_viral_clip_reward(text) FROM anon;
REVOKE ALL ON FUNCTION public.claim_viral_clip_reward(uuid) FROM anon;