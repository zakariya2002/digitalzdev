-- =============================================
-- CAMPAGNE MAILS AVOCATS · suivi des envois
-- =============================================
-- Une ligne = un mail de prospection (une adresse, une campagne). Rempli par
-- annuaire-avocats/mail/envoi.py (service role) ; les événements Resend
-- (délivré, ouvert, rebond, plainte) sont relus par le même script ; le statut
-- commercial (répondu, RDV, pas intéressé, STOP) se met à jour depuis le CRM.

CREATE TABLE IF NOT EXISTS campagne_mails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campagne TEXT NOT NULL,
  email TEXT NOT NULL,
  nom TEXT,
  cabinet TEXT,
  ville TEXT,
  site TEXT,
  objet TEXT,
  defauts TEXT[],
  etat TEXT NOT NULL DEFAULT 'a_envoyer' CHECK (etat IN ('a_envoyer', 'envoye', 'erreur')),
  resend_id TEXT,
  envoye_le TIMESTAMPTZ,
  dernier_evenement TEXT,          -- sent, delivered, opened, clicked, bounced, complained, delivery_delayed
  evenement_le TIMESTAMPTZ,
  ouvert_le TIMESTAMPTZ,
  statut TEXT NOT NULL DEFAULT 'aucune_reponse' CHECK (statut IN (
    'aucune_reponse', 'repondu', 'rdv', 'pas_interesse', 'stop')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (campagne, email)
);

CREATE INDEX IF NOT EXISTS idx_campagne_mails ON campagne_mails (campagne, etat, envoye_le);

ALTER TABLE campagne_mails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Equipe campagne mails" ON campagne_mails;
CREATE POLICY "Equipe campagne mails" ON campagne_mails
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()));

DROP TRIGGER IF EXISTS set_updated_at_campagne_mails ON campagne_mails;
CREATE TRIGGER set_updated_at_campagne_mails
  BEFORE UPDATE ON campagne_mails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
