import { Link } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ServiceWithMeta } from '@/types/service'

interface HomeNearbyProps {
  recommended: ServiceWithMeta[]
  openNow: ServiceWithMeta[]
  isFavourite: (id: string) => boolean
  toggleFavourite: (id: string) => void
}

export function HomeNearbySection({
  recommended,
  openNow,
  isFavourite,
  toggleFavourite,
}: HomeNearbyProps) {
  const hasRecommended = recommended.length > 0
  const hasOpen = openNow.length > 0

  if (!hasRecommended && !hasOpen) return null

  return (
    <section aria-labelledby="nearby-heading" className="space-y-4">
      <div className="home-section-header">
        <ReilyIcon name="compass" size="sm" variant="sage" label="" />
        <div>
          <h2 id="nearby-heading" className="text-lg font-semibold text-sage-900">
            A few places nearby
          </h2>
          <p className="text-sm text-sage-600">Hand-picked suggestions — explore when you&apos;re ready</p>
        </div>
      </div>

      {hasRecommended && (
        <div className="grid gap-4 sm:grid-cols-2">
          {recommended.slice(0, 2).map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              isFavourite={isFavourite(s.id)}
              onToggleFavourite={() => toggleFavourite(s.id)}
              compact
            />
          ))}
        </div>
      )}

      {hasOpen && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ReilyIcon name="open-now" size="xs" variant="gold" tile={false} label="" />
            <p className="text-sm font-medium text-sage-700">Open right now</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
            {openNow.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                to={`/service/${s.id}`}
                className="min-w-[200px] snap-start rounded-2xl border border-sage-100 bg-white p-4 shadow-sm hover:border-hunter/20 hover:shadow-md focus-ring"
              >
                <p className="font-medium text-sage-900 line-clamp-1">{s.name}</p>
                <p className="text-sm text-sage-600">{s.town}</p>
                <Badge variant="success" className="mt-2">
                  Open now
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Button asChild variant="outline" className="w-full border-sage-200">
        <Link to="/explore">See everything nearby</Link>
      </Button>
    </section>
  )
}
