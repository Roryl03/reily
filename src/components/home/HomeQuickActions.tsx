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
    accent: 'border-l-blue-muted/50',
  },
  {
    to: '/explore',
    label: 'Explore',
    hint: 'Places near you',
    icon: 'explore' as ReilyIconName,
    variant: 'gold' as ReilyColorVariant,
    accent: 'border-l-gold/50',
  },
  {
    to: '/map',
    label: 'Map',
    hint: 'See what\'s nearby',
    icon: 'map' as ReilyIconName,
    variant: 'sage' as ReilyColorVariant,
    accent: 'border-l-hunter/40',
  },
  {
    to: '/favourites',
    label: 'Saved',
    hint: 'Your shortlist',
    icon: 'favourites' as ReilyIconName,
    variant: 'terracotta' as ReilyColorVariant,
    accent: 'border-l-terracotta/50',
  },
] as const

export function HomeQuickActions() {
  return (
    <nav aria-label="Quick actions" className="space-y-2">
      <p className="px-0.5 text-[15px] font-medium text-sage-600">Where would you like to go?</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={cn(
              'ios-card flex flex-col items-center justify-center gap-3 border-l-4 p-5 touch-scale min-h-[132px] sm:min-h-[140px]',
              action.accent,
            )}
          >
            <ReilyIcon name={action.icon} size="lg" variant={action.variant} label="" />
            <div className="text-center">
              <p className="text-[17px] font-semibold text-sage-900">{action.label}</p>
              <p className="mt-0.5 text-[13px] text-sage-500 leading-snug">{action.hint}</p>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  )
}
