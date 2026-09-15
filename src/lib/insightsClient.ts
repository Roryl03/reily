import { ADMIN_KEY } from '@/lib/config'

export interface InsightsData {
  periodDays: number
  hasData: boolean
  overview: {
    services: number
    visitors: number
    sessions: number
    returningVisitors: number
    serviceViews: number
    searches: number
    interactions: number
    countiesCovered: number
    countiesTotal: number
  }
  audience: {
    breakdown: Array<{
      id: string
      count: number
      pctOfKnown: number
      pctOfTotal: number
    }>
    knownCount: number
    unansweredCount: number
    professionalUsage: {
      count: number
      pctOfKnown: number
      growthPct: number | null
    }
  }
  geography: {
    byCounty: Array<{
      county: string
      visitors: number
      audience: Record<string, number>
      servicesListed: number
    }>
  }
  engagement: {
    categoryViews: Record<string, number>
    audienceCategory: Record<string, Record<string, number>>
    servicesByCategory: Record<string, number>
  }
  trends: {
    visitorsGrowthPct: number | null
    sessionsGrowthPct: number | null
  }
  recent24h: {
    totalVisitors: number
    totalSessions: number
    serviceViews: number
    searches: number
    interactions: number
  }
}

export async function fetchInsights(days = 30): Promise<InsightsData> {
  if (!ADMIN_KEY) {
    throw new Error('Insights require ADMIN_KEY to be configured.')
  }

  const res = await fetch(`/api/analytics/insights?days=${days}`, {
    headers: { 'X-Admin-Key': ADMIN_KEY },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'Failed to load insights')
  }

  return res.json() as Promise<InsightsData>
}
