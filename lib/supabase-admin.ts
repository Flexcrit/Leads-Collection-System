import { createClient } from '@supabase/supabase-js'

// This uses the service role key for admin operations
// IMPORTANT: Never expose this key to the client!
// Get your service role key from: Supabase Dashboard → Settings → API → service_role key
const supabaseUrl = 'https://nwqerhyexssquzgeudoy.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. User creation will not work.')
}

export function createAdminClient() {
  if (!serviceRoleKey) {
    throw new Error('Service role key not configured')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

