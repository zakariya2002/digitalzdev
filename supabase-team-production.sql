-- =============================================
-- LOT PRODUCTION
-- Jalons · Sous-tâches · Bugs · Chronomètre · Rentabilité
-- Relances côté serveur · Assainissement
-- =============================================

-- ============================================
-- 1. JALONS DE PROJET
-- ============================================

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'at_risk', 'reached', 'missed')),
  is_client_commitment BOOLEAN DEFAULT true,
  reached_at TIMESTAMPTZ,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id, due_date);

-- ============================================
-- 2. SOUS-TÂCHES ET CHECKLIST DE RECETTE
-- ============================================

CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  done_at TIMESTAMPTZ,
  done_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id, position);

-- Points de recette d'un projet : ce qu'on vérifie avant de livrer
CREATE TABLE IF NOT EXISTS acceptance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'fonctionnel' CHECK (category IN ('fonctionnel', 'design', 'contenu', 'technique', 'seo', 'legal')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'ok', 'ko')),
  note TEXT,
  checked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  checked_at TIMESTAMPTZ,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acceptance_project ON acceptance_checks(project_id, position);

-- ============================================
-- 3. BUGS DISTINCTS DES TÂCHES
-- ============================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'task' CHECK (kind IN ('task', 'bug'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS severity TEXT CHECK (severity IN ('critical', 'major', 'minor'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS steps_to_reproduce TEXT;
CREATE INDEX IF NOT EXISTS idx_tasks_kind ON tasks(kind, status);

-- ============================================
-- 4. CHRONOMÈTRE ET RENTABILITÉ
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 50;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Un chronomètre en cours par personne
CREATE TABLE IF NOT EXISTS active_timers (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  description TEXT,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Cumul d'heures atomique : deux saisies simultanées ne s'écrasent plus
CREATE OR REPLACE FUNCTION add_task_hours(p_task_id UUID, p_hours DECIMAL)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE tasks SET actual_hours = COALESCE(actual_hours, 0) + p_hours WHERE id = p_task_id;
$$;

-- Arrête le chronomètre et convertit la durée en entrée de temps
CREATE OR REPLACE FUNCTION stop_timer(p_note TEXT DEFAULT NULL)
RETURNS TABLE (hours DECIMAL, task_id UUID)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t RECORD;
  elapsed DECIMAL;
BEGIN
  SELECT * INTO t FROM active_timers WHERE profile_id = auth.uid();
  IF NOT FOUND THEN RETURN; END IF;

  elapsed := ROUND(EXTRACT(EPOCH FROM (now() - t.started_at)) / 3600.0, 2);
  IF elapsed < 0.01 THEN elapsed := 0.01; END IF;

  INSERT INTO time_entries (task_id, project_id, profile_id, hours, description, date, started_at, ended_at)
  VALUES (t.task_id, t.project_id, t.profile_id, elapsed,
          COALESCE(p_note, t.description), CURRENT_DATE, t.started_at, now());

  PERFORM add_task_hours(t.task_id, elapsed);
  DELETE FROM active_timers WHERE profile_id = auth.uid();

  RETURN QUERY SELECT elapsed, t.task_id;
END $$;

-- ============================================
-- 5. RÉORDONNANCEMENT DES CARTES
-- ============================================

-- Déplace une carte à une position précise dans une colonne et resserre les rangs
CREATE OR REPLACE FUNCTION move_task(p_task_id UUID, p_status TEXT, p_position INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  old_status TEXT;
  proj UUID;
BEGIN
  SELECT status, project_id INTO old_status, proj FROM tasks WHERE id = p_task_id;

  UPDATE tasks
     SET status = p_status,
         position = p_position,
         completed_at = CASE WHEN p_status = 'done' THEN now() ELSE NULL END
   WHERE id = p_task_id;

  -- Laisse la place dans la colonne d'arrivée
  UPDATE tasks SET position = position + 1
   WHERE status = p_status AND id <> p_task_id AND position >= p_position
     AND (proj IS NULL OR project_id IS NOT DISTINCT FROM proj);

  -- Renumérote proprement les deux colonnes touchées
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY status ORDER BY position, updated_at) - 1 AS rn
      FROM tasks
     WHERE status IN (p_status, old_status)
       AND (proj IS NULL OR project_id IS NOT DISTINCT FROM proj)
  )
  UPDATE tasks t SET position = r.rn FROM ranked r WHERE t.id = r.id AND t.position <> r.rn;
END $$;

-- ============================================
-- 6. RELANCES CÔTÉ SERVEUR
-- ============================================

-- Rejoue les règles d'automatisation et dépose de vraies notifications.
-- Ne dépend plus de quelqu'un qui ouvre le dashboard.
CREATE OR REPLACE FUNCTION run_automation_rules()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rule RECORD;
  target RECORD;
  recipient RECORD;
  message TEXT;
  cutoff TIMESTAMPTZ;
  created_count INTEGER := 0;
BEGIN
  FOR rule IN SELECT * FROM automation_rules WHERE is_active LOOP
    cutoff := now() - (rule.trigger_delay_days || ' days')::INTERVAL;

    FOR target IN
      SELECT * FROM (
        -- Leads sans activité
        SELECT c.id, c.name AS label, NULL::TEXT AS number, 'client'::TEXT AS etype
          FROM clients c
         WHERE rule.trigger_type = 'lead_no_activity'
           AND c.status IN ('new_lead', 'contacted')
           AND (c.last_contacted_at IS NULL OR c.last_contacted_at < cutoff)
        UNION ALL
        -- Devis sans réponse
        SELECT q.id, COALESCE(cl.name, ''), q.quote_number, 'quote'
          FROM quotes q LEFT JOIN clients cl ON cl.id = q.client_id
         WHERE rule.trigger_type = 'quote_no_response'
           AND q.status = 'sent' AND q.sent_at < cutoff
        UNION ALL
        -- Factures impayées
        SELECT i.id, COALESCE(cl.name, ''), i.invoice_number, 'invoice'
          FROM invoices i LEFT JOIN clients cl ON cl.id = i.client_id
         WHERE rule.trigger_type = 'invoice_overdue'
           AND i.status IN ('sent', 'partial') AND i.due_date < cutoff::DATE
        UNION ALL
        -- Relances datées
        SELECT c.id, c.name, NULL, 'client'
          FROM clients c
         WHERE rule.trigger_type = 'follow_up_due'
           AND c.next_follow_up_at IS NOT NULL AND c.next_follow_up_at <= now()
        UNION ALL
        -- Jalons qui approchent ou qui sont dépassés
        SELECT m.id, p.name, m.title, 'project'
          FROM milestones m JOIN projects p ON p.id = m.project_id
         WHERE rule.trigger_type = 'project_milestone'
           AND m.status IN ('planned', 'at_risk')
           AND m.due_date <= (CURRENT_DATE + rule.trigger_delay_days)
      ) t
    LOOP
      -- Une seule relance par règle et par objet toutes les 24 h
      IF EXISTS (
        SELECT 1 FROM automation_logs
         WHERE rule_id = rule.id AND entity_id = target.id
           AND executed_at > now() - INTERVAL '1 day'
      ) THEN CONTINUE; END IF;

      message := rule.action_template;
      message := replace(message, '{{name}}', COALESCE(target.label, ''));
      message := replace(message, '{{client_name}}', COALESCE(target.label, ''));
      message := replace(message, '{{quote_number}}', COALESCE(target.number, ''));
      message := replace(message, '{{invoice_number}}', COALESCE(target.number, ''));
      message := replace(message, '{{milestone}}', COALESCE(target.number, ''));

      INSERT INTO automation_logs (rule_id, entity_type, entity_id, action_taken, success)
      VALUES (rule.id, target.etype, target.id, message, true);

      -- Les relances commerciales concernent ceux qui pilotent
      FOR recipient IN SELECT id FROM profiles WHERE is_active AND role IN ('owner', 'manager') LOOP
        INSERT INTO notifications (recipient_id, actor_id, type, entity_type, entity_id, title, body, link)
        VALUES (recipient.id, NULL, 'activity', target.etype, target.id,
                message, rule.name, entity_link(target.etype, target.id));
        created_count := created_count + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN created_count;
END $$;

-- ============================================
-- 7. COMPTABILITÉ UNIFIÉE
-- ============================================

-- Une seule source de vérité : les encaissements réels, plus les revenus
-- saisis à la main qui ne correspondent à aucune facture.
CREATE OR REPLACE VIEW revenue_ledger AS
  SELECT
    p.id,
    i.project_id,
    p.amount,
    COALESCE('Facture ' || i.invoice_number, 'Encaissement') AS description,
    date_trunc('month', p.paid_at)::DATE AS month,
    p.paid_at AS occurred_at,
    'payment'::TEXT AS source
  FROM payments p
  LEFT JOIN invoices i ON i.id = p.invoice_id
UNION ALL
  SELECT r.id, r.project_id, r.amount, COALESCE(r.description, 'Revenu manuel'),
         date_trunc('month', r.month)::DATE, r.created_at, 'manual'
  FROM revenues r;

-- ============================================
-- 8. JALONS ET RECETTE DANS LE JOURNAL
-- ============================================

CREATE OR REPLACE FUNCTION log_milestone_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), 'project', NEW.project_id, NEW.project_id, 'created',
            'a posé le jalon « ' || NEW.title ||' » au ' || to_char(NEW.due_date, 'DD/MM/YYYY'));
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), 'project', NEW.project_id, NEW.project_id, 'status_changed',
            'a marqué le jalon « ' || NEW.title || ' » comme ' ||
            CASE NEW.status WHEN 'reached' THEN 'atteint' WHEN 'missed' THEN 'manqué'
                            WHEN 'at_risk' THEN 'à risque' ELSE 'prévu' END);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_milestone_activity ON milestones;
CREATE TRIGGER on_milestone_activity
  AFTER INSERT OR UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION log_milestone_activity();

DROP TRIGGER IF EXISTS set_updated_at_milestones ON milestones;
CREATE TRIGGER set_updated_at_milestones
  BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 9. SÉCURITÉ
-- ============================================

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceptance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_timers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team full access" ON milestones;
CREATE POLICY "Team full access" ON milestones
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team full access" ON subtasks;
CREATE POLICY "Team full access" ON subtasks
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team full access" ON acceptance_checks;
CREATE POLICY "Team full access" ON acceptance_checks
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Chacun ne pilote que son propre chronomètre
DROP POLICY IF EXISTS "Own timer" ON active_timers;
CREATE POLICY "Own timer" ON active_timers
  FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- ============================================
-- 10. TEMPS RÉEL
-- ============================================

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE subtasks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE acceptance_checks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
