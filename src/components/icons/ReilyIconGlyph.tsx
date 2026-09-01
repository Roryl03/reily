import type { LucideIcon } from 'lucide-react'
import {
  Accessibility,
  Baby,
  BedDouble,
  Blocks,
  CalendarCheck,
  CircleParking,
  CirclePlus,
  CircleUser,
  Clock,
  CloudSun,
  Compass,
  Film,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartPulse,
  House,
  Map,
  MapPin,
  Moon,
  ScanSearch,
  Scissors,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  TreePine,
  Users,
  UtensilsCrossed,
  VolumeX,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReilyIconName } from './types'

const ICONS: Record<ReilyIconName, LucideIcon> = {
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
  home: House,
  explore: ScanSearch,
  map: Map,
  favourites: Heart,
  profile: CircleUser,
  'add-service': CirclePlus,
  search: Search,
  location: MapPin,
  accessibility: Accessibility,
  'quiet-hour': Moon,
  'sensory-friendly': VolumeX,
  'sen-session': CalendarCheck,
  wheelchair: Accessibility,
  'accessible-toilet': Accessibility,
  'changing-places': Baby,
  parking: CircleParking,
  'booking-required': CalendarCheck,
  indoor: Building2,
  outdoor: Sun,
  compass: Compass,
  'open-now': Clock,
  weather: CloudSun,
}

export function ReilyIconGlyph({
  name,
  className,
  filled,
}: {
  name: ReilyIconName
  className?: string
  filled?: boolean
}) {
  const Icon = ICONS[name]

  return (
    <Icon
      className={cn('shrink-0', className)}
      strokeWidth={1.75}
      absoluteStrokeWidth
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden
    />
  )
}
