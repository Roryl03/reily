import { Link } from 'react-router-dom'
import { getCategoryIcon, ReilyIconGlyph } from '@/components/icons'
import type { ReilyColorVariant } from '@/components/icons'
import { CommunityBadge, DemoBadge, OpenStatusBadge, ServiceBadges } from '@/components/services/ServiceBadges'
import { ServiceImage } from '@/components/services/ServiceImage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatOpenStatus } from '@/lib/openingHours'
import { cn, formatDistance } from '@/lib/utils'
import type { ServiceWithMeta } from '@/types/service'

interface ServiceCardProps {
  service: ServiceWithMeta
  isFavourite: boolean
  onToggleFavourite: () => void
  compact?: boolean
}

const CATEGORY_GLYPH_COLOR: Record<ReilyColorVariant, string> = {
  sage: 'text-hunter',
  blue: 'text-blue-muted',
  terracotta: 'text-terracotta',
  gold: 'text-gold',
  lavender: 'text-lavender',
  cream: 'text-sage-700',
}

export function ServiceCard({
  service,
  isFavourite,
  onToggleFavourite,
  compact = false,
}: ServiceCardProps) {
  const status = formatOpenStatus(service.openStatus)
  const categoryIcon = getCategoryIcon(service.category)

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <ServiceImage
          src={service.images[0]}
          category={service.category}
          className={cn('w-full object-cover', compact ? 'h-36' : 'h-44')}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleFavourite()
          }}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm focus-ring"
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <ReilyIconGlyph
            name="favourites"
            filled={isFavourite}
            className={cn(
              'h-5 w-5',
              isFavourite ? 'text-terracotta' : 'text-sage-500',
            )}
          />
        </button>
      </div>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sage-200 bg-sage-100 shadow-sm">
              <ReilyIconGlyph
                name={categoryIcon.name}
                className={cn('h-5 w-5', CATEGORY_GLYPH_COLOR[categoryIcon.variant])}
              />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-sage-900">{service.name}</h3>
              <p className="text-sm text-sage-600">{service.category}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {service.source === 'demo' && <DemoBadge />}
            {service.source === 'community' && <CommunityBadge />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-sage-600">
          {service.distanceMiles !== undefined && (
            <span className="flex items-center gap-1.5">
              <ReilyIconGlyph name="location" className="h-4 w-4 text-sage-700" />
              {formatDistance(service.distanceMiles)}
            </span>
          )}
          <span>{service.town}</span>
          <OpenStatusBadge status={status} />
        </div>

        {!compact && (
          <>
            <p className="text-sm text-sage-700 line-clamp-2">{service.shortDescription}</p>
            <ServiceBadges features={service.accessibilityFeatures} />
          </>
        )}

        <Button asChild className="w-full" variant="secondary">
          <Link to={`/service/${service.id}`}>View details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
