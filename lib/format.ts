const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

export function formatPrice(price: number | null): string | null {
  if (price === null || Number.isNaN(price)) return null
  return naira.format(price)
}

/** Public URL of a fabric photo held in the `products` storage bucket. */
export function imageUrl(imagePath: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
  return `${base}/storage/v1/object/public/products/${imagePath}`
}
