-- =============================================
-- PROSPECTION AVOCATS · appels à la chaîne
-- =============================================
-- Un prospect = un numéro de téléphone (souvent celui d'un cabinet de
-- plusieurs avocats). Rempli depuis le dépôt annuaire-avocats ; un nouvel
-- import met à jour les informations sans toucher au suivi des appels.

CREATE TABLE IF NOT EXISTS prospects_avocats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telephone TEXT UNIQUE NOT NULL,            -- E.164, +33…
  mobile BOOLEAN DEFAULT false,
  email TEXT,
  site TEXT,
  cabinet TEXT,
  avocats TEXT,                              -- « Prénom Nom, Prénom Nom »
  nb_avocats INTEGER DEFAULT 1,
  ville TEXT,
  code_postal TEXT,
  barreau TEXT,
  specialites TEXT,
  annee_serment INTEGER,                     -- la plus ancienne du cabinet
  derniere_maj DATE,
  annee_site INTEGER,
  site_pas_a_jour BOOLEAN DEFAULT false,
  note_seo INTEGER,
  a_corriger_seo TEXT,
  techno TEXT,
  statut TEXT NOT NULL DEFAULT 'a_appeler' CHECK (statut IN (
    'a_appeler', 'pas_de_reponse', 'repondeur', 'rappeler', 'interesse',
    'pas_interesse', 'ne_plus_appeler', 'faux_numero')),
  nb_appels INTEGER NOT NULL DEFAULT 0,
  dernier_appel TIMESTAMPTZ,
  rappeler_le TIMESTAMPTZ,
  notes TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  verrou_jusqua TIMESTAMPTZ,                 -- en cours d'appel par quelqu'un
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospects_file ON prospects_avocats (statut, rappeler_le, note_seo);

ALTER TABLE prospects_avocats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Equipe prospection" ON prospects_avocats;
CREATE POLICY "Equipe prospection" ON prospects_avocats
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()));

DROP TRIGGER IF EXISTS set_updated_at_prospects ON prospects_avocats;
CREATE TRIGGER set_updated_at_prospects
  BEFORE UPDATE ON prospects_avocats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Prochain numéro à composer, réservé 10 minutes pour qu'un collègue sur la
-- même file ne l'appelle pas en même temps. Les filtres sont facultatifs.
CREATE OR REPLACE FUNCTION prochain_prospect(
  p_mobiles BOOLEAN DEFAULT false,
  p_pas_a_jour BOOLEAN DEFAULT false,
  p_note_max INTEGER DEFAULT NULL,
  p_recherche TEXT DEFAULT NULL,
  p_exclure UUID[] DEFAULT '{}'
) RETURNS SETOF prospects_avocats
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM prospects_avocats p
   WHERE (p.statut IN ('a_appeler', 'pas_de_reponse', 'repondeur')
          OR (p.statut = 'rappeler' AND p.rappeler_le <= now()))
     AND (p.statut = 'a_appeler' OR p.dernier_appel IS NULL OR p.dernier_appel < now() - interval '20 hours')
     AND p.nb_appels < 4
     AND (p.verrou_jusqua IS NULL OR p.verrou_jusqua < now())
     AND NOT (p.id = ANY (p_exclure))
     AND (NOT p_mobiles OR p.mobile)
     AND (NOT p_pas_a_jour OR p.site_pas_a_jour)
     AND (p_note_max IS NULL OR p.note_seo <= p_note_max)
     AND (p_recherche IS NULL OR p_recherche = ''
          OR p.ville ILIKE '%' || p_recherche || '%'
          OR p.code_postal LIKE p_recherche || '%'
          OR p.specialites ILIKE '%' || p_recherche || '%'
          OR p.barreau ILIKE '%' || p_recherche || '%')
   ORDER BY (p.statut = 'rappeler') DESC, p.nb_appels, p.site_pas_a_jour DESC, p.note_seo NULLS LAST, p.id
   LIMIT 1
   FOR UPDATE SKIP LOCKED;
  IF v_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY
    UPDATE prospects_avocats SET verrou_jusqua = now() + interval '10 minutes'
     WHERE id = v_id RETURNING *;
END $$;
