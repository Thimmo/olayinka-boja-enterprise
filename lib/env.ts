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
 * Absolute origin used for product links inside WhatsApp messages and for
 * OpenGraph tags. Prefer the explicit value; fall back to the stable Vercel
 * production domain so a forgotten env var can't ship dead localhost links.
 * The per-deployment VERCEL_URL is deliberately not used: it changes on every
 * deploy, and these links live on in customers' chat history.
 */
const vercelProductionUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelProductionUrl ? `https://${vercelProductionUrl}` : 'http://localhost:3000')
).replace(/\/$/, '')

export const STORE_LOCATION = process.env.NEXT_PUBLIC_STORE_LOCATION ?? ''

export const STORE_NAME = 'Olayinka Boja Enterprise'
