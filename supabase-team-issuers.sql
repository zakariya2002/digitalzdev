-- =============================================
-- ÉMETTEURS ET GABARITS DE DOCUMENT
-- Chaque membre facture sous sa propre entité, avec sa propre présentation.
-- =============================================

-- Identité d'émission, propre à chaque membre
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_brand TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_legal_form TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_siret TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_rm TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS issuer_logo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bic TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;

/** Présentation du document : « classic » pour le fond crème, « agency »
 *  pour le bandeau de marque et le tableau à colonnes détaillées. */
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document_template TEXT NOT NULL DEFAULT 'classic'
  CHECK (document_template IN ('classic', 'agency'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document_accent TEXT NOT NULL DEFAULT '#5a5a5a';

-- Le document garde la trace de qui l'a émis : c'est son identité qui figure dessus
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Les documents déjà émis reviennent au titulaire
UPDATE quotes SET created_by = (SELECT id FROM profiles WHERE role = 'owner' LIMIT 1) WHERE created_by IS NULL;
UPDATE invoices SET created_by = (SELECT id FROM profiles WHERE role = 'owner' LIMIT 1) WHERE created_by IS NULL;

-- Reprise de l'identité de l'entreprise pour le titulaire
UPDATE profiles p SET
  issuer_name = COALESCE(p.issuer_name, c.legal_name),
  issuer_brand = COALESCE(p.issuer_brand, c.trade_name),
  issuer_legal_form = COALESCE(p.issuer_legal_form, c.legal_form),
  issuer_siret = COALESCE(p.issuer_siret, c.siret),
  issuer_email = COALESCE(p.issuer_email, c.email),
  issuer_phone = COALESCE(p.issuer_phone, c.phone),
  iban = COALESCE(p.iban, c.iban),
  bic = COALESCE(p.bic, c.bic)
FROM company_settings c
WHERE p.role = 'owner' AND c.id = true;

-- Chacun renseigne et modifie sa propre identité d'émission ; la règle
-- existante sur profiles couvre déjà l'écriture (soi-même ou l'owner).
