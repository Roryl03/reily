import { coarseGeoFromLocation } from '@/lib/geoContext'
import { getStoredAudience, getVisitorId } from '@/lib/visitor'
import {
  REVIEW_MIN_FOR_AVG_DISPLAY,
  type PublicReview,
  type ReviewSort,
  type ReviewSubmitPayload,
  type ReviewSummary,
} from '@/types/reviews'
import { RECOMMENDATION_MIN_FOR_PERCENT } from '@/types/recommendations'
import type { UserLocation } from '@/types/service'

const LOCAL_HELPFUL_KEY = 'reily_review_helpful_votes'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function readHelpfulVotes(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_HELPFUL_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

function writeHelpfulVote(reviewId: string): void {
  try {
    const votes = readHelpfulVotes()
    votes[reviewId] = true
    localStorage.setItem(LOCAL_HELPFUL_KEY, JSON.stringify(votes))
  } catch {
    /* private browsing */
  }
}

export function hasLocalHelpfulVote(reviewId: string): boolean {
  return readHelpfulVotes()[reviewId] === true
}

export async function fetchReviewSummary(serviceId: string): Promise<ReviewSummary> {
  const res = await fetch(
    `/api/reviews/summary?service_id=${encodeURIComponent(serviceId)}`,
  )
  if (!res.ok) {
    return {
      averageRating: null,
      reviewCount: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentRecommend: null,
      recommendationTotal: 0,
    }
  }
  return res.json() as Promise<ReviewSummary>
}

export async function fetchReviews(
  serviceId: string,
  sort: ReviewSort = 'helpful',
): Promise<PublicReview[]> {
  const res = await fetch(
    `/api/reviews/list?service_id=${encodeURIComponent(serviceId)}&sort=${sort}&visitor_id=${encodeURIComponent(getVisitorId())}`,
  )
  if (!res.ok) return []
  const data = (await res.json()) as { reviews?: PublicReview[] }
  return data.reviews ?? []
}

export async function submitReview(
  payload: ReviewSubmitPayload,
  location: UserLocation | null,
): Promise<{ ok: boolean; error?: string }> {
  const visitorId = getVisitorId()
  if (!UUID_RE.test(visitorId)) {
    return { ok: false, error: 'Could not identify visitor' }
  }

  const geo = coarseGeoFromLocation(location)
  const res = await fetch('/api/reviews/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      visitor_id: visitorId,
      audience_type: getStoredAudience(),
      county: geo.county,
    }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { ok: false, error: body.error ?? 'Could not submit review' }
  }

  return { ok: true }
}

export async function markReviewHelpful(
  reviewId: string,
): Promise<{ ok: boolean; error?: string }> {
  const visitorId = getVisitorId()
  const res = await fetch('/api/reviews/helpful', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_id: reviewId, visitor_id: visitorId }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { ok: false, error: body.error ?? 'Could not save' }
  }

  writeHelpfulVote(reviewId)
  return { ok: true }
}

export async function reportReview(
  reviewId: string,
  reason: string,
  details?: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('/api/reviews/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      review_id: reviewId,
      visitor_id: getVisitorId(),
      reason,
      details,
    }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { ok: false, error: body.error ?? 'Could not submit report' }
  }

  return { ok: true }
}

export function formatVisitDate(month: number | null, year: number | null): string | null {
  if (!month || !year) return null
  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return `${labels[month - 1]} ${year}`
}

export function formatAverageRating(avg: number | null, count: number): string | null {
  if (avg == null || count < REVIEW_MIN_FOR_AVG_DISPLAY) return null
  return avg.toFixed(1)
}

export function buildSummaryLine(
  summary: ReviewSummary,
): { rating: string | null; reviewLabel: string; recommendLabel: string | null } {
  const rating = formatAverageRating(summary.averageRating, summary.reviewCount)
  const reviewLabel =
    summary.reviewCount === 1 ? '1 review' : `${summary.reviewCount} reviews`
  const recommendLabel =
    summary.percentRecommend != null
      ? `${summary.percentRecommend}% recommend`
      : summary.recommendationTotal >= RECOMMENDATION_MIN_FOR_PERCENT
        ? null
        : null
  return { rating, reviewLabel, recommendLabel }
}
