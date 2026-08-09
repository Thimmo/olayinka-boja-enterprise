import { SITE_URL, STORE_NAME, WHATSAPP_NUMBER } from '@/lib/env'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'

/**
 * WhatsApp click to chat links carry text only — there is no parameter for an
 * attachment. So the message leads with her greeting and ends with the product
 * page link. That page serves OpenGraph tags pointing at the fabric photo, so
 * WhatsApp renders a preview card with the image inside the chat, and the item
 * code identifies the roll even if the preview fails to load.
 */
export function messageFor(product: Product): string {
  const price = formatPrice(product.price)

  return [
    `Hello ${STORE_NAME}, I want to buy this fabric.`,
    '',
    product.name,
    price ? `Price: ${price}` : null,
    `Item: ${product.code}`,
    '',
    productUrl(product),
  ]
    .filter((line) => line !== null)
    .join('\n')
}

export function productUrl(product: Product): string {
  return `${SITE_URL}/product/${product.id}`
}

export function chatUrl(product: Product): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageFor(product))}`
}

/** Opens her chat with no product attached, for the header contact link. */
export function plainChatUrl(): string {
  const text = `Hello ${STORE_NAME}, I have a question about your fabrics.`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
