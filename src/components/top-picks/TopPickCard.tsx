import { Link } from 'react-router-dom'
import { ThumbsUp } from 'lucide-react'
import { ServiceImage } from '@/components/services/ServiceImage'
import type { TopPickItem } from '@/lib/topPicks'
import { cn } from '@/lib/utils'

export function TopPickCard({ item }: { item: TopPickItem }) {
  if (!item.service) return null

  return (
    <Link
      to={`/service/${item.service.id}`}
      className="ios-card flex gap-4 p-4 touch-scale focus-ring"
    >
      <div className="relative shrink-0">
        <span className="absolute -left-1 -top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-hunter text-sm font-bold text-white shadow">
          {item.rank}
        </span>
        <ServiceImage
          src={item.service.image ?? undefined}
          category={item.service.category}
          className="h-20 w-20 rounded-xl object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="font-semibold text-sage-900 leading-snug">{item.service.name}</h3>
        <p className="text-sm text-sage-600">
          {item.service.town}
          {item.service.county ? `, ${item.service.county}` : ''}
        </p>
        <p className="text-xs text-sage-500">{item.service.category}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-sm text-sage-700">
          {item.averageRating != null && item.reviewCount > 0 && (
            <span>
              ⭐ {item.averageRating.toFixed(1)} · {item.reviewCount}{' '}
              {item.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          )}
          <span className={cn('inline-flex items-center gap-1 text-hunter font-medium')}>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
            {item.positiveRecommendations} recommendations this month
          </span>
          {item.recommendPercent != null && (
            <span>{item.recommendPercent}% recommend</span>
          )}
        </div>
      </div>
    </Link>
  )
}
