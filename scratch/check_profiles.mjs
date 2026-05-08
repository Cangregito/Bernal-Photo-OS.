import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'profiles' })
  if (error) {
    // If RPC doesn't exist, try a simple query
    console.log('RPC get_table_info not found, trying select * limit 0')
    const { error: selectError } = await supabase.from('profiles').select('*').limit(0)
    if (selectError) {
      console.error('Error selecting from profiles:', selectError.message)
    } else {
      console.log('Profiles table exists')
    }
  } else {
    console.log('Profiles schema:', data)
  }
}

checkSchema()
