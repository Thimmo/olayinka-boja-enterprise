import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/env'

/**
 * Read only client for the storefront. It deliberately does not touch cookies:
 * reading cookies would force Next to render those pages on every request,
 * and the catalogue is the same for everyone. Without them the pages cache and
 * revalidate on a timer instead, which is what keeps the site quick.
 */
export function createPublicClient() {
  return createSupabaseClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
