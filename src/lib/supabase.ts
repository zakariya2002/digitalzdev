import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as SupabaseClient, {
      get: () => () => {
        console.warn('Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
        return { data: null, error: null }
      },
    })
