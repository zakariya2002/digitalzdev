-- =============================================
-- CONTENUS ATTENDUS DU CLIENT
-- Ce qu'on lui demande, ce qu'il dépose, et où ça atterrit
-- =============================================

CREATE TABLE IF NOT EXISTS content_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  /** Ce qu'on attend : un document, une information écrite, ou les deux */
  kind TEXT NOT NULL DEFAULT 'file' CHECK (kind IN ('file', 'text', 'both')),
  category TEXT NOT NULL DEFAULT 'contenu'
    CHECK (category IN ('identite', 'contenu', 'media', 'juridique', 'technique', 'autre')),
  is_required BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'received', 'validated', 'rejected')),
  /** Réponse écrite du client */
  response_text TEXT,
  /** Retour de l'équipe quand un élément est refusé */
  review_note TEXT,
  due_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  received_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_requests_project ON content_requests(project_id, position);

-- Les fichiers déposés rejoignent les documents du projet : une seule
-- bibliothèque, consultable depuis la fiche projet comme depuis la demande.
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS content_request_id UUID
  REFERENCES content_requests(id) ON DELETE SET NULL;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS uploaded_by_client BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS client_name TEXT;
CREATE INDEX IF NOT EXISTS idx_project_files_request ON project_files(content_request_id);

-- ============================================
-- TRAME TYPE PAR TYPE DE PROJET
-- ============================================

CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'file' CHECK (kind IN ('file', 'text', 'both')),
  category TEXT NOT NULL DEFAULT 'contenu',
  is_required BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0
);

INSERT INTO content_templates (project_type, label, description, kind, category, is_required, position) VALUES
  ('*', 'Logo', 'Version vectorielle si possible (SVG, AI ou EPS), sinon PNG sur fond transparent.', 'file', 'identite', true, 1),
  ('*', 'Charte graphique ou couleurs', 'Codes couleurs et polices, ou tout document de charte existant.', 'both', 'identite', false, 2),
  ('*', 'Coordonnées à afficher', 'Adresse, téléphone, e-mail de contact, horaires.', 'text', 'contenu', true, 3),
  ('*', 'Textes de présentation', 'Qui vous êtes, ce que vous proposez, ce qui vous distingue.', 'both', 'contenu', true, 4),
  ('*', 'Photos', 'Vos photos en bonne définition : équipe, locaux, réalisations.', 'file', 'media', true, 5),
  ('*', 'Mentions légales', 'Raison sociale, SIRET, capital, hébergeur, directeur de publication.', 'text', 'juridique', true, 6),
  ('*', 'Comptes de réseaux sociaux', 'Liens vers vos pages à relier au site.', 'text', 'contenu', false, 7),
  ('vitrine', 'Liste des pages souhaitées', 'Les rubriques que doit contenir le site.', 'text', 'contenu', true, 8),
  ('vitrine', 'Références ou témoignages', 'Avis clients, logos de partenaires, réalisations à montrer.', 'both', 'contenu', false, 9),
  ('ecommerce', 'Catalogue produits', 'Fichier des produits : nom, description, prix, références, stock.', 'file', 'contenu', true, 8),
  ('ecommerce', 'Photos produits', 'Une photo par produit au minimum, fond neutre de préférence.', 'file', 'media', true, 9),
  ('ecommerce', 'Conditions générales de vente', 'Vos CGV, ou indiquez si nous devons les faire rédiger.', 'both', 'juridique', true, 10),
  ('ecommerce', 'Livraison et paiement', 'Transporteurs, zones et tarifs de livraison, moyens de paiement souhaités.', 'text', 'technique', true, 11),
  ('landing', 'Promesse principale', 'La phrase qui résume ce que vous vendez et à qui.', 'text', 'contenu', true, 8),
  ('landing', 'Preuves', 'Chiffres, avis, certifications, logos qui rassurent.', 'both', 'contenu', false, 9),
  ('mobile', 'Icône de l''application', 'Format carré, 1024 × 1024 pixels.', 'file', 'identite', true, 8),
  ('mobile', 'Comptes développeur', 'Accès aux comptes App Store et Google Play, ou accord pour les créer.', 'text', 'technique', true, 9)
ON CONFLICT DO NOTHING;

-- Crée les demandes d'un projet à partir de la trame de son type
CREATE OR REPLACE FUNCTION seed_content_requests(p_project UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ptype TEXT;
  created INTEGER;
BEGIN
  SELECT project_type INTO ptype FROM projects WHERE id = p_project;

  INSERT INTO content_requests (project_id, label, description, kind, category, is_required, position)
  SELECT p_project, t.label, t.description, t.kind, t.category, t.is_required, t.position
    FROM content_templates t
   WHERE t.project_type = '*' OR t.project_type = COALESCE(ptype, '')
     AND NOT EXISTS (
       SELECT 1 FROM content_requests c
        WHERE c.project_id = p_project AND c.label = t.label
     );

  GET DIAGNOSTICS created = ROW_COUNT;
  RETURN created;
END $$;

-- ============================================
-- JOURNAL ET RELANCES
-- ============================================

CREATE OR REPLACE FUNCTION log_content_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recipient RECORD;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), 'project', NEW.project_id, NEW.project_id, 'content',
            CASE NEW.status
              WHEN 'received' THEN 'a reçu « ' || NEW.label || ' » du client'
              WHEN 'validated' THEN 'a validé « ' || NEW.label || ' »'
              WHEN 'rejected' THEN 'a redemandé « ' || NEW.label || ' »'
              ELSE 'a remis « ' || NEW.label || ' » en attente'
            END);

    -- Un dépôt du client mérite d'être signalé tout de suite
    IF NEW.status = 'received' AND auth.uid() IS NULL THEN
      FOR recipient IN SELECT id FROM profiles WHERE is_active AND role IN ('owner', 'manager') LOOP
        INSERT INTO notifications (recipient_id, actor_id, type, entity_type, entity_id, title, body, link)
        VALUES (recipient.id, NULL, 'activity', 'project', NEW.project_id,
                'Le client a déposé « ' || NEW.label || ' »',
                'À vérifier dans les contenus du projet',
                '/dashboard/projects/' || NEW.project_id::TEXT);
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_content_activity ON content_requests;
CREATE TRIGGER on_content_activity
  AFTER UPDATE ON content_requests
  FOR EACH ROW EXECUTE FUNCTION log_content_activity();

DROP TRIGGER IF EXISTS set_updated_at_content ON content_requests;
CREATE TRIGGER set_updated_at_content BEFORE UPDATE ON content_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Règle de relance sur les contenus manquants
INSERT INTO automation_rules (name, trigger_type, trigger_delay_days, action_type, action_template)
SELECT 'Contenus client en attente', 'project_milestone', 0, 'notification',
       'Des contenus sont toujours attendus du client sur {{name}}'
WHERE NOT EXISTS (SELECT 1 FROM automation_rules WHERE name = 'Contenus client en attente');

-- ============================================
-- SÉCURITÉ
-- ============================================

ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team handles content requests" ON content_requests;
CREATE POLICY "Team handles content requests" ON content_requests
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team reads templates" ON content_templates;
CREATE POLICY "Team reads templates" ON content_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Owner writes templates" ON content_templates;
CREATE POLICY "Owner writes templates" ON content_templates
  FOR ALL USING (current_user_role() = 'owner') WITH CHECK (current_user_role() = 'owner');

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE content_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
