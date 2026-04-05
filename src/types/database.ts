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
  source: ClientSource
  status: ClientStatus
  notes: string | null
  created_at: string
}

export interface ClientInsert {
  id?: string
  project_id?: string | null
  name: string
  email?: string | null
  phone?: string | null
  source?: string
  status?: string
  notes?: string | null
  created_at?: string
}
