-- =============================================
-- LOT CLIENT & DOCUMENTS
-- Fichiers réels · Espace client · Accès et environnements
-- =============================================

-- ============================================
-- 1. FICHIERS RÉELS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-files', 'project-files', false, 26214400)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE project_files ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS size_bytes BIGINT;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Le type 'upload' distingue un vrai fichier d'un simple lien collé
ALTER TABLE project_files DROP CONSTRAINT IF EXISTS project_files_file_type_check;
ALTER TABLE project_files ADD CONSTRAINT project_files_file_type_check
  CHECK (file_type IN ('link', 'figma', 'drive', 'github', 'upload', 'other'));

DROP POLICY IF EXISTS "Team reads project files" ON storage.objects;
CREATE POLICY "Team reads project files" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team uploads project files" ON storage.objects;
CREATE POLICY "Team uploads project files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team deletes project files" ON storage.objects;
CREATE POLICY "Team deletes project files" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);

-- ============================================
-- 2. ACCÈS ET ENVIRONNEMENTS DU PROJET
-- ============================================

CREATE TABLE IF NOT EXISTS project_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('production', 'staging', 'registrar', 'dns', 'hosting', 'repository', 'analytics', 'other')),
  label TEXT NOT NULL,
  url TEXT,
  username TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_environments_project ON project_environments(project_id);

-- ============================================
-- 3. ESPACE CLIENT
-- ============================================

CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('quote', 'invoice', 'project')),
  entity_id UUID NOT NULL,
  label TEXT,
  allow_accept BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '60 days'),
  revoked_at TIMESTAMPTZ,
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  responded_at TIMESTAMPTZ,
  response TEXT CHECK (response IN ('accepted', 'rejected')),
  response_name TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_links_entity ON share_links(entity_type, entity_id);

-- Un lien est valide s'il n'est ni révoqué ni expiré
CREATE OR REPLACE FUNCTION share_link_is_valid(l share_links)
RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
  SELECT l.revoked_at IS NULL AND (l.expires_at IS NULL OR l.expires_at > now());
$$;

-- Journalise la réponse du client et fait suivre le statut du document
CREATE OR REPLACE FUNCTION record_share_response(p_token TEXT, p_response TEXT, p_name TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  link share_links;
  recipient RECORD;
  doc_label TEXT;
BEGIN
  SELECT * INTO link FROM share_links WHERE token = p_token;
  IF NOT FOUND OR NOT share_link_is_valid(link) OR NOT link.allow_accept THEN
    RETURN jsonb_build_object('ok', false, 'error', 'lien invalide');
  END IF;
  IF p_response NOT IN ('accepted', 'rejected') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'réponse inconnue');
  END IF;

  UPDATE share_links
     SET responded_at = now(), response = p_response, response_name = p_name
   WHERE id = link.id;

  IF link.entity_type = 'quote' THEN
    UPDATE quotes
       SET status = CASE WHEN p_response = 'accepted' THEN 'accepted' ELSE 'rejected' END,
           accepted_at = CASE WHEN p_response = 'accepted' THEN now() ELSE NULL END
     WHERE id = link.entity_id;
  END IF;

  doc_label := entity_label(link.entity_type, link.entity_id);

  FOR recipient IN SELECT id FROM profiles WHERE is_active AND role IN ('owner', 'manager') LOOP
    INSERT INTO notifications (recipient_id, actor_id, type, entity_type, entity_id, title, body, link)
    VALUES (recipient.id, NULL, 'activity', link.entity_type, link.entity_id,
            COALESCE(p_name, 'Le client') ||
            CASE WHEN p_response = 'accepted' THEN ' a accepté ' ELSE ' a refusé ' END ||
            COALESCE(doc_label, 'un document'),
            'Réponse reçue depuis l''espace client',
            entity_link(link.entity_type, link.entity_id));
  END LOOP;

  INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
  VALUES (NULL, link.entity_type, link.entity_id,
          entity_project(link.entity_type, link.entity_id), 'client_response',
          COALESCE(p_name, 'Le client') ||
          CASE WHEN p_response = 'accepted' THEN ' a accepté ' ELSE ' a refusé ' END ||
          COALESCE(doc_label, 'un document'));

  RETURN jsonb_build_object('ok', true);
END $$;

-- ============================================
-- 4. SÉCURITÉ
-- ============================================

ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_environments ENABLE ROW LEVEL SECURITY;

-- Les liens ne se lisent que depuis le back-office ; le public passe par la fonction serveur
DROP POLICY IF EXISTS "Team manages share links" ON share_links;
CREATE POLICY "Team manages share links" ON share_links
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Les accès techniques restent réservés à ceux qui pilotent
DROP POLICY IF EXISTS "Managers handle environments" ON project_environments;
CREATE POLICY "Managers handle environments" ON project_environments
  FOR ALL USING (current_user_role() IN ('owner', 'manager'))
  WITH CHECK (current_user_role() IN ('owner', 'manager'));

DROP TRIGGER IF EXISTS set_updated_at_environments ON project_environments;
CREATE TRIGGER set_updated_at_environments
  BEFORE UPDATE ON project_environments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE share_links;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
