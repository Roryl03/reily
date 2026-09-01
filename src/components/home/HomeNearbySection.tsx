import { Link } from 'react-router-dom'
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
    <section aria-labelledby="nearby-heading" className="space-y-3">
      <div className="home-section-header px-1">
        <div>
          <h2 id="nearby-heading" className="text-[20px] font-semibold tracking-tight text-sage-900">
            Nearby
          </h2>
          <p className="text-[15px] text-sage-500 mt-0.5">When you&apos;re ready to explore</p>
        </div>
      </div>

      {hasRecommended && (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
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
          <p className="px-1 text-[15px] font-medium text-sage-700">Open right now</p>
          <div className="mobile-scroll-x flex gap-2.5 pb-0.5">
            {openNow.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                to={`/service/${s.id}`}
                className="ios-card min-w-[180px] snap-start p-4 touch-scale"
              >
                <p className="text-[17px] font-medium text-sage-900 line-clamp-1">{s.name}</p>
                <p className="text-[15px] text-sage-600">{s.town}</p>
                <Badge variant="success" className="mt-2">
                  Open now
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Button asChild variant="secondary" size="lg">
        <Link to="/explore">See everything nearby</Link>
      </Button>
    </section>
  )
}
