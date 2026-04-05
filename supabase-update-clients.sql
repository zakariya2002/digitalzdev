-- =============================================
-- MIGRATION : Enrichir la table clients (leads + clients)
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- Ajouter les nouveaux champs
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Supprimer l'ancien CHECK constraint et en créer un nouveau avec plus de statuts
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check
  CHECK (status IN ('new_lead', 'contacted', 'qualified', 'active', 'completed'));

-- Ajouter un CHECK sur source
ALTER TABLE clients ADD CONSTRAINT clients_source_check
  CHECK (source IN ('facebook', 'manual', 'website', 'referral', 'other'));

-- Migrer les anciens statuts : prospect → new_lead
UPDATE clients SET status = 'new_lead' WHERE status = 'prospect';
