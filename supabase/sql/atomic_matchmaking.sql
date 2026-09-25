-- ============================================================================
-- CAAKUS — MATCHMAKING ATOMIQUE, AUTO-RÉPARATEUR ET ANTI-COLLISION (v3)
-- ============================================================================
-- Script 100% idempotent : peut être exécuté autant de fois que nécessaire,
-- sur n'importe quel projet Supabase (production, staging, preview).
-- Il :
--   1. crée/répare les tables waiting_users, match_history, moderation_events
--      (colonnes manquantes ajoutées automatiquement) ;
--   2. crée les index de file d'attente (dont l'index unique user_id) ;
--   3. crée les RPC atomic_match_user / end_match_for_user /
--      cleanup_waiting_user (toutes SECURITY DEFINER, compatibles invités) ;
--   4. accorde les droits à anon + authenticated + service_role
--      (parité totale entre utilisateurs inscrits et invités) ;
--   5. active Realtime sur match_history ;
--   6. recharge le cache PostgREST (supprime les erreurs 404 / PGRST202).
-- ============================================================================

-- ============================================================================
-- 1. TABLES + AUTO-RÉPARATION DES COLONNES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waiting_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waiting_users
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.match_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  room_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer NOT NULL DEFAULT 0,
  ended_at timestamptz
);

ALTER TABLE public.match_history
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS duration_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

UPDATE public.match_history SET started_at = created_at WHERE started_at IS NULL;
ALTER TABLE public.match_history
  ALTER COLUMN started_at SET DEFAULT now(),
  ALTER COLUMN started_at SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_name text,
  reason text NOT NULL,
  source text NOT NULL DEFAULT 'nsfwjs-client',
  banned_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_events
  ADD COLUMN IF NOT EXISTS banned_until timestamptz,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'nsfwjs-client';

-- ============================================================================
-- 2. INDEX (vitesse < 200 ms et ON CONFLICT)
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS waiting_users_user_id_unique
  ON public.waiting_users (user_id);

CREATE INDEX IF NOT EXISTS waiting_users_queue_idx
  ON public.waiting_users (created_at ASC);

CREATE INDEX IF NOT EXISTS match_history_user_idx
  ON public.match_history (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS match_history_partner_idx
  ON public.match_history (partner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_history_open
  ON public.match_history (created_at DESC) WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_match_history_started_at
  ON public.match_history (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_history_open_calls
  ON public.match_history (started_at DESC) WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS moderation_events_user_idx
  ON public.moderation_events (user_id, created_at DESC);

-- ============================================================================
-- 3. RLS + GRANTS (invités = mêmes droits que les comptes)
-- ============================================================================

GRANT SELECT, INSERT ON public.moderation_events TO authenticated;
GRANT INSERT ON public.moderation_events TO anon;
GRANT ALL ON public.moderation_events TO service_role;
GRANT ALL ON public.waiting_users TO service_role;
GRANT ALL ON public.match_history TO service_role;
GRANT SELECT ON public.match_history TO authenticated, anon;

ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own moderation events readable" ON public.moderation_events;
CREATE POLICY "own moderation events readable"
  ON public.moderation_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "moderation events insertable" ON public.moderation_events;
CREATE POLICY "moderation events insertable"
  ON public.moderation_events FOR INSERT TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "match_history_self_select" ON public.match_history;
CREATE POLICY "match_history_self_select"
  ON public.match_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Les invités ne lisent que la salle en cours, via la RPC (SECURITY DEFINER),
-- donc aucune policy anon permissive n'est nécessaire sur la file d'attente.

-- ============================================================================
-- 4. RPC — MATCHING ATOMIQUE ANTI-COLLISION
-- ============================================================================

DROP FUNCTION IF EXISTS public.atomic_match_user(uuid, text);
DROP FUNCTION IF EXISTS public.atomic_match_user(uuid, text, uuid);

CREATE FUNCTION public.atomic_match_user(
  p_user_id uuid,
  p_language text DEFAULT 'en',
  p_exclude_partner uuid DEFAULT NULL
)
RETURNS TABLE (room_name text, partner_id uuid, is_rematch boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner uuid;
  v_room text;
  v_existing record;
BEGIN
  -- Un compte connecté ne peut matcher que pour lui-même ; les invités
  -- (auth.uid() IS NULL) passent avec leur identifiant local.
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  -- Verrou par utilisateur : un "tsunami" de clics sur Next ne crée jamais
  -- deux matchs simultanés. Libéré automatiquement en fin de transaction.
  IF NOT pg_try_advisory_xact_lock(hashtextextended(p_user_id::text, 0)) THEN
    RETURN;
  END IF;

  -- Purge des files fantômes (onglets fermés, réseaux coupés).
  DELETE FROM public.waiting_users
  WHERE created_at < now() - interval '2 minutes';

  -- Reconnexion instantanée si un match est déjà ouvert pour cet utilisateur.
  SELECT mh.user_id, mh.partner_id, mh.room_name
    INTO v_existing
  FROM public.match_history mh
  WHERE mh.ended_at IS NULL
    AND mh.created_at > now() - interval '2 minutes'
    AND (mh.user_id = p_user_id OR mh.partner_id = p_user_id)
  ORDER BY mh.created_at DESC
  LIMIT 1;

  IF v_existing.room_name IS NOT NULL THEN
    RETURN QUERY SELECT
      v_existing.room_name,
      CASE WHEN v_existing.user_id = p_user_id
           THEN v_existing.partner_id ELSE v_existing.user_id END,
      true;
    RETURN;
  END IF;

  -- Sélection + verrouillage d'un seul partenaire. SKIP LOCKED garantit que
  -- deux chercheurs concurrents ne réclament jamais la même personne.
  -- Priorité : même langue d'abord, puis le plus ancien de la file.
  SELECT w.user_id INTO v_partner
  FROM public.waiting_users w
  WHERE w.user_id <> p_user_id
    AND (p_exclude_partner IS NULL OR w.user_id <> p_exclude_partner)
    AND w.created_at > now() - interval '2 minutes'
  ORDER BY
    (w.language IS NOT DISTINCT FROM COALESCE(NULLIF(trim(p_language), ''), 'en')) DESC,
    w.created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  -- Si le seul candidat était l'ancien partenaire, on l'accepte plutôt que
  -- de laisser l'utilisateur bloqué dans une file vide.
  IF v_partner IS NULL AND p_exclude_partner IS NOT NULL THEN
    SELECT w.user_id INTO v_partner
    FROM public.waiting_users w
    WHERE w.user_id <> p_user_id
      AND w.created_at > now() - interval '2 minutes'
    ORDER BY w.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1;
  END IF;

  -- File vide : inscription idempotente (aucun doublon possible).
  IF v_partner IS NULL THEN
    INSERT INTO public.waiting_users (user_id, language, created_at)
    VALUES (p_user_id, COALESCE(NULLIF(trim(p_language), ''), 'en'), now())
    ON CONFLICT (user_id) DO UPDATE
      SET language = EXCLUDED.language, created_at = now();
    RETURN;
  END IF;

  DELETE FROM public.waiting_users WHERE user_id IN (p_user_id, v_partner);

  v_room := 'caakus_' || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.match_history (user_id, partner_id, room_name, created_at)
  VALUES (p_user_id, v_partner, v_room, now());

  RETURN QUERY SELECT v_room, v_partner, false;
END;
$$;

-- ============================================================================
-- 5. RPC — FIN D'APPEL (Next / raccrochage)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.end_match_for_user(
  p_user_id uuid,
  p_partner_id uuid DEFAULT NULL,
  p_duration_seconds integer DEFAULT 0
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  -- WHERE obligatoire : jamais d'UPDATE global (erreur
  -- "UPDATE requires a WHERE clause").
  UPDATE public.match_history
     SET ended_at = COALESCE(ended_at, now()),
         duration_seconds = GREATEST(duration_seconds, GREATEST(COALESCE(p_duration_seconds, 0), 0))
   WHERE ended_at IS NULL
     AND (user_id = p_user_id OR partner_id = p_user_id)
     AND (
       p_partner_id IS NULL
       OR (user_id = p_user_id AND partner_id = p_partner_id)
       OR (user_id = p_partner_id AND partner_id = p_user_id)
     );

  GET DIAGNOSTICS v_count = ROW_COUNT;

  DELETE FROM public.waiting_users WHERE user_id = p_user_id;

  RETURN v_count;
END;
$$;

-- ============================================================================
-- 6. RPC — SORTIE DE FILE D'ATTENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_waiting_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  DELETE FROM public.waiting_users WHERE user_id = p_user_id;
END;
$$;

-- ============================================================================
-- 7. AUTORISATIONS RPC (invités inclus)
-- ============================================================================

REVOKE ALL ON FUNCTION public.atomic_match_user(uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.end_match_for_user(uuid, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_waiting_user(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.atomic_match_user(uuid, text, uuid)
  TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.end_match_for_user(uuid, uuid, integer)
  TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_waiting_user(uuid)
  TO anon, authenticated, service_role;

-- ============================================================================
-- 8. REALTIME + RECHARGEMENT DU CACHE API
-- ============================================================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.match_history;
EXCEPTION WHEN duplicate_object OR undefined_object THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
