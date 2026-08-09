import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Masthead } from '@/components/Masthead'

export default function ProductNotFound() {
  return (
    <>
      <Masthead />
      <main className="detail">
        <div className="empty">
          <h2>That fabric is no longer listed</h2>
          <p>It may have sold. Browse what is available now.</p>
          <p style={{ marginTop: '1.25rem' }}>
            <Link className="back" href="/">
              ← All fabrics
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
