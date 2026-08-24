-- =============================================
-- MENTIONS DU DOCUMENT IMPRIMÉ
-- Ce qu'un devis doit porter pour être présentable et conforme
-- =============================================

-- Identité de l'émetteur
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS legal_form TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS vat_applicable BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.20;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS validity_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS late_penalty_terms TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS ip_terms TEXT;

-- Identité du client, telle qu'elle doit figurer sur le devis
ALTER TABLE clients ADD COLUMN IF NOT EXISTS legal_form TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS share_capital TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS siren TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS representative TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;

-- Durée annoncée sur le devis
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS duration_note TEXT;

UPDATE company_settings SET
  legal_form = COALESCE(legal_form, 'Entrepreneur individuel'),
  payment_terms = COALESCE(payment_terms,
    'Virement bancaire sous 30 jours à compter de l''émission de la facture. Échéancier de facturation possible.'),
  late_penalty_terms = COALESCE(late_penalty_terms,
    'En cas de retard de paiement, une pénalité de 3 fois le taux d''intérêt légal sera appliquée, augmentée d''une indemnité forfaitaire pour frais de recouvrement de 40 € (art. L441-10 du Code de commerce).'),
  ip_terms = COALESCE(ip_terms,
    'Le transfert de propriété des livrables et de la documentation sera effectif à compter du paiement intégral du prix convenu.')
WHERE id = true;
