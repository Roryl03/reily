import { checkAdminKey, getSupabaseConfig, supabaseHeaders } from '../../_lib/supabaseAdmin.js'

function monthStart(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

function periodStart(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

export default async function handler(
  req: {
    method?: string
    query?: Record<string, string | string[] | undefined>
    headers?: Record<string, string | undefined>
  },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!checkAdminKey(req.headers)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const config = getSupabaseConfig()
  if (!config) {
    return res.status(503).json({ error: 'Database not configured' })
  }

  const daysRaw = req.query?.days
  const days = typeof daysRaw === 'string' ? Math.min(365, Math.max(7, Number(daysRaw) || 30)) : 30
  const since = periodStart(days)
  const monthSince = monthStart()
  const headers = supabaseHeaders(config.key)

  const [
    recsRes,
    recsMonthRes,
    reviewsRes,
    reviewsMonthRes,
    pendingRes,
    reportsRes,
    flagsRes,
    servicesRes,
  ] = await Promise.all([
    fetch(
      `${config.url}/rest/v1/service_recommendations?created_at=gte.${encodeURIComponent(since)}&select=would_recommend,county,service_id`,
      { headers },
    ),
    fetch(
      `${config.url}/rest/v1/service_recommendations?created_at=gte.${encodeURIComponent(monthSince)}&select=would_recommend,service_id`,
      { headers },
    ),
    fetch(
      `${config.url}/rest/v1/service_reviews?created_at=gte.${encodeURIComponent(since)}&select=rating,status,county,service_id`,
      { headers },
    ),
    fetch(
      `${config.url}/rest/v1/service_reviews?created_at=gte.${encodeURIComponent(monthSince)}&select=rating,status,service_id`,
      { headers },
    ),
    fetch(`${config.url}/rest/v1/service_reviews?status=eq.pending&select=id`, { headers }),
    fetch(`${config.url}/rest/v1/review_reports?status=eq.open&select=id`, { headers }),
    fetch(
      `${config.url}/rest/v1/recommendation_risk_flags?resolved=eq.false&select=id,service_id,flag_type,created_at`,
      { headers },
    ),
    fetch(
      `${config.url}/rest/v1/services?source=neq.demo&select=id,name,category,county`,
      { headers },
    ),
  ])

  const recs = recsRes.ok
    ? ((await recsRes.json()) as Array<{ would_recommend: boolean; county: string | null; service_id: string }>)
    : []
  const recsMonth = recsMonthRes.ok
    ? ((await recsMonthRes.json()) as Array<{ would_recommend: boolean; service_id: string }>)
    : []
  const reviews = reviewsRes.ok
    ? ((await reviewsRes.json()) as Array<{ rating: number; status: string; county: string | null; service_id: string }>)
    : []
  const reviewsMonth = reviewsMonthRes.ok
    ? ((await reviewsMonthRes.json()) as Array<{ rating: number; status: string; service_id: string }>)
    : []
  const pending = pendingRes.ok ? ((await pendingRes.json()) as unknown[]) : []
  const reports = reportsRes.ok ? ((await reportsRes.json()) as unknown[]) : []
  const flags = flagsRes.ok
    ? ((await flagsRes.json()) as Array<{ id: string; service_id: string; flag_type: string; created_at: string }>)
    : []
  const services = servicesRes.ok
    ? ((await servicesRes.json()) as Array<{ id: string; name: string; category: string; county: string }>)
    : []

  const serviceMap = new Map(services.map((s) => [s.id, s]))

  const positiveRecs = recs.filter((r) => r.would_recommend).length
  const negativeRecs = recs.length - positiveRecs
  const recRate = recs.length > 0 ? Math.round((positiveRecs / recs.length) * 1000) / 10 : 0

  const approvedReviews = reviews.filter((r) => r.status === 'approved')
  const avgRating =
    approvedReviews.length > 0
      ? Math.round(
          (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length) * 10,
        ) / 10
      : null

  const recsByCounty: Record<string, number> = {}
  const reviewsByCounty: Record<string, number> = {}
  const recsByCategory: Record<string, number> = {}
  const reviewsByCategory: Record<string, number> = {}

  for (const rec of recs) {
    const county = rec.county ?? 'Unknown'
    recsByCounty[county] = (recsByCounty[county] ?? 0) + 1
    const service = serviceMap.get(rec.service_id)
    if (service) {
      recsByCategory[service.category] = (recsByCategory[service.category] ?? 0) + 1
    }
  }

  for (const review of reviews) {
    const county = review.county ?? 'Unknown'
    reviewsByCounty[county] = (reviewsByCounty[county] ?? 0) + 1
    const service = serviceMap.get(review.service_id)
    if (service) {
      reviewsByCategory[service.category] = (reviewsByCategory[service.category] ?? 0) + 1
    }
  }

  const recCountByService = new Map<string, number>()
  for (const rec of recs) {
    recCountByService.set(rec.service_id, (recCountByService.get(rec.service_id) ?? 0) + 1)
  }
  const reviewCountByService = new Map<string, number>()
  for (const review of reviews) {
    reviewCountByService.set(review.service_id, (reviewCountByService.get(review.service_id) ?? 0) + 1)
  }

  function topService(map: Map<string, number>) {
    let bestId = ''
    let bestCount = 0
    for (const [id, count] of map) {
      if (count > bestCount) {
        bestId = id
        bestCount = count
      }
    }
    const service = serviceMap.get(bestId)
    return service ? { id: bestId, name: service.name, count: bestCount } : null
  }

  return res.status(200).json({
    periodDays: days,
    overview: {
      totalRecommendations: recs.length,
      positiveRecommendations: positiveRecs,
      negativeRecommendations: negativeRecs,
      recommendationRate: recRate,
      reviewsSubmitted: reviews.length,
      averageStarRating: avgRating,
      recommendationsThisMonth: recsMonth.length,
      reviewsThisMonth: reviewsMonth.length,
      reviewsAwaitingModeration: pending.length,
      reportedReviews: reports.length,
      suspiciousActivity: flags.length,
    },
    geography: {
      recommendationsByCounty: recsByCounty,
      reviewsByCounty: reviewsByCounty,
    },
    categories: {
      recommendationsByCategory: recsByCategory,
      reviewsByCategory: reviewsByCategory,
    },
    highlights: {
      mostRecommendedService: topService(recCountByService),
      mostReviewedService: topService(reviewCountByService),
    },
    riskFlags: flags.map((f) => ({
      ...f,
      serviceName: serviceMap.get(f.service_id)?.name ?? 'Unknown',
    })),
  })
}
