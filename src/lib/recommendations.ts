import { coarseGeoFromLocation } from '@/lib/geoContext'
import { getStoredAudience, getVisitorId } from '@/lib/visitor'
import {
  RECOMMENDATION_MIN_FOR_PERCENT,
  type RecommendationStats,
  type VisitorRecommendation,
} from '@/types/recommendations'
import type { UserLocation } from '@/types/service'

const LOCAL_VOTES_KEY = 'reily_recommendation_votes'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function readLocalVotes(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_VOTES_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

function writeLocalVote(serviceId: string, wouldRecommend: boolean): void {
  try {
    const votes = readLocalVotes()
    votes[serviceId] = wouldRecommend
    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votes))
  } catch {
    /* private browsing */
  }
}

export function getLocalRecommendation(serviceId: string): VisitorRecommendation {
  const votes = readLocalVotes()
  return serviceId in votes ? votes[serviceId] : null
}

export function buildRecommendationStats(
  positive: number,
  negative: number,
): RecommendationStats {
  const total = positive + negative
  const percentRecommend =
    total >= RECOMMENDATION_MIN_FOR_PERCENT
      ? Math.round((positive / total) * 100)
      : null
  return { positive, negative, total, percentRecommend }
}

export async function fetchRecommendationStats(
  serviceId: string,
): Promise<RecommendationStats> {
  const res = await fetch(
    `/api/recommendations/stats?service_id=${encodeURIComponent(serviceId)}`,
  )
  if (!res.ok) {
    return buildRecommendationStats(0, 0)
  }
  const data = (await res.json()) as { positive?: number; negative?: number }
  return buildRecommendationStats(data.positive ?? 0, data.negative ?? 0)
}

export async function submitRecommendation(
  serviceId: string,
  wouldRecommend: boolean,
  location: UserLocation | null,
): Promise<{ ok: boolean; error?: string }> {
  const visitorId = getVisitorId()
  if (!UUID_RE.test(visitorId)) {
    return { ok: false, error: 'Could not identify visitor' }
  }

  const geo = coarseGeoFromLocation(location)
  const res = await fetch('/api/recommendations/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      visitor_id: visitorId,
      would_recommend: wouldRecommend,
      audience_type: getStoredAudience(),
      county: geo.county,
      town: geo.town,
    }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return { ok: false, error: body.error ?? 'Could not save recommendation' }
  }

  writeLocalVote(serviceId, wouldRecommend)
  return { ok: true }
}
