-- =============================================
-- TABLES TÉLÉPHONIE & SMS — BACKOFFICE DIGITALZ DEV
-- =============================================

-- Ajouter des colonnes à la table clients existante
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS phone_secondary TEXT,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS call_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sms_count INTEGER DEFAULT 0;

-- Table des templates SMS (créée AVANT sms pour la FK)
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('relance', 'confirmation', 'custom')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des appels
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  twilio_call_sid TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'in_progress', 'completed', 'no_answer', 'busy', 'failed', 'canceled')),
  duration INTEGER,
  recording_url TEXT,
  call_note TEXT,
  called_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des SMS
CREATE TABLE IF NOT EXISTS sms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  twilio_message_sid TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'received')),
  template_id UUID REFERENCES sms_templates(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON calls
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON sms
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON sms_templates
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers updated_at
CREATE TRIGGER set_updated_at_calls
  BEFORE UPDATE ON calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_sms
  BEFORE UPDATE ON sms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_sms_templates
  BEFORE UPDATE ON sms_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed : templates SMS par défaut
INSERT INTO sms_templates (name, body, category) VALUES
  ('relance_j0', 'Bonjour {{prenom}}, c''est Zakariya de Z Digital Dev. J''ai essayé de vous joindre suite à votre demande pour un projet web. N''hésitez pas à me rappeler ou à me dire un créneau qui vous arrange. Bonne journée !', 'relance'),
  ('relance_j1', 'Bonjour {{prenom}}, je me permets de revenir vers vous concernant votre projet web. Je suis disponible pour en discuter par téléphone ou visio. Zakariya — Z Digital Dev', 'relance'),
  ('relance_j3', 'Bonjour {{prenom}}, je voulais m''assurer que vous aviez bien reçu mes messages. Si votre projet est toujours d''actualité, je reste disponible. Sinon, bonne continuation ! Zakariya — Z Digital Dev', 'relance'),
  ('confirmation_rdv', 'Bonjour {{prenom}}, je confirme notre RDV téléphonique le {{date}} à {{heure}}. À très bientôt ! Zakariya — Z Digital Dev', 'confirmation')
ON CONFLICT (name) DO NOTHING;
