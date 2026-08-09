'use client'

import { useState } from 'react'
import { WhatsAppGlyph } from '@/components/WhatsAppGlyph'
import { imageUrl } from '@/lib/format'
import type { Product } from '@/lib/types'
import { chatUrl, messageFor } from '@/lib/whatsapp'

type Props = {
  product: Product
  label?: string
}

/**
 * Two routes to her chat, best first.
 *
 * 1. The share sheet, where the browser supports sharing files. The real photo
 *    goes across as an attachment alongside the message, which is what she is
 *    used to seeing on Status. Android Chrome handles this; iOS Safari mostly
 *    does not.
 * 2. A wa.me link. Text only, so the message carries the item code and the
 *    product link, and WhatsApp draws a preview card from the page's
 *    OpenGraph image.
 */
export function BuyNowButton({ product, label = 'Buy now' }: Props) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (busy) return
    setBusy(true)

    try {
      const shared = await shareWithPhoto(product)
      if (!shared) openChat(product)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="buy"
      onClick={handleClick}
      disabled={busy}
      aria-label={`${label}: ${product.name}, item ${product.code}`}
    >
      <WhatsAppGlyph />
      {busy ? 'Opening…' : label}
    </button>
  )
}

/**
 * Returns true when the message has been handed off — either shared, or
 * deliberately cancelled by the shopper. Returns false when this route is
 * unavailable, so the caller should fall back to wa.me.
 */
async function shareWithPhoto(product: Product): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.canShare) return false

  let file: File
  try {
    const response = await fetch(imageUrl(product.image_path))
    if (!response.ok) return false
    const blob = await response.blob()
    file = new File([blob], `${product.code}.jpg`, {
      type: blob.type || 'image/jpeg',
    })
  } catch {
    return false
  }

  if (!navigator.canShare({ files: [file] })) return false

  try {
    await navigator.share({ files: [file], text: messageFor(product) })
    return true
  } catch (error) {
    // They backed out of the share sheet on purpose. Opening wa.me on top of
    // that would be a second window they did not ask for.
    if (error instanceof DOMException && error.name === 'AbortError') return true
    return false
  }
}

function openChat(product: Product) {
  window.open(chatUrl(product), '_blank', 'noopener,noreferrer')
}
