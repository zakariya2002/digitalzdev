-- =============================================
-- CLOISONNEMENT PAR PROPRIÉTAIRE
-- Chacun ne voit que ce qui lui appartient, sauf ce qui est marqué
-- « Équipe » : le projet devient alors commun, et ce qui s'y rattache aussi.
-- =============================================

-- ============================================
-- 1. PROPRIÉTAIRE ET PORTÉE
-- ============================================

ALTER TABLE projects  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE clients   ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE quotes    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE invoices  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE tasks     ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE events    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE revenues  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

/** « private » : visible du seul propriétaire. « team » : visible de toute
 *  l'équipe active, ainsi que tout ce qui se rattache au projet. */
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'team'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'team'));

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id, visibility);
CREATE INDEX IF NOT EXISTS idx_clients_owner ON clients(owner_id, visibility);
CREATE INDEX IF NOT EXISTS idx_quotes_owner ON quotes(owner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_owner ON invoices(owner_id);

-- ============================================
-- 2. REPRISE DE L'EXISTANT
-- Tout ce qui existe revient au titulaire : c'est lui qui l'a saisi.
-- ============================================

DO $$
DECLARE owner_uid UUID;
BEGIN
  SELECT id INTO owner_uid FROM profiles WHERE role = 'owner' ORDER BY created_at LIMIT 1;
  IF owner_uid IS NULL THEN RAISE EXCEPTION 'Aucun titulaire : reprise annulée'; END IF;

  UPDATE projects  SET owner_id = COALESCE(owner_id, lead_id, owner_uid);
  UPDATE clients   SET owner_id = COALESCE(owner_id, owner_uid);
  UPDATE quotes    SET owner_id = COALESCE(owner_id, created_by, owner_uid);
  UPDATE invoices  SET owner_id = COALESCE(owner_id, created_by, owner_uid);
  UPDATE proposals SET owner_id = COALESCE(owner_id, owner_uid);
  UPDATE events    SET owner_id = COALESCE(owner_id, owner_uid);
  UPDATE revenues  SET owner_id = COALESCE(owner_id, owner_uid);
  -- Une tâche suit son projet ; sans projet, elle revient à son responsable
  UPDATE tasks t SET owner_id = COALESCE(t.owner_id, p.owner_id, t.assignee_id, owner_uid)
    FROM projects p WHERE p.id = t.project_id;
  UPDATE tasks SET owner_id = COALESCE(owner_id, assignee_id, owner_uid) WHERE owner_id IS NULL;
END $$;

-- ============================================
-- 3. QUI PEUT VOIR QUOI
-- Fonctions en SECURITY DEFINER : elles lisent les tables sans repasser
-- par les règles d'accès, ce qui évite toute récursion.
-- ============================================

CREATE OR REPLACE FUNCTION can_see_project(p_project UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects
     WHERE id = p_project
       AND (visibility = 'team' OR owner_id = auth.uid() OR owner_id IS NULL)
  );
$$;

CREATE OR REPLACE FUNCTION can_see_client(p_client UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM clients c
     WHERE c.id = p_client
       AND (
         c.visibility = 'team'
         OR c.owner_id = auth.uid()
         OR c.owner_id IS NULL
         -- Un client rattaché à un projet d'équipe devient visible de l'équipe
         OR EXISTS (
           SELECT 1 FROM projects p
            WHERE p.client_id = c.id AND p.visibility = 'team'
         )
       )
  );
$$;

/** Un document se voit si l'on en est propriétaire, ou s'il relève d'un
 *  projet d'équipe. */
CREATE OR REPLACE FUNCTION can_see_document(p_owner UUID, p_project UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p_owner IS NULL
      OR p_owner = auth.uid()
      OR (p_project IS NOT NULL AND EXISTS (
            SELECT 1 FROM projects WHERE id = p_project AND visibility = 'team'
         ));
$$;

-- ============================================
-- 5. ATTRIBUTION AUTOMATIQUE
-- ============================================

CREATE OR REPLACE FUNCTION set_owner_on_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN NEW.owner_id := auth.uid(); END IF;
  RETURN NEW;
END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects','clients','quotes','invoices','proposals','tasks','events','revenues'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_owner ON %I', t);
    EXECUTE format('CREATE TRIGGER set_owner BEFORE INSERT ON %I FOR EACH ROW EXECUTE FUNCTION set_owner_on_insert()', t);
  END LOOP;
END $$;

-- Un client rattaché à un projet d'équipe devient visible de l'équipe.
-- Cette fonction ne consulte que la table des projets : une règle de lecture
-- qui relirait sa propre table ne verrait pas la ligne qu'on vient d'y insérer.
CREATE OR REPLACE FUNCTION client_in_team_project(p_client UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM projects WHERE client_id = p_client AND visibility = 'team');
$$;

-- Les règles complètes, une par opération, figurent dans la base.
-- Voir pg_policies pour projects, clients, tasks, quotes, invoices,
-- proposals, events et revenues.
