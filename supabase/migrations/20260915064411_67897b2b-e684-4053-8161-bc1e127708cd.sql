-- 1. yuyu_id on users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS yuyu_id varchar(10);

CREATE OR REPLACE FUNCTION public.generate_yuyu_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_candidate text;
  v_i int;
BEGIN
  LOOP
    v_candidate := 'YY-';
    FOR v_i IN 1..6 LOOP
      v_candidate := v_candidate || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users u WHERE u.yuyu_id = v_candidate);
  END LOOP;
  RETURN v_candidate;
END;
$$;

-- backfill existing rows
UPDATE public.users SET yuyu_id = public.generate_yuyu_id() WHERE yuyu_id IS NULL;

ALTER TABLE public.users ALTER COLUMN yuyu_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_yuyu_id_key'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_yuyu_id_key UNIQUE (yuyu_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.trigger_generate_yuyu_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.yuyu_id IS NULL OR NEW.yuyu_id = '' THEN
    NEW.yuyu_id := public.generate_yuyu_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_yuyu_id ON public.users;
CREATE TRIGGER trigger_generate_yuyu_id
BEFORE INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.trigger_generate_yuyu_id();

-- 2. ledger
CREATE TABLE IF NOT EXISTS public.yuyu_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_uuid uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_uuid uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS yuyu_ledger_sender_idx ON public.yuyu_ledger (sender_uuid, created_at DESC);
CREATE INDEX IF NOT EXISTS yuyu_ledger_receiver_idx ON public.yuyu_ledger (receiver_uuid, created_at DESC);

GRANT SELECT ON public.yuyu_ledger TO authenticated;
GRANT ALL ON public.yuyu_ledger TO service_role;

ALTER TABLE public.yuyu_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS yuyu_ledger_participants_read ON public.yuyu_ledger;
CREATE POLICY yuyu_ledger_participants_read ON public.yuyu_ledger
FOR SELECT TO authenticated
USING (auth.uid() = sender_uuid OR auth.uid() = receiver_uuid);

-- 3. atomic transfer
CREATE OR REPLACE FUNCTION public.transfer_yuyu(sender_id uuid, recipient_yuyu_id text, amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance numeric;
  v_receiver uuid;
  v_code text := upper(trim(recipient_yuyu_id));
BEGIN
  IF auth.uid() IS DISTINCT FROM sender_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF amount IS NULL OR amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be a positive whole number';
  END IF;

  IF v_code !~ '^YY-[A-Z0-9]{6}$' THEN
    v_code := 'YY-' || regexp_replace(v_code, '^YY-', '');
  END IF;

  SELECT u.id INTO v_receiver FROM public.users u WHERE u.yuyu_id = v_code;
  IF v_receiver IS NULL THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;
  IF v_receiver = sender_id THEN
    RAISE EXCEPTION 'You cannot send Yuyu to yourself';
  END IF;

  SELECT u.yuyu_score INTO v_balance FROM public.users u WHERE u.id = sender_id FOR UPDATE;
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Sender not found';
  END IF;
  IF v_balance < amount THEN
    RAISE EXCEPTION 'Insufficient Yuyu balance';
  END IF;

  UPDATE public.users SET yuyu_score = yuyu_score - amount WHERE id = sender_id;
  UPDATE public.users SET yuyu_score = yuyu_score + amount WHERE id = v_receiver;

  INSERT INTO public.yuyu_ledger (sender_uuid, receiver_uuid, amount)
  VALUES (sender_id, v_receiver, amount);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_yuyu(uuid, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.transfer_yuyu(uuid, text, integer) TO authenticated;