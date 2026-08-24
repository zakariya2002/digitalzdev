import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase-generated'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient<Database> = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as SupabaseClient<Database>, {
      get: () => () => {
        console.warn('Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
        return { data: null, error: null }
      },
    })
