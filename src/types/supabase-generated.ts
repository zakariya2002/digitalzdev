export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acceptance_checks: {
        Row: {
          category: string
          checked_at: string | null
          checked_by: string | null
          created_at: string
          id: string
          note: string | null
          position: number
          project_id: string
          status: string
          title: string
        }
        Insert: {
          category?: string
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          position?: number
          project_id: string
          status?: string
          title: string
        }
        Update: {
          category?: string
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          position?: number
          project_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceptance_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceptance_checks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      active_timers: {
        Row: {
          description: string | null
          profile_id: string
          project_id: string | null
          started_at: string
          task_id: string
        }
        Insert: {
          description?: string | null
          profile_id: string
          project_id?: string | null
          started_at?: string
          task_id: string
        }
        Update: {
          description?: string | null
          profile_id?: string
          project_id?: string | null
          started_at?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_timers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_timers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      activity: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          project_id: string | null
          summary: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          project_id?: string | null
          summary: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          project_id?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          action_taken: string
          entity_id: string
          entity_type: string
          error_message: string | null
          executed_at: string
          id: string
          rule_id: string
          success: boolean
        }
        Insert: {
          action_taken: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          executed_at?: string
          id?: string
          rule_id: string
          success?: boolean
        }
        Update: {
          action_taken?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          executed_at?: string
          id?: string
          rule_id?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_template: string | null
          action_type: string
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          trigger_delay_days: number
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_template?: string | null
          action_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_delay_days?: number
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_template?: string | null
          action_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_delay_days?: number
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calls: {
        Row: {
          call_note: string | null
          called_at: string
          client_id: string
          created_at: string | null
          direction: string
          duration: number | null
          id: string
          recording_url: string | null
          status: string
          twilio_call_sid: string | null
          updated_at: string | null
        }
        Insert: {
          call_note?: string | null
          called_at?: string
          client_id: string
          created_at?: string | null
          direction: string
          duration?: number | null
          id?: string
          recording_url?: string | null
          status?: string
          twilio_call_sid?: string | null
          updated_at?: string | null
        }
        Update: {
          call_note?: string | null
          called_at?: string
          client_id?: string
          created_at?: string | null
          direction?: string
          duration?: number | null
          id?: string
          recording_url?: string | null
          status?: string
          twilio_call_sid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          call_count: number
          created_at: string
          email: string | null
          id: string
          last_contacted_at: string | null
          legal_form: string | null
          name: string
          next_follow_up_at: string | null
          notes: string | null
          phone: string | null
          phone_secondary: string | null
          project_id: string | null
          representative: string | null
          share_capital: string | null
          siren: string | null
          sms_count: number
          source: string
          status: string
        }
        Insert: {
          address?: string | null
          call_count?: number
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          legal_form?: string | null
          name: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          phone_secondary?: string | null
          project_id?: string | null
          representative?: string | null
          share_capital?: string | null
          siren?: string | null
          sms_count?: number
          source?: string
          status?: string
        }
        Update: {
          address?: string | null
          call_count?: number
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          legal_form?: string | null
          name?: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          phone_secondary?: string | null
          project_id?: string | null
          representative?: string | null
          share_capital?: string | null
          siren?: string | null
          sms_count?: number
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          mentions: string[]
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          mentions?: string[]
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          mentions?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          account_holder: string | null
          active_regime_id: string | null
          address: string | null
          bank_name: string | null
          bic: string | null
          email: string | null
          eur_to_dzd: number | null
          iban: string | null
          id: boolean
          ip_terms: string | null
          late_penalty_terms: string | null
          legal_form: string | null
          legal_name: string | null
          logo_url: string | null
          payment_reference_note: string | null
          payment_terms: string | null
          phone: string | null
          siret: string | null
          trade_name: string | null
          updated_at: string
          validity_days: number
          vat_applicable: boolean
          vat_number: string | null
          vat_rate: number
        }
        Insert: {
          account_holder?: string | null
          active_regime_id?: string | null
          address?: string | null
          bank_name?: string | null
          bic?: string | null
          email?: string | null
          eur_to_dzd?: number | null
          iban?: string | null
          id?: boolean
          ip_terms?: string | null
          late_penalty_terms?: string | null
          legal_form?: string | null
          legal_name?: string | null
          logo_url?: string | null
          payment_reference_note?: string | null
          payment_terms?: string | null
          phone?: string | null
          siret?: string | null
          trade_name?: string | null
          updated_at?: string
          validity_days?: number
          vat_applicable?: boolean
          vat_number?: string | null
          vat_rate?: number
        }
        Update: {
          account_holder?: string | null
          active_regime_id?: string | null
          address?: string | null
          bank_name?: string | null
          bic?: string | null
          email?: string | null
          eur_to_dzd?: number | null
          iban?: string | null
          id?: boolean
          ip_terms?: string | null
          late_penalty_terms?: string | null
          legal_form?: string | null
          legal_name?: string | null
          logo_url?: string | null
          payment_reference_note?: string | null
          payment_terms?: string | null
          phone?: string | null
          siret?: string | null
          trade_name?: string | null
          updated_at?: string
          validity_days?: number
          vat_applicable?: boolean
          vat_number?: string | null
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_active_regime_id_fkey"
            columns: ["active_regime_id"]
            isOneToOne: false
            referencedRelation: "tax_regimes"
            referencedColumns: ["id"]
          },
        ]
      }
      content_requests: {
        Row: {
          category: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_required: boolean
          kind: string
          label: string
          position: number
          project_id: string
          received_at: string | null
          response_text: string | null
          review_note: string | null
          status: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_required?: boolean
          kind?: string
          label: string
          position?: number
          project_id: string
          received_at?: string | null
          response_text?: string | null
          review_note?: string | null
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_required?: boolean
          kind?: string
          label?: string
          position?: number
          project_id?: string
          received_at?: string | null
          response_text?: string | null
          review_note?: string | null
          status?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_requests_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          category: string
          description: string | null
          id: string
          is_required: boolean
          kind: string
          label: string
          position: number
          project_type: string
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          is_required?: boolean
          kind?: string
          label: string
          position?: number
          project_type: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          is_required?: boolean
          kind?: string
          label?: string
          position?: number
          project_type?: string
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string
          profile_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string
          profile_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          last_message_at: string
          name: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          last_message_at?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          last_message_at?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          project_id: string | null
          start_time: string
          title: string
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          project_id?: string | null
          start_time: string
          title: string
        }
        Update: {
          all_day?: boolean
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          project_id?: string | null
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          position: number
          quantity: number
          total: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          position?: number
          quantity?: number
          total?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          position?: number
          quantity?: number
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_amount: number
          paid_at: string | null
          project_id: string | null
          quote_id: string | null
          sent_at: string | null
          status: string
          terms: string | null
          title: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          project_id?: string | null
          quote_id?: string | null
          sent_at?: string | null
          status?: string
          terms?: string | null
          title: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          project_id?: string | null
          quote_id?: string | null
          sent_at?: string | null
          status?: string
          terms?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_id: string | null
          body: string
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_client_commitment: boolean
          position: number
          project_id: string
          reached_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_client_commitment?: boolean
          position?: number
          project_id: string
          reached_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_client_commitment?: boolean
          position?: number
          project_id?: string
          reached_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          link: string | null
          read_at: string | null
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          link?: string | null
          read_at?: string | null
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          link?: string | null
          read_at?: string | null
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          method: string
          notes: string | null
          paid_at: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          method?: string
          notes?: string | null
          paid_at?: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          method?: string
          notes?: string | null
          paid_at?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          color: string
          created_at: string
          email: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean
          job_title: string | null
          role: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          email?: string | null
          full_name: string
          hourly_rate?: number | null
          id: string
          is_active?: boolean
          job_title?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          email?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_environments: {
        Row: {
          created_at: string | null
          id: string
          kind: string
          label: string
          notes: string | null
          project_id: string
          updated_at: string | null
          url: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kind: string
          label: string
          notes?: string | null
          project_id: string
          updated_at?: string | null
          url?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kind?: string
          label?: string
          notes?: string | null
          project_id?: string
          updated_at?: string | null
          url?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_environments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          client_name: string | null
          content_request_id: string | null
          created_at: string
          file_type: string
          id: string
          mime_type: string | null
          name: string
          project_id: string
          size_bytes: number | null
          storage_path: string | null
          uploaded_by: string | null
          uploaded_by_client: boolean
          url: string
        }
        Insert: {
          client_name?: string | null
          content_request_id?: string | null
          created_at?: string
          file_type?: string
          id?: string
          mime_type?: string | null
          name: string
          project_id: string
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_by?: string | null
          uploaded_by_client?: boolean
          url: string
        }
        Update: {
          client_name?: string | null
          content_request_id?: string | null
          created_at?: string
          file_type?: string
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_by?: string | null
          uploaded_by_client?: boolean
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_content_request_id_fkey"
            columns: ["content_request_id"]
            isOneToOne: false
            referencedRelation: "content_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          color: string
          created_at: string
          description: string | null
          end_date: string | null
          hourly_rate: number | null
          icon: string | null
          id: string
          is_archived: boolean
          lead_id: string | null
          name: string
          project_type: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          color?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          icon?: string | null
          id?: string
          is_archived?: boolean
          lead_id?: string | null
          name: string
          project_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          color?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          hourly_rate?: number | null
          icon?: string | null
          id?: string
          is_archived?: boolean
          lead_id?: string | null
          name?: string
          project_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          additional_notes: string | null
          budget_range: string | null
          client_company: string | null
          client_contact: string | null
          client_email: string | null
          client_id: string | null
          client_phone: string | null
          content_provided: boolean
          created_at: string | null
          design_preferences: string | null
          estimated_amount: number | null
          features: Json
          hosting_needs: string | null
          id: string
          inspirations: string | null
          objectives: string | null
          project_description: string | null
          project_type: string | null
          quote_id: string | null
          sent_at: string | null
          seo_requirements: string | null
          status: string
          target_audience: string | null
          timeline: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          additional_notes?: string | null
          budget_range?: string | null
          client_company?: string | null
          client_contact?: string | null
          client_email?: string | null
          client_id?: string | null
          client_phone?: string | null
          content_provided?: boolean
          created_at?: string | null
          design_preferences?: string | null
          estimated_amount?: number | null
          features?: Json
          hosting_needs?: string | null
          id?: string
          inspirations?: string | null
          objectives?: string | null
          project_description?: string | null
          project_type?: string | null
          quote_id?: string | null
          sent_at?: string | null
          seo_requirements?: string | null
          status?: string
          target_audience?: string | null
          timeline?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          additional_notes?: string | null
          budget_range?: string | null
          client_company?: string | null
          client_contact?: string | null
          client_email?: string | null
          client_id?: string | null
          client_phone?: string | null
          content_provided?: boolean
          created_at?: string | null
          design_preferences?: string | null
          estimated_amount?: number | null
          features?: Json
          hosting_needs?: string | null
          id?: string
          inspirations?: string | null
          objectives?: string | null
          project_description?: string | null
          project_type?: string | null
          quote_id?: string | null
          sent_at?: string | null
          seo_requirements?: string | null
          status?: string
          target_audience?: string | null
          timeline?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_api_calls: {
        Row: {
          cost_estimate: number | null
          created_at: string | null
          duration_ms: number | null
          email: string | null
          error_code: string | null
          id: string
          ip_address: unknown
          success: boolean | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string | null
          duration_ms?: number | null
          email?: string | null
          error_code?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string | null
          duration_ms?: number | null
          email?: string | null
          error_code?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean | null
        }
        Relationships: []
      }
      quiz_demos: {
        Row: {
          config: Json
          created_at: string | null
          expires_at: string | null
          id: string
          lead_id: string | null
          quiz_response_id: string | null
          share_count: number | null
          view_count: number | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          quiz_response_id?: string | null
          share_count?: number | null
          view_count?: number | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          quiz_response_id?: string | null
          share_count?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_demos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_demos_quiz_response_id_fkey"
            columns: ["quiz_response_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_leads: {
        Row: {
          created_at: string | null
          email: string
          first_quiz_at: string | null
          has_booked: boolean | null
          id: string
          last_quiz_at: string | null
          total_generations: number | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_quiz_at?: string | null
          has_booked?: boolean | null
          id?: string
          last_quiz_at?: string | null
          total_generations?: number | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_quiz_at?: string | null
          has_booked?: boolean | null
          id?: string
          last_quiz_at?: string | null
          total_generations?: number | null
          utm_source?: string | null
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          brand_name: string
          created_at: string | null
          features: Json
          id: string
          ip_address: unknown
          lead_id: string | null
          mood: string
          palette_id: string
          project_type: string
          sector: string
          target: string
          user_agent: string | null
        }
        Insert: {
          brand_name: string
          created_at?: string | null
          features: Json
          id?: string
          ip_address?: unknown
          lead_id?: string | null
          mood: string
          palette_id: string
          project_type: string
          sector: string
          target: string
          user_agent?: string | null
        }
        Update: {
          brand_name?: string
          created_at?: string | null
          features?: Json
          id?: string
          ip_address?: unknown
          lead_id?: string | null
          mood?: string
          palette_id?: string
          project_type?: string
          sector?: string
          target?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          position: number
          quantity: number
          quote_id: string
          total: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          position?: number
          quantity?: number
          quote_id: string
          total?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          position?: number
          quantity?: number
          quote_id?: string
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          client_id: string | null
          created_at: string
          description: string | null
          duration_note: string | null
          id: string
          notes: string | null
          project_id: string | null
          quote_number: string
          sent_at: string | null
          status: string
          terms: string | null
          title: string
          total_amount: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_note?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          quote_number: string
          sent_at?: string | null
          status?: string
          terms?: string | null
          title: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          duration_note?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          quote_number?: string
          sent_at?: string | null
          status?: string
          terms?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      revenues: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          month: string
          project_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          month: string
          project_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          month?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          current_number: number | null
          current_year: number
          id: string
          prefix: string
        }
        Insert: {
          current_number?: number | null
          current_year: number
          id: string
          prefix: string
        }
        Update: {
          current_number?: number | null
          current_year?: number
          id?: string
          prefix?: string
        }
        Relationships: []
      }
      share_links: {
        Row: {
          allow_accept: boolean
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          first_viewed_at: string | null
          id: string
          label: string | null
          last_viewed_at: string | null
          responded_at: string | null
          response: string | null
          response_name: string | null
          revoked_at: string | null
          token: string
          view_count: number
        }
        Insert: {
          allow_accept?: boolean
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          first_viewed_at?: string | null
          id?: string
          label?: string | null
          last_viewed_at?: string | null
          responded_at?: string | null
          response?: string | null
          response_name?: string | null
          revoked_at?: string | null
          token?: string
          view_count?: number
        }
        Update: {
          allow_accept?: boolean
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          first_viewed_at?: string | null
          id?: string
          label?: string | null
          last_viewed_at?: string | null
          responded_at?: string | null
          response?: string | null
          response_name?: string | null
          revoked_at?: string | null
          token?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "share_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms: {
        Row: {
          body: string
          client_id: string
          created_at: string | null
          direction: string
          id: string
          sent_at: string
          status: string
          template_id: string | null
          twilio_message_sid: string | null
          updated_at: string | null
        }
        Insert: {
          body: string
          client_id: string
          created_at?: string | null
          direction: string
          id?: string
          sent_at?: string
          status?: string
          template_id?: string | null
          twilio_message_sid?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          client_id?: string
          created_at?: string | null
          direction?: string
          id?: string
          sent_at?: string
          status?: string
          template_id?: string | null
          twilio_message_sid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          body: string
          category: string
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          body: string
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          created_at: string
          done_at: string | null
          done_by: string | null
          id: string
          is_done: boolean
          position: number
          task_id: string
          title: string
        }
        Insert: {
          created_at?: string
          done_at?: string | null
          done_by?: string | null
          id?: string
          is_done?: boolean
          position?: number
          task_id: string
          title: string
        }
        Update: {
          created_at?: string
          done_at?: string | null
          done_by?: string | null
          id?: string
          is_done?: boolean
          position?: number
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_done_by_fkey"
            columns: ["done_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          kind: string
          position: number
          priority: string
          project_id: string | null
          severity: string | null
          status: string
          steps_to_reproduce: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          kind?: string
          position?: number
          priority?: string
          project_id?: string | null
          severity?: string | null
          status?: string
          steps_to_reproduce?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          kind?: string
          position?: number
          priority?: string
          project_id?: string | null
          severity?: string | null
          status?: string
          steps_to_reproduce?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_regimes: {
        Row: {
          country: string
          created_at: string
          currency: string
          fiscal_year: number
          id: string
          is_active: boolean
          label: string
          notes: string | null
          params: Json
          position: number
          source_note: string | null
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          currency?: string
          fiscal_year: number
          id: string
          is_active?: boolean
          label: string
          notes?: string | null
          params?: Json
          position?: number
          source_note?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string
          fiscal_year?: number
          id?: string
          is_active?: boolean
          label?: string
          notes?: string | null
          params?: Json
          position?: number
          source_note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string
          date: string
          description: string | null
          ended_at: string | null
          hours: number
          id: string
          profile_id: string | null
          project_id: string | null
          started_at: string | null
          task_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          description?: string | null
          ended_at?: string | null
          hours: number
          id?: string
          profile_id?: string | null
          project_id?: string | null
          started_at?: string | null
          task_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          ended_at?: string | null
          hours?: number
          id?: string
          profile_id?: string | null
          project_id?: string | null
          started_at?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      work_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          is_manual: boolean
          note: string | null
          profile_id: string
          started_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          is_manual?: boolean
          note?: string | null
          profile_id: string
          started_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          is_manual?: boolean
          note?: string | null
          profile_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      revenue_ledger: {
        Row: {
          amount: number | null
          description: string | null
          id: string | null
          month: string | null
          occurred_at: string | null
          project_id: string | null
          source: string | null
        }
        Relationships: []
      }
      work_days: {
        Row: {
          day: string | null
          first_in: string | null
          hours: number | null
          is_open: boolean | null
          last_out: string | null
          profile_id: string | null
          sessions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_task_hours: {
        Args: { p_hours: number; p_task_id: string }
        Returns: undefined
      }
      close_stale_sessions: { Args: never; Returns: number }
      current_user_role: { Args: never; Returns: string }
      entity_label: { Args: { eid: string; etype: string }; Returns: string }
      entity_link: { Args: { eid: string; etype: string }; Returns: string }
      entity_project: { Args: { eid: string; etype: string }; Returns: string }
      increment_demo_share: { Args: { demo_id: string }; Returns: undefined }
      increment_demo_view: { Args: { demo_id: string }; Returns: undefined }
      is_conversation_member: { Args: { conv: string }; Returns: boolean }
      move_task: {
        Args: { p_position: number; p_status: string; p_task_id: string }
        Returns: undefined
      }
      next_sequence_number: { Args: { seq_id: string }; Returns: string }
      open_direct_conversation: { Args: { p_other: string }; Returns: string }
      punch: { Args: { p_note?: string }; Returns: Json }
      record_share_response: {
        Args: { p_name: string; p_response: string; p_token: string }
        Returns: Json
      }
      refresh_milestone_states: { Args: never; Returns: number }
      run_automation_rules: { Args: never; Returns: number }
      seed_content_requests: { Args: { p_project: string }; Returns: number }
      share_link_is_valid: {
        Args: { l: Database["public"]["Tables"]["share_links"]["Row"] }
        Returns: boolean
      }
      stop_timer: {
        Args: { p_note?: string }
        Returns: {
          hours: number
          task_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
