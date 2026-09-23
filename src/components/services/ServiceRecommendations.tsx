import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { track } from '@/lib/analytics'
import {
  fetchRecommendationStats,
  getLocalRecommendation,
  submitRecommendation,
} from '@/lib/recommendations'
import { RECOMMENDATION_MIN_FOR_PERCENT, type RecommendationStats } from '@/types/recommendations'
import { cn } from '@/lib/utils'

export function ServiceRecommendations({ serviceId }: { serviceId: string }) {
  const { location } = useApp()
  const [stats, setStats] = useState<RecommendationStats | null>(null)
  const [myVote, setMyVote] = useState<boolean | null>(() => getLocalRecommendation(serviceId))
  const [thanks, setThanks] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    const next = await fetchRecommendationStats(serviceId)
    setStats(next)
  }, [serviceId])

  useEffect(() => {
    void loadStats()
    setMyVote(getLocalRecommendation(serviceId))
  }, [serviceId, loadStats])

  const vote = async (wouldRecommend: boolean) => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    const result = await submitRecommendation(serviceId, wouldRecommend, location)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error ?? 'Something went wrong')
      return
    }

    setMyVote(wouldRecommend)
    setThanks(true)
    track('RECOMMENDATION_SUBMITTED', {
      service_id: serviceId,
      would_recommend: wouldRecommend,
    })
    void loadStats()
    window.setTimeout(() => setThanks(false), 4000)
  }

  return (
    <section aria-labelledby="recommend-heading" className="space-y-4">
      <div>
        <h2 id="recommend-heading" className="text-lg font-semibold text-sage-900">
          Would you recommend this service?
        </h2>
        <p className="mt-1 text-sm text-sage-600">
          Help other families understand whether Ask Reilly users had a good experience here.
        </p>
      </div>

      {stats && stats.total > 0 && (
        <div className="rounded-xl bg-hunter-light/40 px-4 py-3 space-y-1">
          {stats.percentRecommend != null ? (
            <p className="font-display text-xl text-sage-900">
              {stats.percentRecommend}% recommend this service
            </p>
          ) : (
            <p className="font-display text-xl text-sage-900">Community recommendations</p>
          )}
          <p className="text-sm text-sage-600">
            {stats.total} {stats.total === 1 ? 'response' : 'responses'}
            {stats.percentRecommend == null && stats.total < RECOMMENDATION_MIN_FOR_PERCENT && (
              <span className="text-sage-500">
                {' '}
                · More responses needed before we show a percentage
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-sage-700 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4 text-hunter" aria-hidden />
              {stats.positive} recommend
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ThumbsDown className="h-4 w-4 text-sage-500" aria-hidden />
              {stats.negative} wouldn&apos;t recommend
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={submitting}
          aria-pressed={myVote === true}
          onClick={() => void vote(true)}
          className={cn(
            'inline-flex min-h-11 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[15px] font-medium touch-scale focus-ring sm:flex-none sm:min-w-[160px]',
            myVote === true
              ? 'border-hunter bg-hunter text-white'
              : 'border-sage-200 bg-white text-sage-800 hover:border-hunter/40',
          )}
        >
          <ThumbsUp className="h-5 w-5" aria-hidden />
          Recommend
        </button>
        <button
          type="button"
          disabled={submitting}
          aria-pressed={myVote === false}
          onClick={() => void vote(false)}
          className={cn(
            'inline-flex min-h-11 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[15px] font-medium touch-scale focus-ring sm:flex-none sm:min-w-[160px]',
            myVote === false
              ? 'border-sage-600 bg-sage-700 text-white'
              : 'border-sage-200 bg-white text-sage-800 hover:border-sage-400',
          )}
        >
          <ThumbsDown className="h-5 w-5" aria-hidden />
          Wouldn&apos;t recommend
        </button>
      </div>

      {thanks && (
        <p className="text-sm font-medium text-hunter" role="status">
          Thanks for helping other families.
        </p>
      )}
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-sage-500 leading-relaxed">
        Recommendations reflect individual experiences shared by members of the Ask Reilly
        community. You can change your response at any time.
      </p>
    </section>
  )
}
