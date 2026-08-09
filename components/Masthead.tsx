import { WhatsAppGlyph } from '@/components/WhatsAppGlyph'
import { plainChatUrl } from '@/lib/whatsapp'
import { STORE_NAME } from '@/lib/env'

export function Masthead() {
  return (
    <header className="masthead">
      <div className="masthead-bar">
        <a href="/" aria-label={`${STORE_NAME} home`}>
          <p className="wordmark">
            Olayinka Boja
            <span>Enterprise</span>
          </p>
        </a>
        <div className="masthead-actions">
          <a
            className="ghost-link"
            href={plainChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppGlyph />
            Chat
          </a>
        </div>
      </div>
      <div className="selvedge" aria-hidden="true" />
    </header>
  )
}
