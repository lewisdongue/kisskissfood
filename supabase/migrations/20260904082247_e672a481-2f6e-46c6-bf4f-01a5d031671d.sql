CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bonus_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referrals_distinct_users CHECK (referrer_id <> referred_user_id),
  CONSTRAINT referrals_referred_user_unique UNIQUE (referred_user_id)
);
GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY referrals_participants_read ON public.referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
CREATE POLICY referrals_referred_user_insert ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referred_user_id);
CREATE INDEX referrals_referrer_idx ON public.referrals(referrer_id, created_at DESC);

CREATE TABLE public.online_users (
  user_id uuid PRIMARY KEY,
  language text NOT NULL DEFAULT 'en',
  last_seen timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.online_users TO authenticated;
GRANT ALL ON public.online_users TO service_role;
ALTER TABLE public.online_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY online_users_authenticated_read ON public.online_users
  FOR SELECT TO authenticated USING (last_seen > now() - interval '5 minutes');
CREATE POLICY online_users_own_insert ON public.online_users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY online_users_own_update ON public.online_users
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY online_users_own_delete ON public.online_users
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX online_users_language_seen_idx ON public.online_users(language, last_seen DESC);

CREATE TABLE public.yuyu_coins_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_usd numeric(10,2) NOT NULL,
  yuyu_coins integer NOT NULL,
  stripe_price_id text,
  description text,
  icon_key text,
  is_active boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  bonus_percentage numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT yuyu_packages_positive_price CHECK (price_usd > 0 AND price_usd <= 300),
  CONSTRAINT yuyu_packages_positive_coins CHECK (yuyu_coins > 0)
);
GRANT SELECT ON public.yuyu_coins_packages TO anon, authenticated;
GRANT ALL ON public.yuyu_coins_packages TO service_role;
ALTER TABLE public.yuyu_coins_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY yuyu_packages_public_active_read ON public.yuyu_coins_packages
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE TRIGGER yuyu_coins_packages_touch_updated_at
  BEFORE UPDATE ON public.yuyu_coins_packages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.yuyu_coins_packages
  (name, price_usd, yuyu_coins, description, icon_key, is_active, is_popular, sort_order, bonus_percentage)
VALUES
  ('Starter', 4.99, 500, 'A quick YUYU boost', 'spark', true, false, 1, 0),
  ('Popular', 14.99, 1650, 'More YUYU with a 10% bonus', 'flame', true, true, 2, 10),
  ('Power', 49.99, 6000, 'Built for active Caakus members', 'bolt', true, false, 3, 20),
  ('Elite', 99.99, 13000, 'Maximum YUYU value', 'crown', true, false, 4, 30);