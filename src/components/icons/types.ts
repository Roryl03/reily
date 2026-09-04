export type ReilyColorVariant = 'sage' | 'blue' | 'terracotta' | 'gold' | 'lavender' | 'cream'

export type ReilyIconName =
  | 'activities'
  | 'food-drink'
  | 'parks-outdoors'
  | 'support-services'
  | 'shopping'
  | 'cinema'
  | 'soft-play'
  | 'accommodation'
  | 'education'
  | 'healthcare'
  | 'haircuts'
  | 'community-groups'
  | 'home'
  | 'explore'
  | 'map'
  | 'favourites'
  | 'profile'
  | 'add-service'
  | 'search'
  | 'location'
  | 'accessibility'
  | 'quiet-hour'
  | 'sensory-friendly'
  | 'sen-session'
  | 'wheelchair'
  | 'accessible-toilet'
  | 'changing-places'
  | 'parking'
  | 'booking-required'
  | 'indoor'
  | 'outdoor'
  | 'compass'
  | 'open-now'
  | 'weather'

export type ReilyIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export const TILE_SIZE: Record<ReilyIconSize, string> = {
  xs: 'h-8 w-8 rounded-lg',
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-12 w-12 rounded-xl',
  lg: 'h-16 w-16 rounded-2xl',
  xl: 'h-24 w-24 rounded-2xl',
}

export const GLYPH_SIZE: Record<ReilyIconSize, string> = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-11 w-11',
}

export const VARIANT_STYLES: Record<
  ReilyColorVariant,
  { tile: string; glyph: string }
> = {
  sage: {
    tile: 'bg-hunter-light ring-1 ring-hunter/12',
    glyph: 'text-hunter',
  },
  blue: {
    tile: 'bg-hunter-light ring-1 ring-sage-accent/25',
    glyph: 'text-hunter',
  },
  terracotta: {
    tile: 'bg-terracotta-light ring-1 ring-coral/30',
    glyph: 'text-sage-900',
  },
  gold: {
    tile: 'bg-gold-light ring-1 ring-gold/35',
    glyph: 'text-sage-900',
  },
  lavender: {
    tile: 'bg-hunter-light ring-1 ring-sage-accent/25',
    glyph: 'text-hunter',
  },
  cream: {
    tile: 'bg-surface ring-1 ring-border',
    glyph: 'text-sage-800',
  },
}

export const TILE_BASE = ''
