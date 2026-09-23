import { ADMIN_KEY } from '@/lib/config'
import type { TopPickItem } from '@/lib/topPicks'

export interface CommunityInsights {
  periodDays: number
  overview: {
    totalRecommendations: number
    positiveRecommendations: number
    negativeRecommendations: number
    recommendationRate: number
    reviewsSubmitted: number
    averageStarRating: number | null
    recommendationsThisMonth: number
    reviewsThisMonth: number
    reviewsAwaitingModeration: number
    reportedReviews: number
    suspiciousActivity: number
  }
  geography: {
    recommendationsByCounty: Record<string, number>
    reviewsByCounty: Record<string, number>
  }
  categories: {
    recommendationsByCategory: Record<string, number>
    reviewsByCategory: Record<string, number>
  }
  highlights: {
    mostRecommendedService: { id: string; name: string; count: number } | null
    mostReviewedService: { id: string; name: string; count: number } | null
  }
  riskFlags: Array<{
    id: string
    service_id: string
    serviceName: string
    flag_type: string
    created_at: string
  }>
}

export interface ModerationReview {
  id: string
  service_id: string
  rating: number
  would_recommend: boolean
  review_text: string
  display_name: string | null
  is_anonymous: boolean
  status: string
  created_at: string
  visit_month: number | null
  visit_year: number | null
}

function adminHeaders(): HeadersInit {
  return { 'X-Admin-Key': ADMIN_KEY ?? '' }
}

export async function fetchCommunityInsights(days = 30): Promise<CommunityInsights> {
  const res = await fetch(`/api/community/insights?days=${days}`, { headers: adminHeaders() })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'Failed to load community insights')
  }
  return res.json() as Promise<CommunityInsights>
}

export async function fetchModerationReviews(
  filter: 'pending' | 'reported' | 'all' = 'pending',
): Promise<{ reviews: ModerationReview[]; reports?: Array<{ review_id: string; reason: string }> }> {
  const res = await fetch(`/api/community/moderation?filter=${filter}`, { headers: adminHeaders() })
  if (!res.ok) throw new Error('Failed to load moderation queue')
  return res.json() as Promise<{ reviews: ModerationReview[]; reports?: Array<{ review_id: string; reason: string }> }>
}

export async function moderateReview(
  reviewId: string,
  action: 'approve' | 'hide' | 'remove' | 'restore',
  adminNote?: string,
): Promise<void> {
  const res = await fetch('/api/community/moderation', {
    method: 'POST',
    headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ review_id: reviewId, action, admin_note: adminNote }),
  })
  if (!res.ok) throw new Error('Moderation action failed')
}

export async function fetchAdminTopPicks(scope: 'near' | 'across'): Promise<TopPickItem[]> {
  const res = await fetch(`/api/top-picks?scope=${scope}`, { headers: adminHeaders() })
  if (!res.ok) return []
  const data = (await res.json()) as { items?: TopPickItem[] }
  return data.items ?? []
}

export async function finalizeTopPicks(
  scope: 'near' | 'across',
  year: number,
  month: number,
): Promise<void> {
  const res = await fetch(
    `/api/top-picks?scope=${scope}&year=${year}&month=${month}&finalize=1`,
    { headers: adminHeaders() },
  )
  if (!res.ok) throw new Error('Failed to finalize Top Picks')
}
