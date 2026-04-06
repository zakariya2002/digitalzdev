export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: Partial<ProjectInsert>
        Relationships: []
      }
      tasks: {
        Row: Task
        Insert: TaskInsert
        Update: Partial<TaskInsert>
        Relationships: []
      }
      events: {
        Row: CalendarEvent
        Insert: EventInsert
        Update: Partial<EventInsert>
        Relationships: []
      }
      revenues: {
        Row: Revenue
        Insert: RevenueInsert
        Update: Partial<RevenueInsert>
        Relationships: []
      }
      clients: {
        Row: Client
        Insert: ClientInsert
        Update: Partial<ClientInsert>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type ProjectType = 'landing' | 'vitrine' | 'ecommerce' | 'custom' | 'mobile' | 'maintenance' | 'audit' | 'other'
export type ProjectStatus = 'briefing' | 'design' | 'development' | 'review' | 'delivered' | 'active' | 'archived'

export interface Project {
  id: string
  name: string
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
  created_at: string
  updated_at: string
}

export interface ProjectInsert {
  id?: string
  name: string
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

export interface Task {
  id: string
  project_id: string | null
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
  description: string | null
  hours: number
  date: string
  created_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  name: string
  url: string
  file_type: 'link' | 'figma' | 'drive' | 'github' | 'other'
  created_at: string
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
