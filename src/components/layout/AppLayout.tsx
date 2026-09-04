import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { SecretAddFab, SecretAddSidebarLink } from '@/components/admin/SecretAddFab'
import { NAV_ICON_CONFIG, ReilyIcon, ReilyLogoWordmark } from '@/components/icons'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { hasAdminAccess } from '@/lib/config'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', ...NAV_ICON_CONFIG[0] },
  { to: '/about', label: 'About Us', name: 'community-groups' as const, variant: 'terracotta' as const },
  { to: '/support', label: 'Support', ...NAV_ICON_CONFIG[1] },
  { to: '/explore', label: 'Explore', ...NAV_ICON_CONFIG[2] },
  { to: '/map', label: 'Map', ...NAV_ICON_CONFIG[3] },
  { to: '/favourites', label: 'Saved', ...NAV_ICON_CONFIG[4] },
  { to: '/profile', label: 'Profile', ...NAV_ICON_CONFIG[5] },
] as const

export function AppLayout() {
  const location = useLocation()
  const isMapPage = location.pathname === '/map'

  return (
    <div className="min-h-dvh bg-cream-200">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="border-b border-border px-6 py-7">
          <ReilyLogoWordmark className="max-w-full" />
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
                  isActive ? 'bg-hunter-light text-hunter font-semibold' : 'text-sage-500 hover:bg-sage-50',
                )
              }
            >
              <ReilyIcon name={item.name} size="md" variant={item.variant} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {hasAdminAccess() && (
          <div className="border-t border-sage-100 p-4">
            <NavLink
              to="/add-service"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-ring min-h-11',
                  isActive
                    ? 'bg-hunter-light text-hunter font-semibold'
                    : 'text-sage-500 hover:bg-sage-50',
                )
              }
            >
              <ReilyIcon name="add-service" size="md" variant="sage" />
              Manage facilities
            </NavLink>
          </div>
        )}
        <SecretAddSidebarLink />
      </aside>

      <div className="lg:pl-64">
        <MobileHeader />
        <main
          className={cn(
            'mx-auto max-w-5xl px-4 lg:px-6 lg:pb-8 lg:pt-6',
            isMapPage
              ? 'pb-3 pt-2'
              : 'pb-[calc(49px+env(safe-area-inset-bottom,0px)+1rem)] pt-2',
          )}
        >
          <Outlet />
        </main>
      </div>

      <MobileTabBar />
      <SecretAddFab />
    </div>
  )
}
