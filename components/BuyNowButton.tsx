import { WhatsAppGlyph } from '@/components/WhatsAppGlyph'
import type { Product } from '@/lib/types'
import { chatUrl } from '@/lib/whatsapp'

type Props = {
  product: Product
  label?: string
}

/**
 * Opens her chat directly, with the fabric already written into the message.
 *
 * An earlier version tried the Web Share API first so the real photo could go
 * across as an attachment. It was dropped: the share sheet hands the message to
 * whichever app the shopper picks and then asks them to choose a contact, so it
 * does not reliably reach her, and a shopper who taps Buy now has already said
 * who they want to talk to. Landing in her chat matters more than the
 * attachment.
 *
 * WhatsApp click to chat carries text only, so the photo travels two ways
 * instead: the item code names the exact roll, and the product link at the end
 * of the message makes WhatsApp draw a preview card from the page's OpenGraph
 * image.
 *
 * This is a plain link rather than a button so the phone treats it as a real
 * navigation: it survives popup blockers, works before the JavaScript has
 * finished loading, and can be long pressed.
 */
export function BuyNowButton({ product, label = 'Buy now' }: Props) {
  return (
    <a
      className="buy"
      href={chatUrl(product)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}: ${product.name}, item ${product.code}`}
    >
      <WhatsAppGlyph />
      {label}
    </a>
  )
}
