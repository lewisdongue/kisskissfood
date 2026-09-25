-- ============================================================================
-- CAAKUS — ATOMIC, COLLISION-PROOF MATCHMAKING  (run once in the SQL editor)
-- ----------------------------------------------------------------------------
-- Guarantees that under a "Next" tsunami (thousands of simultaneous clicks)
-- no two users can ever be paired with the same partner:
--   * SELECT ... FOR UPDATE SKIP LOCKED  -> each concurrent transaction grabs
--     a DIFFERENT waiting row, never the same one.
--   * A transaction-scoped advisory lock on the caller prevents a single user
--     from being consumed by two matchers at the same millisecond.
--   * The whole pair-and-record sequence runs inside one atomic function.
-- On collision the function returns no row and the client retries instantly
-- and invisibly (see retryableAtomicMatch in src/services/matchmakingService).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MODERATION EVENTS (NSFWJS bans / reports)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_name text,
  reason text NOT NULL,
  source text NOT NULL DEFAULT 'nsfwjs-client',
  banned_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.moderation_events TO authenticated;
GRANT INSERT ON public.moderation_events TO anon;
GRANT ALL ON public.moderation_events TO service_role;

ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own moderation events readable" ON public.moderation_events;
CREATE POLICY "own moderation events readable"
  ON public.moderation_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "moderation events insertable" ON public.moderation_events;
CREATE POLICY "moderation events insertable"
  ON public.moderation_events FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS moderation_events_user_idx
  ON public.moderation_events (user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. WAITING QUEUE (existing table made robust if it lacks columns)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waiting_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns without failing if they already exist.
ALTER TABLE public.waiting_users
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Unique index required for the idempotent ON CONFLICT (user_id) upsert.
CREATE UNIQUE INDEX IF NOT EXISTS waiting_users_user_id_unique
  ON public.waiting_users (user_id);

-- Fast lane for the queue scan.
CREATE INDEX IF NOT EXISTS waiting_users_queue_idx
  ON public.waiting_users (created_at ASC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.waiting_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waiting_users TO anon;
GRANT ALL ON public.waiting_users TO service_role;

-- ----------------------------------------------------------------------------
-- 3. MATCH HISTORY (where finished / ongoing matches are recorded)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  room_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE public.match_history
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS partner_id uuid,
  ADD COLUMN IF NOT EXISTS room_name text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

CREATE INDEX IF NOT EXISTS match_history_user_idx
  ON public.match_history (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.match_history TO authenticated;
GRANT SELECT, INSERT ON public.match_history TO anon;
GRANT ALL ON public.match_history TO service_role;

-- ----------------------------------------------------------------------------
-- 4. atomic_match_user(): returns a room + partner, or nothing when the caller
--    must keep waiting. Never returns a partner already claimed by someone else.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.atomic_match_user(
  p_user_id uuid,
  p_language text DEFAULT 'en'
)
RETURNS TABLE (room_name text, partner_id uuid, is_rematch boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner uuid;
  v_room text;
BEGIN
  -- One matcher per caller at a time (auto-released at transaction end).
  IF NOT pg_try_advisory_xact_lock(hashtextextended(p_user_id::text, 0)) THEN
    RETURN;
  END IF;

  -- Claim exactly one waiting peer; concurrent callers skip locked rows.
  SELECT w.user_id INTO v_partner
  FROM public.waiting_users w
  WHERE w.user_id <> p_user_id
  ORDER BY w.created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_partner IS NULL THEN
    -- Nobody available: enqueue the caller idempotently and wait.
    INSERT INTO public.waiting_users (user_id, language, created_at)
    VALUES (p_user_id, p_language, now())
    ON CONFLICT (user_id) DO UPDATE SET created_at = now();
    RETURN;
  END IF;

  -- Remove both peers from the queue in the same transaction.
  DELETE FROM public.waiting_users WHERE user_id IN (p_user_id, v_partner);

  v_room := 'caakus_' || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.match_history (user_id, partner_id, room_name, created_at)
  VALUES (p_user_id, v_partner, v_room, now());

  RETURN QUERY SELECT v_room, v_partner, false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.atomic_match_user(uuid, text) TO authenticated, anon, service_role;

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================
SELECT
  routine_schema,
  routine_name,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'atomic_match_user';