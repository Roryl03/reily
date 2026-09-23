import { useCallback, useEffect, useState } from 'react'
import { fetchReviews } from '@/lib/reviews'
import type { PublicReview, ReviewSort } from '@/types/reviews'
import { cn } from '@/lib/utils'
import { ReviewCard } from './ReviewCard'
import { ReviewForm } from './ReviewForm'

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'helpful', label: 'Most helpful' },
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
]

export function ServiceReviews({ serviceId }: { serviceId: string }) {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [sort, setSort] = useState<ReviewSort>('helpful')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchReviews(serviceId, sort)
    setReviews(data)
    setLoading(false)
  }, [serviceId, sort])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section id="community-reviews" aria-labelledby="reviews-heading" className="space-y-5">
      <div className="space-y-2">
        <h2 id="reviews-heading" className="text-lg font-semibold text-sage-900">
          Community Reviews
        </h2>
        <p className="text-sm text-sage-600">
          Reviews reflect individual experiences shared by members of the Ask Reilly community.
          Experiences can vary.
        </p>
      </div>

      <ReviewForm serviceId={serviceId} onSubmitted={() => void load()} />

      {reviews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSort(option.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium touch-scale focus-ring',
                sort === option.value
                  ? 'bg-hunter text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-sage-500">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-sage-600">
          No published reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpfulChange={(id, count) => {
                setReviews((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, helpfulCount: count } : r)),
                )
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
