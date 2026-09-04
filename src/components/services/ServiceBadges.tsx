import type { AccessibilityFeatures } from '@/types/service'
import { FEATURE_ICON_CONFIG, ReilyIconInline } from '@/components/icons'
import { Badge } from '@/components/ui/badge'

const BADGE_MAP: {
  key: keyof AccessibilityFeatures
  label: string
  variant?: 'default' | 'secondary' | 'accent'
}[] = [
  { key: 'autismFriendly', label: 'Autism-friendly', variant: 'secondary' },
  { key: 'quietHour', label: 'Quiet hour', variant: 'accent' },
  { key: 'senSpecific', label: 'SEN session', variant: 'accent' },
  { key: 'wheelchairAccessible', label: 'Wheelchair accessible' },
  { key: 'accessibleToilet', label: 'Accessible toilet' },
  { key: 'changingPlaces', label: 'Changing Places' },
  { key: 'sensoryRoom', label: 'Sensory room', variant: 'secondary' },
  { key: 'earDefendersAvailable', label: 'Ear defenders' },
  { key: 'visualGuideAvailable', label: 'Visual guides' },
  { key: 'trainedStaff', label: 'Aware staff' },
  { key: 'freeEntry', label: 'Free entry', variant: 'success' as 'default' },
  { key: 'bookingRequired', label: 'Booking required', variant: 'warning' as 'default' },
  { key: 'indoor', label: 'Indoor' },
  { key: 'outdoor', label: 'Outdoor' },
  { key: 'disabledParking', label: 'Parking available' },
  { key: 'freeParking', label: 'Free parking' },
]

export function ServiceBadges({
  features,
  limit = 4,
}: {
  features: AccessibilityFeatures
  limit?: number
}) {
  const active = BADGE_MAP.filter((b) => features[b.key])
  const shown = active.slice(0, limit)
  const remaining = active.length - shown.length

  return (
    <div className="flex flex-wrap gap-1.5" role="list" aria-label="Accessibility features">
      {shown.map((b) => {
        const iconConfig = FEATURE_ICON_CONFIG[b.key]
        return (
          <Badge
            key={b.key}
            variant={b.variant ?? 'default'}
            role="listitem"
            className="gap-1.5 pl-2"
          >
            {iconConfig && (
              <ReilyIconInline name={iconConfig.name} variant={iconConfig.variant} />
            )}
            {b.label}
          </Badge>
        )
      })}
      {remaining > 0 && (
        <Badge variant="outline" role="listitem">
          +{remaining} more
        </Badge>
      )}
    </div>
  )
}

export function OpenStatusBadge({ status }: { status: string }) {
  const variant =
    status === 'Open now'
      ? 'success'
      : status === 'Opens soon'
        ? 'warning'
        : status === 'Closed'
          ? 'outline'
          : 'outline'

  return <Badge variant={variant as 'success'}>{status}</Badge>
}

export function DemoBadge() {
  return (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
      Demo data
    </Badge>
  )
}

export function CommunityBadge() {
  return (
    <Badge variant="secondary" className="bg-hunter-light text-hunter">
      Community submitted
    </Badge>
  )
}
