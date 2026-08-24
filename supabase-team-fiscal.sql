-- =============================================
-- MODULE FISCAL
-- Simulation des cotisations et de l'impôt selon le statut juridique
-- Auto-entreprise France · SASU · Auto-entrepreneur Algérie
--
-- Les taux changent chaque année : ils sont ici des DONNÉES modifiables,
-- jamais des constantes de code. Chaque jeu porte son millésime.
-- =============================================

CREATE TABLE IF NOT EXISTS tax_regimes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  fiscal_year INTEGER NOT NULL,
  /** Paramètres de calcul, propres à chaque régime */
  params JSONB NOT NULL DEFAULT '{}',
  /** Rappel de ce qui reste à la charge de l'entrepreneur */
  notes TEXT,
  source_note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Réglages de l'entreprise : le régime réellement appliqué aujourd'hui
CREATE TABLE IF NOT EXISTS company_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  active_regime_id TEXT REFERENCES tax_regimes(id) ON DELETE SET NULL,
  legal_name TEXT,
  trade_name TEXT,
  siret TEXT,
  vat_number TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  iban TEXT,
  bic TEXT,
  /** Cours utilisé pour convertir un devis en euros vers une autre monnaie */
  eur_to_dzd DECIMAL(10,4) DEFAULT 145,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- JEUX DE PARAMÈTRES
-- ============================================

INSERT INTO tax_regimes (id, label, country, currency, fiscal_year, position, params, notes, source_note) VALUES
(
  'fr_micro_bic',
  'Auto-entreprise, prestations de services (BIC)',
  'FR', 'EUR', 2026, 1,
  '{
     "kind": "micro",
     "social_rate": 0.212,
     "training_rate": 0.001,
     "liberatory_tax_rate": 0.017,
     "income_allowance": 0.50,
     "revenue_ceiling": 77700,
     "vat_franchise_ceiling": 39100,
     "vat_rate": 0.20
   }'::jsonb,
  'Activité commerciale de prestation de services : développement, intégration, maintenance. Cotisations calculées sur le chiffre d''affaires encaissé, sans déduction de charges. Pas de récupération de TVA tant que la franchise s''applique.',
  'Taux à confirmer chaque janvier sur urssaf.fr : jeu saisi pour 2026.'
),
(
  'fr_micro_bnc',
  'Auto-entreprise, profession libérale (BNC)',
  'FR', 'EUR', 2026, 2,
  '{
     "kind": "micro",
     "social_rate": 0.246,
     "training_rate": 0.002,
     "liberatory_tax_rate": 0.022,
     "income_allowance": 0.34,
     "revenue_ceiling": 77700,
     "vat_franchise_ceiling": 39100,
     "vat_rate": 0.20
   }'::jsonb,
  'Activité libérale non réglementée (conseil, audit). Le taux de cotisations des BNC augmente par paliers depuis 2024 : vérifier le palier de l''année en cours.',
  'Taux à confirmer chaque janvier sur urssaf.fr : jeu saisi pour 2026.'
),
(
  'fr_sasu',
  'SASU, président assimilé salarié',
  'FR', 'EUR', 2026, 3,
  '{
     "kind": "corporate",
     "employer_rate": 0.45,
     "employee_rate": 0.22,
     "corporate_tax_reduced": 0.15,
     "corporate_tax_threshold": 42500,
     "corporate_tax_standard": 0.25,
     "dividend_flat_tax": 0.30,
     "default_salary_share": 0.50,
     "accounting_cost": 1800,
     "vat_rate": 0.20
   }'::jsonb,
  'Les cotisations ne portent que sur la rémunération versée, et les charges réelles sont déductibles. La TVA est facturée puis récupérée. Compter un expert-comptable et le dépôt des comptes chaque année.',
  'Taux de cotisations approchés pour un mandataire sans allègement général, à ajuster avec un expert-comptable.'
),
(
  'dz_auto_entrepreneur',
  'Auto-entrepreneur, Algérie',
  'DZ', 'DZD', 2026, 4,
  '{
     "kind": "micro",
     "social_rate": 0.12,
     "training_rate": 0,
     "liberatory_tax_rate": 0.005,
     "income_allowance": 0,
     "revenue_ceiling": 5000000,
     "min_social_base": 240000,
     "vat_franchise_ceiling": null,
     "vat_rate": 0.19
   }'::jsonb,
  'Statut créé par la loi 22-23. Cotisation sociale CASNOS assise sur le revenu déclaré avec une base minimale annuelle, et contribution fiscale unique assise sur le chiffre d''affaires. Montants exprimés en dinars.',
  'Paramètres à confirmer auprès de l''ANAE et de la CASNOS : les barèmes algériens évoluent et ma source date de 2026.'
)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label, params = EXCLUDED.params, notes = EXCLUDED.notes,
  source_note = EXCLUDED.source_note, fiscal_year = EXCLUDED.fiscal_year,
  updated_at = now();

-- Régime appliqué par défaut : celui utilisé aujourd'hui
INSERT INTO company_settings (id, active_regime_id, legal_name, trade_name, siret, email, phone)
VALUES (true, 'fr_micro_bic', 'Zakariya Nebbache', 'Z Digital Dev', '994 397 735 00014',
        'zdigitalzdev@gmail.com', '+33 7 83 25 98 69')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SÉCURITÉ
-- ============================================

ALTER TABLE tax_regimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Les barèmes se consultent en équipe : ils servent à chiffrer un devis
DROP POLICY IF EXISTS "Team reads regimes" ON tax_regimes;
CREATE POLICY "Team reads regimes" ON tax_regimes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Seul le titulaire modifie les barèmes et l'identité de l'entreprise
DROP POLICY IF EXISTS "Owner writes regimes" ON tax_regimes;
CREATE POLICY "Owner writes regimes" ON tax_regimes
  FOR ALL USING (current_user_role() = 'owner') WITH CHECK (current_user_role() = 'owner');

DROP POLICY IF EXISTS "Team reads settings" ON company_settings;
CREATE POLICY "Team reads settings" ON company_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Owner writes settings" ON company_settings;
CREATE POLICY "Owner writes settings" ON company_settings
  FOR ALL USING (current_user_role() = 'owner') WITH CHECK (current_user_role() = 'owner');

DROP TRIGGER IF EXISTS set_updated_at_regimes ON tax_regimes;
CREATE TRIGGER set_updated_at_regimes BEFORE UPDATE ON tax_regimes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_settings ON company_settings;
CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
