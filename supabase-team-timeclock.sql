-- =============================================
-- BADGEUSE
-- Temps de présence quotidien, par personne
-- Distinct du chronomètre de tâche, qui impute du temps à un projet.
-- =============================================

CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  note TEXT,
  /** Saisie manuelle a posteriori plutôt qu'un vrai badge */
  is_manual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT work_session_order CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Une seule présence ouverte à la fois par personne
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_open_session
  ON work_sessions(profile_id) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_work_sessions_day
  ON work_sessions(profile_id, started_at DESC);

-- ============================================
-- BADGER
-- ============================================

-- Bascule : ouvre une présence s'il n'y en a pas, la ferme sinon.
CREATE OR REPLACE FUNCTION punch(p_note TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me UUID := auth.uid();
  open_session work_sessions;
  minutes NUMERIC;
BEGIN
  IF me IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Session expirée');
  END IF;

  SELECT * INTO open_session FROM work_sessions
   WHERE profile_id = me AND ended_at IS NULL
   ORDER BY started_at DESC LIMIT 1;

  IF FOUND THEN
    UPDATE work_sessions SET ended_at = now(), note = COALESCE(p_note, note)
     WHERE id = open_session.id;
    minutes := ROUND(EXTRACT(EPOCH FROM (now() - open_session.started_at)) / 60.0);
    RETURN jsonb_build_object('ok', true, 'action', 'out', 'minutes', minutes);
  END IF;

  INSERT INTO work_sessions (profile_id, note) VALUES (me, p_note);
  RETURN jsonb_build_object('ok', true, 'action', 'in');
END $$;

-- Une présence oubliée la veille ne doit pas courir indéfiniment :
-- on la clôt à minuit plutôt que de compter la nuit entière.
CREATE OR REPLACE FUNCTION close_stale_sessions()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE closed INTEGER;
BEGIN
  UPDATE work_sessions
     SET ended_at = date_trunc('day', started_at) + INTERVAL '23 hours 59 minutes',
         note = COALESCE(note || ' · ', '') || 'clôturée automatiquement, départ non badgé'
   WHERE ended_at IS NULL
     AND started_at < date_trunc('day', now());
  GET DIAGNOSTICS closed = ROW_COUNT;
  RETURN closed;
END $$;

-- ============================================
-- TOTAUX PAR JOUR ET PAR PERSONNE
-- ============================================

CREATE OR REPLACE VIEW work_days AS
  SELECT
    w.profile_id,
    (w.started_at AT TIME ZONE 'Europe/Paris')::DATE AS day,
    SUM(EXTRACT(EPOCH FROM (COALESCE(w.ended_at, now()) - w.started_at)) / 3600.0)::NUMERIC(6,2) AS hours,
    COUNT(*) AS sessions,
    MIN(w.started_at) AS first_in,
    MAX(COALESCE(w.ended_at, now())) AS last_out,
    bool_or(w.ended_at IS NULL) AS is_open
  FROM work_sessions w
  GROUP BY w.profile_id, (w.started_at AT TIME ZONE 'Europe/Paris')::DATE;

ALTER VIEW work_days SET (security_invoker = on);
GRANT SELECT ON work_days TO authenticated;

-- ============================================
-- SÉCURITÉ
-- ============================================

ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;

-- L'équipe voit le temps de chacun : c'est l'intérêt d'une badgeuse partagée
DROP POLICY IF EXISTS "Team reads sessions" ON work_sessions;
CREATE POLICY "Team reads sessions" ON work_sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Mais chacun ne badge que pour lui-même
DROP POLICY IF EXISTS "Own session insert" ON work_sessions;
CREATE POLICY "Own session insert" ON work_sessions
  FOR INSERT WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Own session update" ON work_sessions;
CREATE POLICY "Own session update" ON work_sessions
  FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Own session delete" ON work_sessions;
CREATE POLICY "Own session delete" ON work_sessions
  FOR DELETE USING (profile_id = auth.uid());

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE work_sessions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
