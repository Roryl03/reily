import { useCallback, useEffect, useState } from 'react'
import { fetchReviewSummary } from '@/lib/reviews'
import type { ReviewSummary } from '@/types/reviews'
import { RECOMMENDATION_MIN_FOR_PERCENT } from '@/types/recommendations'
import { cn } from '@/lib/utils'

export function ServiceRatingSummary({
  serviceId,
  onScrollToReviews,
}: {
  serviceId: string
  onScrollToReviews: () => void
}) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null)

  const load = useCallback(async () => {
    const data = await fetchReviewSummary(serviceId)
    setSummary(data)
  }, [serviceId])

  useEffect(() => {
    void load()
  }, [load])

  if (!summary || (summary.reviewCount === 0 && summary.recommendationTotal === 0)) {
    return null
  }

  const hasRating = summary.averageRating != null && summary.reviewCount >= 3
  const hasRecommend =
    summary.percentRecommend != null && summary.recommendationTotal >= RECOMMENDATION_MIN_FOR_PERCENT

  const maxDist = Math.max(...Object.values(summary.distribution), 1)

  return (
    <button
      type="button"
      onClick={onScrollToReviews}
      className={cn(
        'w-full rounded-xl border border-sage-200/80 bg-white/80 px-4 py-3 text-left',
        'hover:border-hunter/30 focus-ring touch-scale',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {hasRating && (
          <span className="inline-flex items-baseline gap-1.5 font-display text-2xl text-sage-900">
            <span aria-hidden>⭐</span>
            {summary.averageRating!.toFixed(1)}
          </span>
        )}
        {summary.reviewCount > 0 && (
          <span className="text-sm text-sage-600">
            {summary.reviewCount} {summary.reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        )}
        {hasRecommend && (
          <span className="text-sm font-medium text-hunter">
            {summary.percentRecommend}% recommend
          </span>
        )}
      </div>

      {summary.reviewCount > 0 && (
        <div className="mt-3 space-y-1" aria-label="Rating distribution">
          {([5, 4, 3, 2, 1] as const).map((stars) => {
            const count = summary.distribution[stars]
            const width = `${Math.round((count / maxDist) * 100)}%`
            return (
              <div key={stars} className="flex items-center gap-2 text-xs text-sage-600">
                <span className="w-8 shrink-0">{stars} ★</span>
                <span className="h-2 flex-1 rounded-full bg-sage-100 overflow-hidden">
                  <span className="block h-full rounded-full bg-hunter/70" style={{ width }} />
                </span>
                <span className="w-6 text-right tabular-nums">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-2 text-xs text-sage-500">Tap to read community reviews</p>
    </button>
  )
}
