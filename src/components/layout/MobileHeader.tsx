import { Link, NavLink } from 'react-router-dom'
import { AskReillyLogo } from '@/components/icons/AskReillyLogo'
import { cn } from '@/lib/utils'

/** Minimal iOS-style navigation bar - large titles live in page content */
export function MobileHeader() {
  return (
    <header className="ios-nav-bar sticky top-0 z-30 lg:hidden">
      <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
        <Link
          to="/"
          className="touch-scale flex min-w-0 items-center rounded-lg focus-ring"
          aria-label="Ask Reilly home"
        >
          <AskReillyLogo size="md" className="max-w-[min(100vw-8rem,16rem)]" />
        </Link>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            cn(
              'shrink-0 rounded-lg border px-3 py-2 text-sm font-medium focus-ring',
              isActive
                ? 'border-hunter bg-hunter text-white font-semibold'
                : 'border-hunter bg-surface text-hunter hover:bg-hunter-light',
            )
          }
        >
          About Us
        </NavLink>
      </div>
    </header>
  )
}
