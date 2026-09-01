import { Plus } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/explore', label: 'Explore', icon: '🔍' },
  { to: '/map', label: 'Map', icon: '🗺️' },
  { to: '/favourites', label: 'Favourites', icon: '❤️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export function AppLayout() {
  const location = useLocation()
  const showFab = ['/explore', '/map'].includes(location.pathname)

  return (
    <div className="min-h-dvh bg-cream-200">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sage-100 bg-white lg:flex lg:flex-col">
        <div className="border-b border-sage-100 p-6">
          <h1 className="text-2xl font-bold text-sage-700">Reily</h1>
          <p className="text-sm text-sage-500">Find places that understand</p>
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
                  isActive ? 'bg-sage-100 text-sage-800' : 'text-sage-600 hover:bg-sage-50',
                )
              }
            >
              <span aria-hidden>{item.icon}</span>
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
              <Plus className="h-4 w-4" />
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

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-sage-100 bg-white safe-bottom lg:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-xs font-medium transition-colors focus-ring min-h-14 justify-center',
                  isActive ? 'text-sage-700' : 'text-sage-400',
                )
              }
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile FAB */}
      {showFab && (
        <NavLink
          to="/add-service"
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sage-500 text-white shadow-lg hover:bg-sage-600 focus-ring lg:hidden"
          aria-label="Add service"
        >
          <Plus className="h-6 w-6" />
        </NavLink>
      )}
    </div>
  )
}
