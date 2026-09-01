import { Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CommunityBadge, DemoBadge, OpenStatusBadge, ServiceBadges } from '@/components/services/ServiceBadges'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatOpenStatus } from '@/lib/openingHours'
import { cn, formatDistance, getPlaceholderImage } from '@/lib/utils'
import type { ServiceWithMeta } from '@/types/service'

interface ServiceCardProps {
  service: ServiceWithMeta
  isFavourite: boolean
  onToggleFavourite: () => void
  compact?: boolean
}

export function ServiceCard({
  service,
  isFavourite,
  onToggleFavourite,
  compact = false,
}: ServiceCardProps) {
  const image = service.images[0] ?? getPlaceholderImage(service.category)
  const status = formatOpenStatus(service.openStatus)

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={image}
          alt=""
          className={cn('w-full object-cover', compact ? 'h-36' : 'h-44')}
          loading="lazy"
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
          <Heart
            className={cn('h-5 w-5', isFavourite ? 'fill-terracotta text-terracotta' : 'text-sage-600')}
          />
        </button>
      </div>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-sage-900">{service.name}</h3>
            <p className="text-sm text-sage-600">{service.category}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {service.source === 'demo' && <DemoBadge />}
            {service.source === 'community' && <CommunityBadge />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-sage-600">
          {service.distanceMiles !== undefined && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden />
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
