-- =============================================
-- FIABILISATION DU SCHÉMA
-- Les colonnes qui ont une valeur par défaut ne doivent jamais être vides.
-- Sans NOT NULL, le code devait traiter partout un cas qui n'arrive jamais.
-- =============================================

-- Lignes de devis et de factures
UPDATE quote_items   SET quantity = 1 WHERE quantity IS NULL;
UPDATE quote_items   SET position = 0 WHERE position IS NULL;
UPDATE invoice_items SET quantity = 1 WHERE quantity IS NULL;
UPDATE invoice_items SET position = 0 WHERE position IS NULL;
ALTER TABLE quote_items   ALTER COLUMN quantity SET NOT NULL, ALTER COLUMN position SET NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN quantity SET NOT NULL, ALTER COLUMN position SET NOT NULL;

-- Montants et états des documents
UPDATE quotes   SET total_amount = 0 WHERE total_amount IS NULL;
UPDATE quotes   SET status = 'draft' WHERE status IS NULL;
UPDATE invoices SET total_amount = 0 WHERE total_amount IS NULL;
UPDATE invoices SET paid_amount = 0 WHERE paid_amount IS NULL;
UPDATE invoices SET status = 'draft' WHERE status IS NULL;
UPDATE invoices SET issue_date = CURRENT_DATE WHERE issue_date IS NULL;
ALTER TABLE quotes   ALTER COLUMN total_amount SET NOT NULL, ALTER COLUMN status SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN total_amount SET NOT NULL, ALTER COLUMN paid_amount SET NOT NULL,
                     ALTER COLUMN status SET NOT NULL, ALTER COLUMN issue_date SET NOT NULL;

-- Paiements
UPDATE payments SET method = 'virement' WHERE method IS NULL;
UPDATE payments SET paid_at = created_at WHERE paid_at IS NULL;
ALTER TABLE payments ALTER COLUMN method SET NOT NULL, ALTER COLUMN paid_at SET NOT NULL;

-- Tâches et projets
UPDATE tasks SET status = 'todo' WHERE status IS NULL;
UPDATE tasks SET priority = 'medium' WHERE priority IS NULL;
UPDATE tasks SET position = 0 WHERE position IS NULL;
UPDATE tasks SET tags = '{}' WHERE tags IS NULL;
UPDATE tasks SET actual_hours = 0 WHERE actual_hours IS NULL;
UPDATE tasks SET kind = 'task' WHERE kind IS NULL;
ALTER TABLE tasks ALTER COLUMN status SET NOT NULL, ALTER COLUMN priority SET NOT NULL,
                  ALTER COLUMN position SET NOT NULL, ALTER COLUMN tags SET NOT NULL,
                  ALTER COLUMN actual_hours SET NOT NULL, ALTER COLUMN kind SET NOT NULL;

UPDATE projects SET color = '#3B82F6' WHERE color IS NULL;
UPDATE projects SET is_archived = false WHERE is_archived IS NULL;
UPDATE projects SET status = 'active' WHERE status IS NULL;
ALTER TABLE projects ALTER COLUMN color SET NOT NULL, ALTER COLUMN is_archived SET NOT NULL,
                     ALTER COLUMN status SET NOT NULL;

-- Clients
UPDATE clients SET status = 'new_lead' WHERE status IS NULL;
UPDATE clients SET source = 'manual' WHERE source IS NULL;
UPDATE clients SET call_count = 0 WHERE call_count IS NULL;
UPDATE clients SET sms_count = 0 WHERE sms_count IS NULL;
ALTER TABLE clients ALTER COLUMN status SET NOT NULL, ALTER COLUMN source SET NOT NULL,
                    ALTER COLUMN call_count SET NOT NULL, ALTER COLUMN sms_count SET NOT NULL;

-- Événements
UPDATE events SET all_day = false WHERE all_day IS NULL;
ALTER TABLE events ALTER COLUMN all_day SET NOT NULL;

-- Appels et SMS
UPDATE calls SET status = 'completed' WHERE status IS NULL;
UPDATE calls SET called_at = created_at WHERE called_at IS NULL;
ALTER TABLE calls ALTER COLUMN status SET NOT NULL, ALTER COLUMN called_at SET NOT NULL;
UPDATE sms SET status = 'sent' WHERE status IS NULL;
UPDATE sms SET sent_at = created_at WHERE sent_at IS NULL;
ALTER TABLE sms ALTER COLUMN status SET NOT NULL, ALTER COLUMN sent_at SET NOT NULL;
UPDATE sms_templates SET is_active = true WHERE is_active IS NULL;
ALTER TABLE sms_templates ALTER COLUMN is_active SET NOT NULL;

-- Automatisation
UPDATE automation_rules SET is_active = true WHERE is_active IS NULL;
ALTER TABLE automation_rules ALTER COLUMN is_active SET NOT NULL;
UPDATE automation_logs SET success = true WHERE success IS NULL;
UPDATE automation_logs SET executed_at = now() WHERE executed_at IS NULL;
ALTER TABLE automation_logs ALTER COLUMN success SET NOT NULL, ALTER COLUMN executed_at SET NOT NULL;

-- Équipe et collaboration
UPDATE profiles SET color = '#3B82F6' WHERE color IS NULL;
UPDATE profiles SET is_active = true WHERE is_active IS NULL;
ALTER TABLE profiles ALTER COLUMN color SET NOT NULL, ALTER COLUMN is_active SET NOT NULL;

UPDATE comments SET mentions = '{}' WHERE mentions IS NULL;
ALTER TABLE comments ALTER COLUMN mentions SET NOT NULL;

UPDATE milestones SET status = 'planned' WHERE status IS NULL;
UPDATE milestones SET is_client_commitment = true WHERE is_client_commitment IS NULL;
UPDATE milestones SET position = 0 WHERE position IS NULL;
ALTER TABLE milestones ALTER COLUMN status SET NOT NULL,
                       ALTER COLUMN is_client_commitment SET NOT NULL,
                       ALTER COLUMN position SET NOT NULL;

UPDATE subtasks SET is_done = false WHERE is_done IS NULL;
UPDATE subtasks SET position = 0 WHERE position IS NULL;
ALTER TABLE subtasks ALTER COLUMN is_done SET NOT NULL, ALTER COLUMN position SET NOT NULL;

UPDATE acceptance_checks SET status = 'todo' WHERE status IS NULL;
UPDATE acceptance_checks SET category = 'fonctionnel' WHERE category IS NULL;
UPDATE acceptance_checks SET position = 0 WHERE position IS NULL;
ALTER TABLE acceptance_checks ALTER COLUMN status SET NOT NULL,
                              ALTER COLUMN category SET NOT NULL,
                              ALTER COLUMN position SET NOT NULL;

UPDATE share_links SET allow_accept = true WHERE allow_accept IS NULL;
UPDATE share_links SET view_count = 0 WHERE view_count IS NULL;
ALTER TABLE share_links ALTER COLUMN allow_accept SET NOT NULL, ALTER COLUMN view_count SET NOT NULL;

UPDATE project_files SET file_type = 'link' WHERE file_type IS NULL;
ALTER TABLE project_files ALTER COLUMN file_type SET NOT NULL;

UPDATE time_entries SET date = CURRENT_DATE WHERE date IS NULL;
ALTER TABLE time_entries ALTER COLUMN date SET NOT NULL;

UPDATE proposals SET status = 'draft' WHERE status IS NULL;
UPDATE proposals SET features = '[]' WHERE features IS NULL;
UPDATE proposals SET content_provided = false WHERE content_provided IS NULL;
ALTER TABLE proposals ALTER COLUMN status SET NOT NULL, ALTER COLUMN features SET NOT NULL,
                      ALTER COLUMN content_provided SET NOT NULL;

-- Horodatages : toujours renseignés par leur valeur par défaut
ALTER TABLE projects   ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE tasks      ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE clients    ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE quotes     ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE invoices   ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE profiles   ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE comments   ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE milestones ALTER COLUMN created_at SET NOT NULL, ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE activity   ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE subtasks   ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE acceptance_checks ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE share_links ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE project_files ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE time_entries ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE events     ALTER COLUMN created_at SET NOT NULL;
