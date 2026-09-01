import { cn } from '@/lib/utils'
import type { Category } from '@/types/service'
import type { ReilyColorVariant, ReilyIconName } from './types'

export const CATEGORY_ICON_CONFIG: Record<
  Category,
  { name: ReilyIconName; variant: ReilyColorVariant }
> = {
  Activities: { name: 'activities', variant: 'sage' },
  'Food and drink': { name: 'food-drink', variant: 'terracotta' },
  'Parks and outdoors': { name: 'parks-outdoors', variant: 'sage' },
  'Support services': { name: 'support-services', variant: 'blue' },
  Shopping: { name: 'shopping', variant: 'terracotta' },
  Cinema: { name: 'cinema', variant: 'gold' },
  'Soft play': { name: 'soft-play', variant: 'gold' },
  Accommodation: { name: 'accommodation', variant: 'blue' },
  Education: { name: 'education', variant: 'blue' },
  Healthcare: { name: 'healthcare', variant: 'blue' },
  Haircuts: { name: 'haircuts', variant: 'terracotta' },
  'Community groups': { name: 'community-groups', variant: 'terracotta' },
}

export const NAV_ICON_CONFIG = [
  { name: 'home' as const, variant: 'sage' as const },
  { name: 'support-services' as const, variant: 'blue' as const },
  { name: 'explore' as const, variant: 'blue' as const },
  { name: 'map' as const, variant: 'sage' as const },
  { name: 'favourites' as const, variant: 'terracotta' as const },
  { name: 'profile' as const, variant: 'blue' as const },
]

export const FEATURE_ICON_CONFIG: Partial<
  Record<string, { name: ReilyIconName; variant: ReilyColorVariant }>
> = {
  autismFriendly: { name: 'accessibility', variant: 'lavender' },
  quietHour: { name: 'quiet-hour', variant: 'lavender' },
  senSpecific: { name: 'sen-session', variant: 'lavender' },
  sensoryFriendly: { name: 'sensory-friendly', variant: 'lavender' },
  wheelchairAccessible: { name: 'wheelchair', variant: 'blue' },
  accessibleToilet: { name: 'accessible-toilet', variant: 'blue' },
  changingPlaces: { name: 'changing-places', variant: 'blue' },
  sensoryRoom: { name: 'sensory-friendly', variant: 'lavender' },
  bookingRequired: { name: 'booking-required', variant: 'gold' },
  disabledParking: { name: 'parking', variant: 'sage' },
  freeParking: { name: 'parking', variant: 'sage' },
  indoor: { name: 'indoor', variant: 'cream' },
  outdoor: { name: 'outdoor', variant: 'sage' },
}

export function getCategoryIcon(category: string) {
  return (
    CATEGORY_ICON_CONFIG[category as Category] ?? {
      name: 'location' as ReilyIconName,
      variant: 'sage' as ReilyColorVariant,
    }
  )
}

export function brandMarkClasses(size: 'sm' | 'md' | 'lg' = 'md') {
  return cn(
    'inline-flex items-center justify-center rounded-2xl bg-sage-500 shadow-sm',
    size === 'sm' && 'h-10 w-10',
    size === 'md' && 'h-14 w-14',
    size === 'lg' && 'h-20 w-20',
  )
}
