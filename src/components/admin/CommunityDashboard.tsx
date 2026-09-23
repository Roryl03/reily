import { toPng } from 'html-to-image'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  fetchAdminTopPicks,
  fetchCommunityInsights,
  fetchModerationReviews,
  finalizeTopPicks,
  moderateReview,
  type CommunityInsights,
  type ModerationReview,
} from '@/lib/communityClient'
import {
  buildLeaderboardGraphicHtml,
  buildWinnerGraphicHtml,
  type GraphicFormat,
} from '@/lib/topPicksGraphics'
import { fetchTopPicks, formatTopPicksMonth, type TopPickItem } from '@/lib/topPicks'
import { cn } from '@/lib/utils'

const PERIODS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
  { days: 365, label: '12 months' },
]

export function CommunityDashboard() {
  const [days, setDays] = useState(30)
  const [insights, setInsights] = useState<CommunityInsights | null>(null)
  const [reviews, setReviews] = useState<ModerationReview[]>([])
  const [topPicks, setTopPicks] = useState<TopPickItem[]>([])
  const [filter, setFilter] = useState<'pending' | 'reported'>('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [graphicScope, setGraphicScope] = useState<'across' | 'near'>('across')
  const [graphicFormat, setGraphicFormat] = useState<GraphicFormat>('portrait')
  const graphicRef = useRef<HTMLDivElement>(null)

  const reload = async () => {
    setLoading(true)
    setError('')
    try {
      const [insightsData, moderationData, picks] = await Promise.all([
        fetchCommunityInsights(days),
        fetchModerationReviews(filter),
        fetchAdminTopPicks('across'),
      ])
      setInsights(insightsData)
      setReviews(moderationData.reviews)
      setTopPicks(picks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [days, filter])

  const act = async (reviewId: string, action: 'approve' | 'hide' | 'remove' | 'restore') => {
    await moderateReview(reviewId, action)
    void reload()
  }

  const downloadGraphic = async (type: 'leaderboard' | 'winner', rank?: number) => {
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = now.getUTCMonth() + 1
    const items = await fetchTopPicks({ scope: graphicScope, archive: false })
    const html =
      type === 'leaderboard'
        ? buildLeaderboardGraphicHtml({
            items: items.items,
            year,
            month,
            scopeLabel: graphicScope === 'near' ? 'Near You' : 'Across Ask Reilly',
            format: graphicFormat,
          })
        : buildWinnerGraphicHtml({
            item: items.items.find((i) => i.rank === (rank ?? 1)) ?? items.items[0],
            year,
            month,
            format: graphicFormat,
          })

    if (!graphicRef.current) return
    graphicRef.current.innerHTML = html
    const dataUrl = await toPng(graphicRef.current.firstElementChild as HTMLElement, {
      pixelRatio: 1,
      cacheBust: true,
    })
    const link = document.createElement('a')
    link.download = `ask-reilly-top-picks-${type}-${year}-${month}.png`
    link.href = dataUrl
    link.click()
  }

  if (loading && !insights) {
    return <p className="text-sage-600 py-8 text-center">Loading community data…</p>
  }

  if (error && !insights) {
    return (
      <div className="ios-card p-5 space-y-2">
        <p className="font-semibold text-sage-900">Community dashboard unavailable</p>
        <p className="text-sm text-sage-600">{error}</p>
        <p className="text-sm text-sage-500">
          Run <code className="text-xs bg-sage-100 px-1 rounded">supabase/recommendations.sql</code>,{' '}
          <code className="text-xs bg-sage-100 px-1 rounded">community-reviews.sql</code> and{' '}
          <code className="text-xs bg-sage-100 px-1 rounded">community-top-picks.sql</code> in Supabase.
        </p>
      </div>
    )
  }

  if (!insights) return null

  const now = new Date()

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            type="button"
            onClick={() => setDays(p.days)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium focus-ring',
              days === p.days ? 'bg-hunter text-white' : 'bg-sage-100 text-sage-700',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <section>
        <h2 className="font-display text-2xl text-sage-900 mb-4">Community overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Recommendations (period)" value={insights.overview.totalRecommendations} />
          <Metric label="Positive recommendations" value={insights.overview.positiveRecommendations} />
          <Metric label="Recommendation rate" value={`${insights.overview.recommendationRate}%`} />
          <Metric label="Reviews submitted" value={insights.overview.reviewsSubmitted} />
          <Metric
            label="Average star rating"
            value={insights.overview.averageStarRating?.toFixed(1) ?? '—'}
          />
          <Metric label="Recommendations this month" value={insights.overview.recommendationsThisMonth} />
          <Metric label="Reviews this month" value={insights.overview.reviewsThisMonth} />
          <Metric label="Awaiting moderation" value={insights.overview.reviewsAwaitingModeration} />
          <Metric label="Reported reviews" value={insights.overview.reportedReviews} />
          <Metric label="Suspicious voting activity" value={insights.overview.suspiciousActivity} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-sage-900 mb-4">Current Top 10 — Across Ask Reilly</h2>
        {topPicks.length === 0 ? (
          <p className="text-sm text-sage-600">No ranked services yet this month.</p>
        ) : (
          <div className="space-y-2">
            {topPicks.map((item) => (
              <div key={item.service?.id} className="ios-card flex flex-wrap items-center gap-3 p-4 text-sm">
                <span className="font-display text-xl w-8">#{item.rank}</span>
                <div className="flex-1 min-w-[180px]">
                  <Link to={`/service/${item.service?.id}`} className="font-semibold text-hunter hover:underline">
                    {item.service?.name}
                  </Link>
                  <p className="text-sage-500">
                    Score {item.score} · {item.positiveRecommendations} recs ·{' '}
                    {item.reviewCount} reviews
                    {item.averageRating != null && ` · ⭐ ${item.averageRating}`}
                  </p>
                </div>
                {item.previousRank != null && (
                  <span className="text-sage-500">
                    {item.rank < item.previousRank ? '↑' : item.rank > item.previousRank ? '↓' : '—'}
                    {item.previousRank}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() =>
              void finalizeTopPicks(
                'across',
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
              ).then(() => void reload())
            }
          >
            Finalize this month&apos;s Top Picks (archive + badges)
          </Button>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium',
              filter === 'pending' ? 'bg-hunter text-white' : 'bg-sage-100',
            )}
          >
            Pending reviews
          </button>
          <button
            type="button"
            onClick={() => setFilter('reported')}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium',
              filter === 'reported' ? 'bg-hunter text-white' : 'bg-sage-100',
            )}
          >
            Reported reviews
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-sage-600">No reviews in this queue.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="ios-card space-y-3 p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold text-sage-900">
                    {'★'.repeat(review.rating)} · Service {review.service_id.slice(0, 8)}…
                  </p>
                  <span className="text-xs uppercase tracking-wide text-sage-500">{review.status}</span>
                </div>
                <p className="text-sage-800">&ldquo;{review.review_text}&rdquo;</p>
                <p className="text-xs text-sage-500">
                  {review.is_anonymous ? 'Anonymous' : review.display_name} ·{' '}
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void act(review.id, 'approve')}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void act(review.id, 'hide')}>
                    Hide
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void act(review.id, 'remove')}>
                    Remove
                  </Button>
                  {review.status !== 'approved' && (
                    <Button size="sm" variant="ghost" onClick={() => void act(review.id, 'restore')}>
                      Restore
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {insights.riskFlags.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-sage-900 mb-4">Suspicious voting activity</h2>
          <div className="space-y-2">
            {insights.riskFlags.map((flag) => (
              <div key={flag.id} className="ios-card p-4 text-sm">
                <p className="font-semibold text-sage-900">{flag.serviceName}</p>
                <p className="text-sage-600">
                  {flag.flag_type} · {new Date(flag.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl text-sage-900 mb-4">Social media graphics</h2>
        <div className="ios-card space-y-4 p-5">
          <p className="text-sm text-sage-600">
            Generate shareable graphics for {formatTopPicksMonth(now.getUTCFullYear(), now.getUTCMonth() + 1)}.
          </p>
          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-lg border border-sage-200 px-3 py-2 text-sm"
              value={graphicScope}
              onChange={(e) => setGraphicScope(e.target.value as 'across' | 'near')}
            >
              <option value="across">Across Ask Reilly</option>
              <option value="near">Near You (NI-wide for admin)</option>
            </select>
            <select
              className="rounded-lg border border-sage-200 px-3 py-2 text-sm"
              value={graphicFormat}
              onChange={(e) => setGraphicFormat(e.target.value as GraphicFormat)}
            >
              <option value="portrait">Instagram / Facebook (1080×1350)</option>
              <option value="story">Instagram Story (1080×1920)</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void downloadGraphic('leaderboard')}>
              Generate monthly Top 10 graphic
            </Button>
            <Button variant="outline" onClick={() => void downloadGraphic('winner', 1)}>
              #1 winner graphic
            </Button>
            <Button variant="outline" onClick={() => void downloadGraphic('winner', 3)}>
              Top 3 graphic
            </Button>
          </div>
        </div>
        <div ref={graphicRef} className="fixed -left-[9999px] top-0" aria-hidden />
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ios-card p-4">
      <p className="text-sm text-sage-600">{label}</p>
      <p className="font-display text-2xl text-sage-900 mt-1">{value}</p>
    </div>
  )
}
