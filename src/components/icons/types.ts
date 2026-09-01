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
    tile: 'bg-sage-200 border border-sage-300/70 shadow-sm',
    glyph: 'text-sage-800',
  },
  blue: {
    tile: 'bg-blue-muted-light border border-blue-muted/30 shadow-sm',
    glyph: 'text-[#3d7288]',
  },
  terracotta: {
    tile: 'bg-terracotta-light border border-terracotta/35 shadow-sm',
    glyph: 'text-[#a86145]',
  },
  gold: {
    tile: 'bg-gold-light border border-gold/35 shadow-sm',
    glyph: 'text-[#96753a]',
  },
  lavender: {
    tile: 'bg-lavender-light border border-lavender/35 shadow-sm',
    glyph: 'text-[#6f5f88]',
  },
  cream: {
    tile: 'bg-white border border-sage-200 shadow-sm',
    glyph: 'text-sage-800',
  },
}

export const TILE_BASE = 'ring-1 ring-black/[0.03]'
