import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { LucideIcon } from 'lucide-react'
import {
  Baby,
  BedDouble,
  Blocks,
  CalendarCheck,
  CircleParking,
  Film,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  MapPin,
  Scissors,
  ShoppingBag,
  Sparkles,
  TreePine,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { getCategoryIcon } from '@/components/icons/config'
import type { ReilyIconName } from '@/components/icons/types'

const PIN_ICONS: Record<ReilyIconName, LucideIcon> = {
  activities: Sparkles,
  'food-drink': UtensilsCrossed,
  'parks-outdoors': TreePine,
  'support-services': HeartHandshake,
  shopping: ShoppingBag,
  cinema: Film,
  'soft-play': Blocks,
  accommodation: BedDouble,
  education: GraduationCap,
  healthcare: HeartPulse,
  haircuts: Scissors,
  'community-groups': Users,
  location: MapPin,
  home: MapPin,
  explore: MapPin,
  map: MapPin,
  favourites: MapPin,
  profile: MapPin,
  'add-service': MapPin,
  search: MapPin,
  accessibility: MapPin,
  'quiet-hour': MapPin,
  'sensory-friendly': MapPin,
  'sen-session': CalendarCheck,
  wheelchair: MapPin,
  'accessible-toilet': MapPin,
  'changing-places': Baby,
  parking: CircleParking,
  'booking-required': CalendarCheck,
  indoor: MapPin,
  outdoor: TreePine,
  compass: MapPin,
  'open-now': MapPin,
  weather: MapPin,
}

/** White Lucide icon markup for map pin heads. */
export function getCategoryPinIconMarkup(category: string, size = 13): string {
  const { name } = getCategoryIcon(category)
  const Icon = PIN_ICONS[name] ?? MapPin
  return renderToStaticMarkup(
    createElement(Icon, {
      size,
      color: '#ffffff',
      strokeWidth: 2.35,
      absoluteStrokeWidth: true,
      'aria-hidden': true,
    }),
  )
}
