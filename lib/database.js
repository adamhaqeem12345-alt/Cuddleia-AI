import { createClient } from '@supabase/supabase-js'
import { rateLimiter } from './security.js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Secure database operations
export async function secureDbOperation(operation, userId = null) {
  try {
    // Rate limiting per user
    if (userId) {
      try {
        await rateLimiter.consume(`db_${userId}`, 1)
      } catch (rateLimitError) {
        throw new Error('Rate limit exceeded')
      }
    }

    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    throw error
  }
}
