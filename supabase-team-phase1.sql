-- =============================================
-- PHASE 1 — TRAVAILLER À DEUX
-- Profils & rôles · Assignation · Commentaires · Cloisonnement finances
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- ============================================
-- 1. PROFILS & RÔLES
-- ============================================

-- owner   : accès total, y compris les finances personnelles (URSSAF, plafond, revenus)
-- manager : chefferie de projet — clients, projets, devis, factures, production
-- member  : production uniquement

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member')),
  job_title TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Création automatique du profil à l'inscription d'un utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill des comptes déjà existants
INSERT INTO profiles (id, full_name, email)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Le tout premier compte devient owner : sans cela, la nouvelle règle sur revenues
-- couperait l'accès aux finances à tout le monde, y compris au compte principal.
UPDATE profiles SET role = 'owner'
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'owner');

-- Rôle courant, en SECURITY DEFINER pour éviter la récursion RLS sur profiles
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================
-- 2. ASSIGNATION DES TÂCHES
-- ============================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);

-- Chef de projet responsable, utile pour filtrer « mes projets »
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_lead ON projects(lead_id);

-- ============================================
-- 3. COMMENTAIRES (polymorphes)
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'client', 'quote', 'invoice')),
  entity_id UUID NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_mentions ON comments USING GIN (mentions);

-- ============================================
-- 4. SÉCURITÉ PAR RÔLE
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profils : tout le monde voit l'équipe, chacun modifie sa fiche, l'owner gère les rôles
DROP POLICY IF EXISTS "Team can read profiles" ON profiles;
CREATE POLICY "Team can read profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Own profile update" ON profiles;
CREATE POLICY "Own profile update" ON profiles
  FOR UPDATE USING (id = auth.uid() OR current_user_role() = 'owner')
  WITH CHECK (id = auth.uid() OR current_user_role() = 'owner');

DROP POLICY IF EXISTS "Owner manages profiles" ON profiles;
CREATE POLICY "Owner manages profiles" ON profiles
  FOR INSERT WITH CHECK (current_user_role() = 'owner' OR id = auth.uid());

-- Commentaires : lecture par l'équipe, écriture signée, édition et suppression par l'auteur
DROP POLICY IF EXISTS "Team reads comments" ON comments;
CREATE POLICY "Team reads comments" ON comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Author writes comment" ON comments;
CREATE POLICY "Author writes comment" ON comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Author edits comment" ON comments;
CREATE POLICY "Author edits comment" ON comments
  FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Author deletes comment" ON comments;
CREATE POLICY "Author deletes comment" ON comments
  FOR DELETE USING (author_id = auth.uid() OR current_user_role() = 'owner');

-- Finances personnelles : la table revenues sert la comptabilité de l'auto-entrepreneur
-- (URSSAF, plafond micro). Elle reste réservée à l'owner. Devis, factures et paiements
-- restent accessibles à toute l'équipe : ce sont des données de projet.
DROP POLICY IF EXISTS "Authenticated full access" ON revenues;
DROP POLICY IF EXISTS "Owner only revenues" ON revenues;
CREATE POLICY "Owner only revenues" ON revenues
  FOR ALL USING (current_user_role() = 'owner') WITH CHECK (current_user_role() = 'owner');

-- ============================================
-- 5. TRIGGERS updated_at
-- ============================================

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_comments ON comments;
CREATE TRIGGER set_updated_at_comments
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. TEMPS RÉEL
-- ============================================

-- Sans cette publication, les abonnements du Kanban et des discussions restent muets
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE comments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 7. À PERSONNALISER APRÈS EXÉCUTION
-- ============================================

-- Passer le compte principal en owner :
--   UPDATE profiles SET role = 'owner', full_name = 'Zakariya', job_title = 'Développeur', color = '#3B82F6'
--   WHERE email = 'zakariyanebbache@gmail.com';
--
-- Puis, une fois le compte d'Anissa créé dans Authentication > Users :
--   UPDATE profiles SET role = 'manager', full_name = 'Anissa', job_title = 'Cheffe de projet', color = '#EC4899'
--   WHERE email = 'email-d-anissa@example.com';
