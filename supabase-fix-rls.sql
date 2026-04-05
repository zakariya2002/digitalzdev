-- =============================================
-- FIX RLS POLICIES
-- auth.role() est déprécié, on utilise auth.uid()
-- =============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Authenticated users have full access" ON projects;
DROP POLICY IF EXISTS "Authenticated users have full access" ON tasks;
DROP POLICY IF EXISTS "Authenticated users have full access" ON events;
DROP POLICY IF EXISTS "Authenticated users have full access" ON revenues;
DROP POLICY IF EXISTS "Authenticated users have full access" ON clients;

-- Recréer avec auth.uid() + WITH CHECK
CREATE POLICY "Authenticated full access" ON projects
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON tasks
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON events
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON revenues
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated full access" ON clients
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
