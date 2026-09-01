import { Link } from 'react-router-dom'
import { ReilyIcon, type ReilyColorVariant, type ReilyIconName } from '@/components/icons'
import { cn } from '@/lib/utils'

const ACTIONS = [
  {
    to: '/support',
    label: 'Support',
    hint: 'Helplines & advice',
    icon: 'support-services' as ReilyIconName,
    variant: 'blue' as ReilyColorVariant,
    accent: 'border-l-blue-muted/40 hover:border-l-blue-muted',
  },
  {
    to: '/explore',
    label: 'Explore',
    hint: 'Places near you',
    icon: 'explore' as ReilyIconName,
    variant: 'gold' as ReilyColorVariant,
    accent: 'border-l-gold/40 hover:border-l-gold',
  },
  {
    to: '/map',
    label: 'Map',
    hint: 'See what\'s nearby',
    icon: 'map' as ReilyIconName,
    variant: 'sage' as ReilyColorVariant,
    accent: 'border-l-hunter/30 hover:border-l-hunter',
  },
  {
    to: '/favourites',
    label: 'Saved',
    hint: 'Your shortlist',
    icon: 'favourites' as ReilyIconName,
    variant: 'terracotta' as ReilyColorVariant,
    accent: 'border-l-terracotta/40 hover:border-l-terracotta',
  },
] as const

export function HomeQuickActions() {
  return (
    <nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className={cn(
            'flex flex-col items-center gap-2.5 rounded-2xl border border-sage-100 border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md focus-ring min-h-[108px] justify-center',
            action.accent,
          )}
        >
          <ReilyIcon name={action.icon} size="md" variant={action.variant} label="" />
          <div className="text-center">
            <p className="text-sm font-semibold text-sage-900">{action.label}</p>
            <p className="text-xs text-sage-500">{action.hint}</p>
          </div>
        </Link>
      ))}
    </nav>
  )
}
