import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Masthead } from '@/components/Masthead'

export default function NotFound() {
  return (
    <>
      <Masthead />
      <main>
        <div className="grid">
          <div className="empty">
            <h2>This page does not exist</h2>
            <p>The link may be mistyped. Everything she sells is on the main page.</p>
            <p style={{ marginTop: '1.25rem' }}>
              <Link className="back" href="/">
                ← All fabrics
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
