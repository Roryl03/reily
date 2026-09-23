import { getSupabaseConfig, supabaseHeaders, UUID_RE } from '../../_lib/supabaseAdmin.js'

const MIN_FOR_PERCENT = 5
const MIN_FOR_AVG = 3

export default async function handler(
  req: {
    method?: string
    query?: Record<string, string | string[] | undefined>
  },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const config = getSupabaseConfig()
  if (!config) {
    return res.status(503).json({ error: 'Database not configured' })
  }

  const serviceId = String(req.query?.service_id ?? '')
  if (!UUID_RE.test(serviceId)) {
    return res.status(400).json({ error: 'Invalid service id' })
  }

  const headers = supabaseHeaders(config.key)

  const [reviewsRes, recRes] = await Promise.all([
    fetch(
      `${config.url}/rest/v1/service_reviews?service_id=eq.${serviceId}&status=eq.approved&select=rating,would_recommend`,
      { headers },
    ),
    fetch(
      `${config.url}/rest/v1/service_recommendations?service_id=eq.${serviceId}&ranking_eligible=eq.true&select=would_recommend`,
      { headers },
    ),
  ])

  const reviews = reviewsRes.ok
    ? ((await reviewsRes.json()) as Array<{ rating: number; would_recommend: boolean }>)
    : []

  const recs = recRes.ok
    ? ((await recRes.json()) as Array<{ would_recommend: boolean }>)
    : []

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  let ratingSum = 0
  for (const review of reviews) {
    const r = Math.min(5, Math.max(1, review.rating)) as 1 | 2 | 3 | 4 | 5
    distribution[r] += 1
    ratingSum += review.rating
  }

  const reviewCount = reviews.length
  const averageRating =
    reviewCount >= MIN_FOR_AVG ? Math.round((ratingSum / reviewCount) * 10) / 10 : null

  const positiveRecs = recs.filter((r) => r.would_recommend).length
  const negativeRecs = recs.length - positiveRecs
  const recommendationTotal = recs.length
  const percentRecommend =
    recommendationTotal >= MIN_FOR_PERCENT
      ? Math.round((positiveRecs / recommendationTotal) * 100)
      : null

  return res.status(200).json({
    averageRating,
    reviewCount,
    distribution,
    percentRecommend,
    recommendationTotal,
    positiveRecommendations: positiveRecs,
    negativeRecommendations: negativeRecs,
  })
}
