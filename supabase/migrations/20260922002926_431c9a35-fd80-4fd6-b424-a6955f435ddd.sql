CREATE TABLE IF NOT EXISTS public.telegram_ad_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 20 CHECK (amount = 20),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  claimed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > started_at)
);

GRANT SELECT ON public.telegram_ad_rewards TO authenticated;
GRANT ALL ON public.telegram_ad_rewards TO service_role;

ALTER TABLE public.telegram_ad_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY telegram_ad_rewards_own_read
ON public.telegram_ad_rewards
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX telegram_ad_rewards_user_started_idx
ON public.telegram_ad_rewards (user_id, started_at DESC);

CREATE UNIQUE INDEX telegram_ad_rewards_one_open_idx
ON public.telegram_ad_rewards (user_id)
WHERE claimed_at IS NULL;

CREATE OR REPLACE FUNCTION public.touch_telegram_ad_reward_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER telegram_ad_rewards_touch_updated_at
BEFORE UPDATE ON public.telegram_ad_rewards
FOR EACH ROW EXECUTE FUNCTION public.touch_telegram_ad_reward_updated_at();

CREATE OR REPLACE FUNCTION public.begin_telegram_ad_reward()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_last_claim timestamptz;
  v_daily_count integer;
  v_retry integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_uid::text || ':telegram-ad', 0));

  SELECT max(claimed_at), count(*) FILTER (WHERE claimed_at >= date_trunc('day', now()))::integer
  INTO v_last_claim, v_daily_count
  FROM public.telegram_ad_rewards
  WHERE user_id = v_uid AND claimed_at IS NOT NULL;

  IF COALESCE(v_daily_count, 0) >= 10 THEN
    RETURN jsonb_build_object('eligible', false, 'retry_after_seconds', 86400);
  END IF;

  IF v_last_claim IS NOT NULL AND v_last_claim > now() - interval '30 minutes' THEN
    v_retry := greatest(1, ceil(extract(epoch FROM (v_last_claim + interval '30 minutes' - now())))::integer);
    RETURN jsonb_build_object('eligible', false, 'retry_after_seconds', v_retry);
  END IF;

  DELETE FROM public.telegram_ad_rewards
  WHERE user_id = v_uid AND claimed_at IS NULL AND expires_at <= now();

  SELECT id INTO v_id
  FROM public.telegram_ad_rewards
  WHERE user_id = v_uid AND claimed_at IS NULL
  ORDER BY started_at DESC
  LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.telegram_ad_rewards(user_id)
    VALUES (v_uid)
    RETURNING id INTO v_id;
  END IF;

  RETURN jsonb_build_object('eligible', true, 'reward_id', v_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_telegram_ad_reward(p_reward_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_amount integer;
  v_balance integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  UPDATE public.telegram_ad_rewards
  SET claimed_at = now()
  WHERE id = p_reward_id
    AND user_id = v_uid
    AND claimed_at IS NULL
    AND expires_at > now()
    AND started_at <= now() - interval '5 seconds'
  RETURNING amount INTO v_amount;

  IF v_amount IS NULL THEN
    RETURN jsonb_build_object('credited', false);
  END IF;

  UPDATE public.users
  SET yuyu_score = COALESCE(yuyu_score, 0) + v_amount
  WHERE id = v_uid
  RETURNING yuyu_score INTO v_balance;

  RETURN jsonb_build_object('credited', true, 'amount', v_amount, 'balance', v_balance);
END;
$$;

REVOKE ALL ON FUNCTION public.begin_telegram_ad_reward() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_telegram_ad_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.begin_telegram_ad_reward() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_telegram_ad_reward(uuid) TO authenticated;