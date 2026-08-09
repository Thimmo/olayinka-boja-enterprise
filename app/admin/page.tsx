import { AdminClient } from '@/app/admin/AdminClient'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminClient initialProducts={(data ?? []) as Product[]} />
}
