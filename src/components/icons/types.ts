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
    tile: 'bg-white ring-1 ring-hunter/12 shadow-[0_1px_3px_rgba(26,47,28,0.06)]',
    glyph: 'text-hunter',
  },
  blue: {
    tile: 'bg-white ring-1 ring-blue-muted/15 shadow-[0_1px_3px_rgba(53,94,59,0.04)]',
    glyph: 'text-blue-muted',
  },
  terracotta: {
    tile: 'bg-white ring-1 ring-terracotta/15 shadow-[0_1px_3px_rgba(196,120,90,0.06)]',
    glyph: 'text-terracotta',
  },
  gold: {
    tile: 'bg-white ring-1 ring-gold/20 shadow-[0_1px_3px_rgba(184,149,79,0.06)]',
    glyph: 'text-gold',
  },
  lavender: {
    tile: 'bg-white ring-1 ring-lavender/15 shadow-[0_1px_3px_rgba(139,123,168,0.06)]',
    glyph: 'text-lavender',
  },
  cream: {
    tile: 'bg-white ring-1 ring-sage-200/80 shadow-sm',
    glyph: 'text-sage-700',
  },
}

export const TILE_BASE = ''
