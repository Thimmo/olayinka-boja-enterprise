import { Catalogue } from '@/components/Catalogue'
import { Footer } from '@/components/Footer'
import { Masthead } from '@/components/Masthead'
import { createPublicClient } from '@/lib/supabase/public'
import type { Product } from '@/lib/types'

// Rebuild at most once a minute so a fabric she just uploaded appears quickly
// without re-querying on every single visit.
export const revalidate = 60

export default async function HomePage() {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const products = (data ?? []) as Product[]

  return (
    <>
      <Masthead />
      <main>
        {error ? (
          <div className="grid">
            <div className="empty">
              <h2>The catalogue did not load</h2>
              <p>Refresh the page. If it keeps happening, check the Supabase keys in .env.local.</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="grid">
            <div className="empty">
              <h2>No fabrics yet</h2>
              <p>Sign in and upload the first photos to fill this page.</p>
            </div>
          </div>
        ) : (
          <Catalogue products={products} />
        )}
      </main>
      <Footer />
    </>
  )
}
