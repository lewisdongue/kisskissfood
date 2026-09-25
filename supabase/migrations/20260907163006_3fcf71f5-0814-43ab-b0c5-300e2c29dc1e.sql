CREATE TABLE IF NOT EXISTS public.safety_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  block_friend_requests BOOLEAN NOT NULL DEFAULT false,
  invisible_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.safety_preferences TO authenticated;
GRANT ALL ON public.safety_preferences TO service_role;

ALTER TABLE public.safety_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own safety preferences" ON public.safety_preferences;
CREATE POLICY "Users manage own safety preferences"
ON public.safety_preferences FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';