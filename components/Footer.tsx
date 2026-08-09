import { STORE_LOCATION, STORE_NAME } from '@/lib/env'
import { plainChatUrl } from '@/lib/whatsapp'

export function Footer() {
  return (
    <footer className="footer">
      <div className="selvedge" aria-hidden="true" />
      <div className="footer-inner">
        <strong>{STORE_NAME}</strong>
        {STORE_LOCATION ? <span>{STORE_LOCATION}</span> : null}
        <a href={plainChatUrl()} target="_blank" rel="noopener noreferrer">
          Message us on WhatsApp
        </a>
      </div>
    </footer>
  )
}
