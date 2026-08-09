function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and fill it in.`,
    )
  }
  return value
}

export const SUPABASE_URL = () =>
  required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const SUPABASE_ANON_KEY = () =>
  required(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

/** Digits only, country code first: 2348031234567 */
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
).replace(/\D/g, '')

/**
 * Absolute origin for product links inside WhatsApp messages and for OpenGraph
 * tags. Those links persist in customers' chat history long after a deploy, so
 * a wrong value here is worse than a loud failure.
 *
 * Prefer the explicit variable, then Vercel's stable production domain — not
 * the per-deployment VERCEL_URL, which changes on every deploy. If neither
 * resolves while building on Vercel, stop the build rather than ship links
 * pointing at localhost, which is a failure nobody notices until a customer
 * taps one.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit

  const vercelProduction = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProduction) return `https://${vercelProduction}`

  // Set by Vercel during build and at runtime; never set locally.
  if (process.env.VERCEL) {
    throw new Error(
      'Missing NEXT_PUBLIC_SITE_URL. Set it in Vercel to the live address of ' +
        'the site, or every product link inside a WhatsApp message will point ' +
        'at localhost and open nothing for the customer.',
    )
  }

  return 'http://localhost:3000'
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, '')

export const STORE_LOCATION = process.env.NEXT_PUBLIC_STORE_LOCATION ?? ''

export const STORE_NAME = 'Olayinka Boja Enterprise'
