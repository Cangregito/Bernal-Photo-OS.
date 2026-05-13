import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const isSupabaseConfigured =
	Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
	Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
	process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://dummy.supabase.co'

// Si estamos en el entorno del servidor y tenemos la llave maestra, la usamos para
// saltar el Row Level Security (RLS) en los repositorios de servidor del Dashboard Admin.
const isServer = typeof window === 'undefined'
const key = isServer && supabaseServiceKey ? supabaseServiceKey : supabaseAnonKey

export const supabase = createClient(supabaseUrl, key)
