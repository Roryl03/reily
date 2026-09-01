import { Plus } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { NAV_ICON_CONFIG, ReilyIcon, ReilyLogoWordmark } from '@/components/icons'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', ...NAV_ICON_CONFIG[0] },
  { to: '/support', label: 'Support', ...NAV_ICON_CONFIG[1] },
  { to: '/explore', label: 'Explore', ...NAV_ICON_CONFIG[2] },
  { to: '/map', label: 'Map', ...NAV_ICON_CONFIG[3] },
  { to: '/favourites', label: 'Saved', ...NAV_ICON_CONFIG[4] },
  { to: '/profile', label: 'Profile', ...NAV_ICON_CONFIG[5] },
] as const

export function AppLayout() {
  const location = useLocation()
  const showFab = ['/explore', '/map'].includes(location.pathname)

  return (
    <div className="min-h-dvh bg-cream-200">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sage-100 bg-white lg:flex lg:flex-col">
        <div className="border-b border-sage-100 p-6">
          <ReilyLogoWordmark />
        </div>
        <nav className="flex-1 space-y-1 p-4" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-ring min-h-11',
                  isActive ? 'bg-hunter-light text-hunter' : 'text-sage-600 hover:bg-sage-50',
                  item.to === '/support' && !isActive && 'text-blue-muted',
                )
              }
            >
              <ReilyIcon name={item.name} size="md" variant={item.variant} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {showFab && (
          <div className="border-t border-sage-100 p-4">
            <NavLink
              to="/add-service"
              className="flex items-center justify-center gap-2 rounded-xl bg-sage-500 px-4 py-3 text-sm font-medium text-white hover:bg-sage-600 focus-ring min-h-11"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add service
            </NavLink>
          </div>
        )}
      </aside>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 lg:pb-8">
          <Outlet />
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-sage-100 bg-white safe-bottom lg:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[10px] font-medium transition-colors focus-ring min-h-14 justify-center leading-tight',
                  isActive ? 'text-hunter' : 'text-sage-400',
                  item.to === '/support' && isActive && 'text-blue-muted',
                )
              }
              aria-label={item.label}
            >
              <ReilyIcon name={item.name} size="sm" variant={item.variant} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {showFab && (
        <NavLink
          to="/add-service"
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sage-500 text-white shadow-lg hover:bg-sage-600 focus-ring lg:hidden"
          aria-label="Add service"
        >
          <Plus className="h-6 w-6" strokeWidth={2} aria-hidden />
        </NavLink>
      )}
    </div>
  )
}
