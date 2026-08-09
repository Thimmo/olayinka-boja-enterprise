import type { Metadata, Viewport } from 'next'
import { SITE_URL, STORE_NAME } from '@/lib/env'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${STORE_NAME} — Fabrics`,
  description:
    'Lace, ankara, aso oke and more. Browse the fabrics and message us on WhatsApp to buy.',
}

export const viewport: Viewport = {
  themeColor: '#0b0d1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=Outfit:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
