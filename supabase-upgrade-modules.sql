-- =============================================
-- UPGRADE BACKOFFICE — 4 MODULES
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- ============================================
-- MODULE 1 : DEVIS & FACTURATION
-- ============================================

-- Table des devis
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  quote_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until DATE,
  notes TEXT,
  terms TEXT DEFAULT 'Paiement à réception de facture. Tout retard de paiement entraînera des pénalités de retard au taux de 3 fois le taux d''intérêt légal, ainsi qu''une indemnité forfaitaire pour frais de recouvrement de 40€.',
  total_amount DECIMAL(10,2) DEFAULT 0,
  accepted_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lignes de devis
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  terms TEXT DEFAULT 'Paiement à réception de facture. Tout retard de paiement entraînera des pénalités de retard au taux de 3 fois le taux d''intérêt légal, ainsi qu''une indemnité forfaitaire pour frais de recouvrement de 40€.',
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lignes de factures
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Paiements (pour le suivi partiel)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT DEFAULT 'virement' CHECK (method IN ('virement', 'carte', 'paypal', 'especes', 'cheque', 'autre')),
  reference TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Séquences de numérotation (pour DEVIS-2026-001, FACT-2026-001)
CREATE TABLE IF NOT EXISTS sequences (
  id TEXT PRIMARY KEY,
  prefix TEXT NOT NULL,
  current_year INTEGER NOT NULL,
  current_number INTEGER DEFAULT 0
);

-- Seed les séquences
INSERT INTO sequences (id, prefix, current_year, current_number) VALUES
  ('quote', 'DEVIS', 2026, 0),
  ('invoice', 'FACT', 2026, 0)
ON CONFLICT (id) DO NOTHING;

-- Fonction pour générer le prochain numéro
CREATE OR REPLACE FUNCTION next_sequence_number(seq_id TEXT)
RETURNS TEXT AS $$
DECLARE
  seq RECORD;
  next_num INTEGER;
  result TEXT;
BEGIN
  SELECT * INTO seq FROM sequences WHERE id = seq_id FOR UPDATE;

  IF EXTRACT(YEAR FROM CURRENT_DATE) != seq.current_year THEN
    UPDATE sequences SET current_year = EXTRACT(YEAR FROM CURRENT_DATE), current_number = 1 WHERE id = seq_id;
    next_num := 1;
  ELSE
    next_num := seq.current_number + 1;
    UPDATE sequences SET current_number = next_num WHERE id = seq_id;
  END IF;

  result := seq.prefix || '-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MODULE 2 : GESTION DE PROJET AVANCÉE
-- ============================================

-- Ajouter des champs à la table projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('briefing', 'design', 'development', 'review', 'delivered', 'active', 'archived'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN ('landing', 'vitrine', 'ecommerce', 'custom', 'mobile', 'maintenance', 'audit', 'other'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;

-- Time tracking sur les tâches
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2) DEFAULT 0;

-- Entrées de temps
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT,
  hours DECIMAL(5,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fichiers / liens associés aux projets
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT DEFAULT 'link' CHECK (file_type IN ('link', 'figma', 'drive', 'github', 'other')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MODULE 3 : PROPOSITIONS / CAHIER DES CHARGES
-- ============================================

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  project_type TEXT CHECK (project_type IN ('landing', 'vitrine', 'ecommerce', 'custom', 'mobile', 'maintenance', 'audit', 'other')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),

  -- Infos client
  client_company TEXT,
  client_contact TEXT,
  client_email TEXT,
  client_phone TEXT,

  -- Contenu du cahier des charges
  project_description TEXT,
  objectives TEXT,
  target_audience TEXT,
  features JSONB DEFAULT '[]',
  design_preferences TEXT,
  inspirations TEXT,
  seo_requirements TEXT,
  hosting_needs TEXT,
  content_provided BOOLEAN DEFAULT false,
  timeline TEXT,
  budget_range TEXT,
  additional_notes TEXT,

  -- Résultat
  estimated_amount DECIMAL(10,2),
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,

  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MODULE 4 : AUTOMATISATION DES RELANCES
-- ============================================

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('lead_no_activity', 'quote_no_response', 'invoice_overdue', 'follow_up_due', 'project_milestone')),
  trigger_delay_days INTEGER NOT NULL DEFAULT 2,
  action_type TEXT NOT NULL CHECK (action_type IN ('sms', 'email', 'notification', 'status_change')),
  action_template TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('client', 'quote', 'invoice', 'project')),
  entity_id UUID NOT NULL,
  action_taken TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Seed des règles d'automatisation par défaut
INSERT INTO automation_rules (name, trigger_type, trigger_delay_days, action_type, action_template) VALUES
  ('Relance lead inactif J+2', 'lead_no_activity', 2, 'notification', 'Le lead {{name}} n''a pas été contacté depuis 2 jours'),
  ('Relance lead inactif J+5', 'lead_no_activity', 5, 'notification', 'URGENT : Le lead {{name}} n''a pas été contacté depuis 5 jours'),
  ('Relance devis J+5', 'quote_no_response', 5, 'notification', 'Le devis {{quote_number}} envoyé à {{client_name}} attend une réponse depuis 5 jours'),
  ('Relance devis J+10', 'quote_no_response', 10, 'notification', 'URGENT : Le devis {{quote_number}} est sans réponse depuis 10 jours'),
  ('Facture impayée J+15', 'invoice_overdue', 15, 'notification', 'La facture {{invoice_number}} de {{client_name}} est impayée depuis 15 jours'),
  ('Facture impayée J+30', 'invoice_overdue', 30, 'notification', 'CRITIQUE : La facture {{invoice_number}} est impayée depuis 30 jours — envisager une mise en demeure'),
  ('Rappel follow-up', 'follow_up_due', 0, 'notification', 'Rappel : follow-up prévu aujourd''hui avec {{name}}')
ON CONFLICT DO NOTHING;

-- ============================================
-- RLS & TRIGGERS
-- ============================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON quotes FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON quote_items FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON invoices FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON invoice_items FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON payments FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON sequences FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON time_entries FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON project_files FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON proposals FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON automation_rules FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON automation_logs FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers updated_at
CREATE TRIGGER set_updated_at_quotes BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_invoices BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_proposals BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_automation_rules BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
