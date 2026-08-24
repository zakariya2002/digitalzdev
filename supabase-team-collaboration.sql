-- =============================================
-- LOT COLLABORATION
-- Notifications persistées · Journal d'activité
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- ============================================
-- 1. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('mention', 'comment', 'assignment', 'activity')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'client', 'quote', 'invoice')),
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications(recipient_id, read_at, created_at DESC);

-- ============================================
-- 2. JOURNAL D'ACTIVITÉ
-- ============================================

CREATE TABLE IF NOT EXISTS activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'client', 'quote', 'invoice', 'comment')),
  entity_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_project ON activity(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_recent ON activity(created_at DESC);

-- ============================================
-- 3. LIBELLÉS ET LIENS D'ENTITÉ
-- ============================================

-- Décrit un objet en français, pour composer un message lisible
CREATE OR REPLACE FUNCTION entity_label(etype TEXT, eid UUID)
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result TEXT;
BEGIN
  CASE etype
    WHEN 'task'    THEN SELECT 'la tâche « ' || title || ' »'   INTO result FROM tasks    WHERE id = eid;
    WHEN 'project' THEN SELECT 'le projet « ' || name || ' »'   INTO result FROM projects WHERE id = eid;
    WHEN 'client'  THEN SELECT 'la fiche de ' || name           INTO result FROM clients  WHERE id = eid;
    WHEN 'quote'   THEN SELECT 'le devis ' || quote_number      INTO result FROM quotes   WHERE id = eid;
    WHEN 'invoice' THEN SELECT 'la facture ' || invoice_number  INTO result FROM invoices WHERE id = eid;
    ELSE result := NULL;
  END CASE;
  RETURN result;
END $$;

-- Route du dashboard vers laquelle pointe une notification
CREATE OR REPLACE FUNCTION entity_link(etype TEXT, eid UUID)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE etype
    WHEN 'task'    THEN '/dashboard/kanban'
    WHEN 'project' THEN '/dashboard/projects/' || eid::TEXT
    WHEN 'client'  THEN '/dashboard/clients/'  || eid::TEXT
    WHEN 'quote'   THEN '/dashboard/quotes/'   || eid::TEXT
    WHEN 'invoice' THEN '/dashboard/invoices/' || eid::TEXT
    ELSE '/dashboard'
  END;
$$;

-- Rattache un objet à son projet, pour filtrer le journal
CREATE OR REPLACE FUNCTION entity_project(etype TEXT, eid UUID)
RETURNS UUID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result UUID;
BEGIN
  CASE etype
    WHEN 'task'    THEN SELECT project_id INTO result FROM tasks    WHERE id = eid;
    WHEN 'project' THEN result := eid;
    WHEN 'client'  THEN SELECT project_id INTO result FROM clients  WHERE id = eid;
    WHEN 'quote'   THEN SELECT project_id INTO result FROM quotes   WHERE id = eid;
    WHEN 'invoice' THEN SELECT project_id INTO result FROM invoices WHERE id = eid;
    ELSE result := NULL;
  END CASE;
  RETURN result;
END $$;

-- ============================================
-- 4. NOTIFIER SUR COMMENTAIRE ET MENTION
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  member RECORD;
  author_name TEXT;
  label TEXT;
  mentioned BOOLEAN;
BEGIN
  SELECT full_name INTO author_name FROM profiles WHERE id = NEW.author_id;
  label := entity_label(NEW.entity_type, NEW.entity_id);

  FOR member IN
    SELECT id FROM profiles
    WHERE is_active AND (NEW.author_id IS NULL OR id <> NEW.author_id)
  LOOP
    mentioned := member.id = ANY(COALESCE(NEW.mentions, '{}'::UUID[]));

    INSERT INTO notifications (recipient_id, actor_id, type, entity_type, entity_id, title, body, link)
    VALUES (
      member.id,
      NEW.author_id,
      CASE WHEN mentioned THEN 'mention' ELSE 'comment' END,
      NEW.entity_type,
      NEW.entity_id,
      COALESCE(author_name, 'Quelqu''un')
        || CASE WHEN mentioned THEN ' t''a mentionné sur ' ELSE ' a commenté ' END
        || COALESCE(label, 'un élément'),
      left(NEW.body, 160),
      entity_link(NEW.entity_type, NEW.entity_id)
    );
  END LOOP;

  -- Trace dans le journal du projet concerné
  INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
  VALUES (
    NEW.author_id, NEW.entity_type, NEW.entity_id,
    entity_project(NEW.entity_type, NEW.entity_id),
    'commented',
    'a commenté ' || COALESCE(label, 'un élément')
  );

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_comment_created ON comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- ============================================
-- 5. NOTIFIER SUR ASSIGNATION
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_task_assignment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE actor_name TEXT;
BEGIN
  IF NEW.assignee_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.assignee_id IS NOT DISTINCT FROM OLD.assignee_id THEN RETURN NEW; END IF;
  -- On ne se notifie pas soi-même
  IF NEW.assignee_id = auth.uid() THEN RETURN NEW; END IF;

  SELECT full_name INTO actor_name FROM profiles WHERE id = auth.uid();

  INSERT INTO notifications (recipient_id, actor_id, type, entity_type, entity_id, title, body, link)
  VALUES (
    NEW.assignee_id, auth.uid(), 'assignment', 'task', NEW.id,
    COALESCE(actor_name, 'Quelqu''un') || ' t''a assigné une tâche',
    NEW.title,
    '/dashboard/kanban'
  );

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_task_assigned ON tasks;
CREATE TRIGGER on_task_assigned
  AFTER INSERT OR UPDATE OF assignee_id ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_on_task_assignment();

-- ============================================
-- 6. JOURNAL : QUI A FAIT QUOI
-- ============================================

CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  status_label TEXT;
  assignee_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), 'task', NEW.id, NEW.project_id, 'created',
            'a créé la tâche « ' || NEW.title || ' »');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    status_label := CASE NEW.status
      WHEN 'todo' THEN 'À faire' WHEN 'in_progress' THEN 'En cours'
      WHEN 'review' THEN 'En review' WHEN 'done' THEN 'Terminé' ELSE NEW.status END;
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), 'task', NEW.id, NEW.project_id, 'status_changed',
            'a déplacé « ' || NEW.title || ' » vers ' || status_label);
  END IF;

  IF NEW.assignee_id IS DISTINCT FROM OLD.assignee_id THEN
    SELECT full_name INTO assignee_name FROM profiles WHERE id = NEW.assignee_id;
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), 'task', NEW.id, NEW.project_id, 'assigned',
            CASE WHEN assignee_name IS NULL
                 THEN 'a retiré le responsable de « ' || NEW.title || ' »'
                 ELSE 'a assigné « ' || NEW.title || ' » à ' || assignee_name END);
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_task_activity ON tasks;
CREATE TRIGGER on_task_activity
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_activity();

CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE status_label TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), 'project', NEW.id, NEW.id, 'created',
            'a créé le projet « ' || NEW.name || ' »');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    status_label := CASE NEW.status
      WHEN 'briefing' THEN 'Briefing' WHEN 'design' THEN 'Design'
      WHEN 'development' THEN 'Développement' WHEN 'review' THEN 'Recette'
      WHEN 'delivered' THEN 'Livré' WHEN 'active' THEN 'Actif'
      WHEN 'archived' THEN 'Archivé' ELSE NEW.status END;
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), 'project', NEW.id, NEW.id, 'status_changed',
            'a passé le projet « ' || NEW.name || ' » en ' || status_label);
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_project_activity ON projects;
CREATE TRIGGER on_project_activity
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_project_activity();

CREATE OR REPLACE FUNCTION log_document_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  doc_number TEXT;
  doc_kind TEXT;
  status_label TEXT;
BEGIN
  IF TG_TABLE_NAME = 'quotes' THEN
    doc_number := NEW.quote_number; doc_kind := 'le devis';
    status_label := CASE NEW.status
      WHEN 'draft' THEN 'Brouillon' WHEN 'sent' THEN 'Envoyé' WHEN 'accepted' THEN 'Accepté'
      WHEN 'rejected' THEN 'Refusé' WHEN 'expired' THEN 'Expiré' ELSE NEW.status END;
  ELSE
    doc_number := NEW.invoice_number; doc_kind := 'la facture';
    status_label := CASE NEW.status
      WHEN 'draft' THEN 'Brouillon' WHEN 'sent' THEN 'Envoyée' WHEN 'paid' THEN 'Payée'
      WHEN 'partial' THEN 'Partiellement payée' WHEN 'overdue' THEN 'En retard'
      WHEN 'cancelled' THEN 'Annulée' ELSE NEW.status END;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), TG_ARGV[0], NEW.id, NEW.project_id, 'created',
            'a créé ' || doc_kind || ' ' || doc_number);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO activity (actor_id, entity_type, entity_id, project_id, action, summary)
    VALUES (auth.uid(), TG_ARGV[0], NEW.id, NEW.project_id, 'status_changed',
            'a passé ' || doc_kind || ' ' || doc_number || ' en ' || status_label);
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_quote_activity ON quotes;
CREATE TRIGGER on_quote_activity
  AFTER INSERT OR UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION log_document_activity('quote');

DROP TRIGGER IF EXISTS on_invoice_activity ON invoices;
CREATE TRIGGER on_invoice_activity
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION log_document_activity('invoice');

-- ============================================
-- 7. SÉCURITÉ
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

-- Chacun ne voit que ses propres notifications
DROP POLICY IF EXISTS "Own notifications read" ON notifications;
CREATE POLICY "Own notifications read" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Own notifications update" ON notifications;
CREATE POLICY "Own notifications update" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Own notifications delete" ON notifications;
CREATE POLICY "Own notifications delete" ON notifications
  FOR DELETE USING (recipient_id = auth.uid());

-- Le journal est commun à l'équipe, en lecture seule : il n'est écrit que par les déclencheurs
DROP POLICY IF EXISTS "Team reads activity" ON activity;
CREATE POLICY "Team reads activity" ON activity
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- 8. TEMPS RÉEL
-- ============================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE activity;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
