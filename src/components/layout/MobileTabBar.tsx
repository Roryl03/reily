import { NavLink } from 'react-router-dom'
import { NAV_ICON_CONFIG, ReilyIconGlyph } from '@/components/icons'
import { cn } from '@/lib/utils'

/** iOS HIG recommends 3–5 tabs; Saved lives on Home + Profile */
const navItems = [
  { to: '/', label: 'Home', end: true, ...NAV_ICON_CONFIG[0] },
  { to: '/support', label: 'Support', end: false, ...NAV_ICON_CONFIG[1] },
  { to: '/explore', label: 'Explore', end: false, ...NAV_ICON_CONFIG[2] },
  { to: '/map', label: 'Map', end: false, ...NAV_ICON_CONFIG[3] },
  { to: '/profile', label: 'Profile', end: false, ...NAV_ICON_CONFIG[5] },
] as const

function TabItem({
  to,
  label,
  name,
  end,
}: {
  to: string
  label: string
  name: (typeof navItems)[number]['name']
  end: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className="flex flex-1 flex-col items-center justify-end gap-0.5 pb-0.5 pt-1 focus-ring min-w-0 touch-scale"
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          <ReilyIconGlyph
            name={name}
            filled={isActive && name === 'favourites'}
            className={cn(
              'h-6 w-6 transition-colors duration-150',
              isActive
                ? to === '/support'
                  ? 'text-blue-muted'
                  : 'text-hunter'
                : 'text-sage-400',
            )}
          />
          <span
            className={cn(
              'truncate text-[10px] font-medium leading-none max-w-full',
              isActive ? 'text-hunter' : 'text-sage-500',
              isActive && to === '/support' && 'text-blue-muted',
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export function MobileTabBar() {
  return (
    <nav
      className="ios-tab-bar fixed inset-x-0 bottom-0 z-40 lg:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[49px] max-w-lg items-stretch px-2">
        {navItems.map((item) => (
          <TabItem
            key={item.to}
            to={item.to}
            label={item.label}
            name={item.name}
            end={item.end}
          />
        ))}
      </div>
    </nav>
  )
}

export const MOBILE_TAB_BAR_OFFSET = 'calc(49px + env(safe-area-inset-bottom, 0px))'
