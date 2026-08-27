// Le schéma complet est généré depuis la base : voir supabase-generated.ts
export type { Database } from './supabase-generated'


// === ÉQUIPE : PROFILS, RÔLES, COMMENTAIRES ===

export type Role = 'owner' | 'manager' | 'member'

export interface Profile {
  id: string
  full_name: string
  email: string | null
  role: Role
  job_title: string | null
  color: string
  is_active: boolean
  hourly_rate: number | null
  /** Identité sous laquelle ce membre émet ses devis et factures */
  issuer_name: string | null
  issuer_brand: string | null
  issuer_legal_form: string | null
  issuer_siret: string | null
  issuer_rm: string | null
  issuer_address: string | null
  issuer_email: string | null
  issuer_phone: string | null
  issuer_logo_url: string | null
  iban: string | null
  bic: string | null
  bank_name: string | null
  document_template: 'classic' | 'agency'
  document_accent: string
  created_at: string
  updated_at: string
}

export type CommentEntity = 'task' | 'project' | 'client' | 'quote' | 'invoice'

export interface Comment {
  id: string
  entity_type: CommentEntity
  entity_id: string
  author_id: string | null
  body: string
  mentions: string[]
  created_at: string
  updated_at: string
  author?: Profile
}


export type NotificationType = 'mention' | 'comment' | 'assignment' | 'activity'

/** Notification persistée, propre à un destinataire. Nommée AppNotification pour ne pas
 *  entrer en collision avec le type Notification du navigateur. */
export interface AppNotification {
  id: string
  recipient_id: string
  actor_id: string | null
  type: NotificationType
  entity_type: CommentEntity
  entity_id: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

export interface ActivityEntry {
  id: string
  actor_id: string | null
  entity_type: CommentEntity | 'comment'
  entity_id: string
  project_id: string | null
  action: string
  summary: string
  created_at: string
}


// === PRODUCTION : JALONS, SOUS-TÂCHES, RECETTE, CHRONOMÈTRE ===

export type MilestoneStatus = 'planned' | 'at_risk' | 'reached' | 'missed'

export interface Milestone {
  id: string
  project_id: string
  title: string
  description: string | null
  due_date: string
  status: MilestoneStatus
  is_client_commitment: boolean
  reached_at: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  is_done: boolean
  position: number
  done_at: string | null
  done_by: string | null
  created_at: string
}

export type CheckCategory = 'fonctionnel' | 'design' | 'contenu' | 'technique' | 'seo' | 'legal'
export type CheckStatus = 'todo' | 'ok' | 'ko'

export interface AcceptanceCheck {
  id: string
  project_id: string
  title: string
  category: CheckCategory
  status: CheckStatus
  note: string | null
  checked_by: string | null
  checked_at: string | null
  position: number
  created_at: string
}

export interface ActiveTimer {
  profile_id: string
  task_id: string
  project_id: string | null
  description: string | null
  started_at: string
}

export interface RevenueLedgerEntry {
  id: string
  project_id: string | null
  amount: number
  description: string
  month: string
  occurred_at: string
  source: 'payment' | 'manual'
}


// === CONTENUS ATTENDUS DU CLIENT ===

export type ContentKind = 'file' | 'text' | 'both'
export type ContentCategory = 'identite' | 'contenu' | 'media' | 'juridique' | 'technique' | 'autre'
export type ContentStatus = 'pending' | 'received' | 'validated' | 'rejected'

export interface ContentRequest {
  id: string
  project_id: string
  label: string
  description: string | null
  kind: ContentKind
  category: ContentCategory
  is_required: boolean
  status: ContentStatus
  response_text: string | null
  review_note: string | null
  due_date: string | null
  position: number
  received_at: string | null
  validated_at: string | null
  validated_by: string | null
  created_at: string
  updated_at: string
}

export type ProjectType = 'landing' | 'vitrine' | 'ecommerce' | 'custom' | 'mobile' | 'maintenance' | 'audit' | 'other'
export type ProjectStatus = 'briefing' | 'design' | 'development' | 'review' | 'delivered' | 'active' | 'archived'

export type Visibility = 'private' | 'team'

export interface Project {
  id: string
  name: string
  lead_id: string | null
  owner_id: string | null
  /** « team » rend le projet et tout ce qui s'y rattache visible de l'équipe */
  visibility: Visibility
  color: string
  icon: string | null
  is_archived: boolean
  client_id: string | null
  status: ProjectStatus
  budget: number | null
  start_date: string | null
  end_date: string | null
  project_type: ProjectType | null
  description: string | null
  hourly_rate: number | null
  created_at: string
  updated_at: string
}

export interface ProjectInsert {
  id?: string
  name: string
  lead_id?: string | null
  owner_id?: string | null
  visibility?: string
  color?: string
  icon?: string | null
  is_archived?: boolean
  client_id?: string | null
  status?: string
  budget?: number | null
  start_date?: string | null
  end_date?: string | null
  project_type?: string | null
  description?: string | null
  created_at?: string
  updated_at?: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'

export type TaskKind = 'task' | 'bug'
export type BugSeverity = 'critical' | 'major' | 'minor'

export interface Task {
  id: string
  project_id: string | null
  assignee_id: string | null
  kind: TaskKind
  severity: BugSeverity | null
  steps_to_reproduce: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  deadline: string | null
  tags: string[]
  position: number
  completed_at: string | null
  estimated_hours: number | null
  actual_hours: number
  created_at: string
  updated_at: string
}

export interface TaskInsert {
  id?: string
  project_id?: string | null
  assignee_id?: string | null
  kind?: string
  severity?: string | null
  steps_to_reproduce?: string | null
  title: string
  description?: string | null
  status?: string
  priority?: string
  deadline?: string | null
  tags?: string[]
  position?: number
  completed_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface CalendarEvent {
  id: string
  project_id: string | null
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  all_day: boolean
  created_at: string
}

export interface EventInsert {
  id?: string
  project_id?: string | null
  title: string
  description?: string | null
  start_time: string
  end_time?: string | null
  all_day?: boolean
  created_at?: string
}

export type ClientStatus = 'new_lead' | 'contacted' | 'qualified' | 'active' | 'completed'
export type ClientSource = 'facebook' | 'manual' | 'website' | 'referral' | 'other'

export interface Revenue {
  id: string
  project_id: string | null
  amount: number
  description: string | null
  month: string
  created_at: string
}

export interface RevenueInsert {
  id?: string
  project_id?: string | null
  amount: number
  description?: string | null
  month: string
  created_at?: string
}

export interface Client {
  id: string
  project_id: string | null
  name: string
  email: string | null
  phone: string | null
  phone_secondary: string | null
  source: ClientSource
  status: ClientStatus
  notes: string | null
  last_contacted_at: string | null
  next_follow_up_at: string | null
  call_count: number
  sms_count: number
  owner_id: string | null
  visibility: Visibility
  /** Mentions du destinataire, reprises sur les devis et factures */
  trade_name: string | null
  legal_form: string | null
  share_capital: string | null
  siren: string | null
  rcs: string | null
  vat_number: string | null
  representative: string | null
  contact_name: string | null
  address: string | null
  created_at: string
}

export interface ClientInsert {
  id?: string
  project_id?: string | null
  name: string
  email?: string | null
  phone?: string | null
  phone_secondary?: string | null
  source?: string
  status?: string
  notes?: string | null
  next_follow_up_at?: string | null
  created_at?: string
}

// --- Telephony types ---

export type CallDirection = 'inbound' | 'outbound'
export type CallStatus = 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'no_answer' | 'busy' | 'failed' | 'canceled'
export type SmsDirection = 'inbound' | 'outbound'
export type SmsStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'received'
export type SmsTemplateCategory = 'relance' | 'confirmation' | 'custom'

export interface Call {
  id: string
  client_id: string
  twilio_call_sid: string | null
  direction: CallDirection
  status: CallStatus
  duration: number | null
  recording_url: string | null
  call_note: string | null
  called_at: string
  created_at: string
  updated_at: string
}

export interface CallInsert {
  id?: string
  client_id: string
  twilio_call_sid?: string | null
  direction: CallDirection
  status?: CallStatus
  duration?: number | null
  recording_url?: string | null
  call_note?: string | null
  called_at?: string
}

export interface Sms {
  id: string
  client_id: string
  twilio_message_sid: string | null
  direction: SmsDirection
  body: string
  status: SmsStatus
  template_id: string | null
  sent_at: string
  created_at: string
  updated_at: string
}

export interface SmsInsert {
  id?: string
  client_id: string
  twilio_message_sid?: string | null
  direction: SmsDirection
  body: string
  status?: SmsStatus
  template_id?: string | null
  sent_at?: string
}

export interface SmsTemplate {
  id: string
  name: string
  body: string
  category: SmsTemplateCategory
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SmsTemplateInsert {
  id?: string
  name: string
  body: string
  category: SmsTemplateCategory
  is_active?: boolean
}

export interface TimelineEvent {
  type: 'call' | 'sms'
  id: string
  timestamp: string
  summary: string
  data: Call | Sms
}

// === MODULE 1 : DEVIS & FACTURATION ===

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
export type PaymentMethod = 'virement' | 'carte' | 'paypal' | 'especes' | 'cheque' | 'autre'

export interface Quote {
  id: string
  client_id: string | null
  project_id: string | null
  quote_number: string
  title: string
  description: string | null
  status: QuoteStatus
  valid_until: string | null
  notes: string | null
  terms: string | null
  total_amount: number
  accepted_at: string | null
  sent_at: string | null
  created_by: string | null
  owner_id: string | null
  duration_note: string | null
  created_at: string
  updated_at: string
  items?: QuoteItem[]
  client?: Client
  project?: Project
}

export interface QuoteItem {
  id: string
  quote_id: string
  description: string
  unit: string | null
  quantity: number
  unit_price: number
  total: number
  position: number
  created_at: string
}

export interface Invoice {
  id: string
  quote_id: string | null
  client_id: string | null
  project_id: string | null
  invoice_number: string
  title: string
  description: string | null
  status: InvoiceStatus
  issue_date: string
  due_date: string | null
  notes: string | null
  terms: string | null
  total_amount: number
  paid_amount: number
  paid_at: string | null
  sent_at: string | null
  created_by: string | null
  owner_id: string | null
  created_at: string
  updated_at: string
  items?: InvoiceItem[]
  client?: Client
  project?: Project
  payments?: Payment[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  unit: string | null
  quantity: number
  unit_price: number
  total: number
  position: number
  created_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  method: PaymentMethod
  reference: string | null
  paid_at: string
  notes: string | null
  created_at: string
}

// === MODULE 2 : PROJET AVANCÉ ===

export interface TimeEntry {
  id: string
  task_id: string
  project_id: string | null
  profile_id: string | null
  description: string | null
  hours: number
  date: string
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  name: string
  url: string
  file_type: 'link' | 'figma' | 'drive' | 'github' | 'upload' | 'other'
  storage_path: string | null
  size_bytes: number | null
  mime_type: string | null
  uploaded_by: string | null
  content_request_id: string | null
  uploaded_by_client: boolean
  client_name: string | null
  created_at: string
}

export type EnvironmentKind = 'production' | 'staging' | 'registrar' | 'dns' | 'hosting' | 'repository' | 'analytics' | 'other'

export interface ProjectEnvironment {
  id: string
  project_id: string
  kind: EnvironmentKind
  label: string
  url: string | null
  username: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// === MODULE 3 : PROPOSITIONS ===

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

export interface Proposal {
  id: string
  client_id: string | null
  title: string
  project_type: ProjectType | null
  status: ProposalStatus
  client_company: string | null
  client_contact: string | null
  client_email: string | null
  client_phone: string | null
  project_description: string | null
  objectives: string | null
  target_audience: string | null
  features: string[]
  design_preferences: string | null
  inspirations: string | null
  seo_requirements: string | null
  hosting_needs: string | null
  content_provided: boolean
  timeline: string | null
  budget_range: string | null
  additional_notes: string | null
  estimated_amount: number | null
  quote_id: string | null
  sent_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
  client?: Client
}

// === MODULE 4 : AUTOMATISATION ===

export type TriggerType = 'lead_no_activity' | 'quote_no_response' | 'invoice_overdue' | 'follow_up_due' | 'project_milestone'
export type ActionType = 'sms' | 'email' | 'notification' | 'status_change'

export interface AutomationRule {
  id: string
  name: string
  trigger_type: TriggerType
  trigger_delay_days: number
  action_type: ActionType
  action_template: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AutomationLog {
  id: string
  rule_id: string
  entity_type: 'client' | 'quote' | 'invoice' | 'project'
  entity_id: string
  action_taken: string
  executed_at: string
  success: boolean
  error_message: string | null
}
