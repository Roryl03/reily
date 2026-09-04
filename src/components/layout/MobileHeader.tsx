import { Link } from 'react-router-dom'
import { AskReillyLogo } from '@/components/icons/AskReillyLogo'

/** Minimal iOS-style navigation bar - large titles live in page content */
export function MobileHeader() {
  return (
    <header className="ios-nav-bar sticky top-0 z-30 lg:hidden">
      <div className="flex min-h-14 items-center px-4 py-2">
        <Link
          to="/"
          className="touch-scale flex items-center rounded-lg focus-ring"
          aria-label="Ask Reilly home"
        >
          <AskReillyLogo size="md" className="max-w-[min(100vw-2rem,16rem)]" />
        </Link>
      </div>
    </header>
  )
}
