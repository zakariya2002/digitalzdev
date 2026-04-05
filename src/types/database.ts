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

export interface Project {
  id: string
  name: string
  color: string
  icon: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface ProjectInsert {
  id?: string
  name: string
  color?: string
  icon?: string | null
  is_archived?: boolean
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
