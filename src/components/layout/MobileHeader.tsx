import { Link } from 'react-router-dom'
import { ReilyBrandMark } from '@/components/icons'

/** Minimal iOS-style navigation bar — large titles live in page content */
export function MobileHeader() {
  return (
    <header className="ios-nav-bar sticky top-0 z-30 lg:hidden">
      <div className="flex h-11 items-center px-4">
        <Link
          to="/"
          className="flex items-center gap-2 touch-scale rounded-lg focus-ring"
          aria-label="Reily home"
        >
          <ReilyBrandMark size="xs" />
          <span className="text-[17px] font-semibold text-hunter tracking-tight">Reily</span>
        </Link>
      </div>
    </header>
  )
}
