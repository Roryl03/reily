import {
  checkAdminKey,
  getSupabaseConfig,
  supabaseHeaders,
} from '../_lib/supabaseAdmin'

const EARTH_RADIUS_MILES = 3958.8
const NEAR_RADIUS_MILES = 20
const MIN_FOR_PERCENT = 5

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function wilsonLowerBound(positive: number, total: number, z = 1.96): number {
  if (total <= 0) return 0
  const phat = positive / total
  const z2 = z * z
  const numerator =
    phat +
    z2 / (2 * total) -
    z * Math.sqrt((phat * (1 - phat) + z2 / (4 * total)) / total)
  const denominator = 1 + z2 / total
  return Math.max(0, numerator / denominator)
}

function computeTopPicksScore(
  positive: number,
  negative: number,
  avgRating: number | null,
  reviewCount: number,
): number {
  const total = positive + negative
  if (total < 3) return 0
  const confidence = wilsonLowerBound(positive, total)
  let score = confidence * Math.log1p(positive)
  if (avgRating != null && reviewCount > 0) {
    score += (avgRating / 5) * Math.log1p(reviewCount) * 0.12
  }
  return Math.round(score * 1000) / 1000
}

function monthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString()
  const end = new Date(Date.UTC(year, month, 1)).toISOString()
  return { start, end }
}

type ServiceRow = {
  id: string
  name: string
  category: string
  town: string
  county: string
  latitude: number | null
  longitude: number | null
  images: string[] | null
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

  const config = getSupabaseConfig()
  if (!config) {
    return res.status(503).json({ error: 'Database not configured' })
  }

  const scope = String(req.query?.scope ?? 'across')
  const lat = Number(req.query?.lat)
  const lng = Number(req.query?.lng)
  const year = Number(req.query?.year) || new Date().getUTCFullYear()
  const month = Number(req.query?.month) || new Date().getUTCMonth() + 1
  const archive = req.query?.archive === '1'
  const headers = supabaseHeaders(config.key)

  if (scope === 'near' && (!Number.isFinite(lat) || !Number.isFinite(lng))) {
    return res.status(400).json({ error: 'Location required for Near You rankings' })
  }

  const scopeKey = scope === 'near' ? `${lat.toFixed(2)},${lng.toFixed(2)}` : 'ni'

  if (archive) {
    const archiveRes = await fetch(
      `${config.url}/rest/v1/top_pick_results?period_year=eq.${year}&period_month=eq.${month}&scope=eq.${scope}&scope_key=eq.${encodeURIComponent(scopeKey)}&select=rank,top_picks_score,positive_recommendations,negative_recommendations,total_recommendations,recommend_percent,average_rating,review_count,previous_rank,service_id&order=rank.asc&limit=10`,
      { headers },
    )
    if (archiveRes.ok) {
      const archived = (await archiveRes.json()) as Array<Record<string, unknown>>
      if (archived.length > 0) {
        const serviceIds = archived.map((r) => r.service_id).join(',')
        const servicesRes = await fetch(
          `${config.url}/rest/v1/services?id=in.(${serviceIds})&select=id,name,category,town,county,images`,
          { headers },
        )
        const serviceMap = new Map<string, ServiceRow>()
        if (servicesRes.ok) {
          for (const s of (await servicesRes.json()) as ServiceRow[]) {
            serviceMap.set(s.id, s)
          }
        }
        return res.status(200).json({
          scope,
          year,
          month,
          items: archived.map((row) => {
            const service = serviceMap.get(String(row.service_id))
            return {
              rank: row.rank,
              score: row.top_picks_score,
              positiveRecommendations: row.positive_recommendations,
              negativeRecommendations: row.negative_recommendations,
              totalRecommendations: row.total_recommendations,
              recommendPercent: row.recommend_percent,
              averageRating: row.average_rating,
              reviewCount: row.review_count,
              previousRank: row.previous_rank,
              service: service
                ? {
                    id: service.id,
                    name: service.name,
                    category: service.category,
                    town: service.town,
                    county: service.county,
                    image: service.images?.[0] ?? null,
                  }
                : null,
            }
          }),
          source: 'archive',
        })
      }
    }
  }

  const { start, end } = monthBounds(year, month)

  const [servicesRes, recsRes, reviewsRes, prevArchiveRes] = await Promise.all([
    fetch(
      `${config.url}/rest/v1/services?source=neq.demo&select=id,name,category,town,county,latitude,longitude,images`,
      { headers },
    ),
    fetch(
      `${config.url}/rest/v1/service_recommendations?ranking_eligible=eq.true&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&select=service_id,would_recommend,updated_at`,
      { headers },
    ),
    fetch(
      `${config.url}/rest/v1/service_reviews?status=eq.approved&select=service_id,rating`,
      { headers },
    ),
    fetch(
      `${config.url}/rest/v1/top_pick_results?period_year=eq.${year}&period_month=eq.${month === 1 ? 12 : month - 1}&scope=eq.${scope}&scope_key=eq.${encodeURIComponent(scopeKey)}&select=service_id,rank`,
      { headers },
    ),
  ])

  const services = servicesRes.ok ? ((await servicesRes.json()) as ServiceRow[]) : []
  const recs = recsRes.ok
    ? ((await recsRes.json()) as Array<{ service_id: string; would_recommend: boolean }>)
    : []
  const reviews = reviewsRes.ok
    ? ((await reviewsRes.json()) as Array<{ service_id: string; rating: number }>)
    : []
  const prevRanks = prevArchiveRes.ok
    ? ((await prevArchiveRes.json()) as Array<{ service_id: string; rank: number }>)
    : []

  const prevRankMap = new Map(prevRanks.map((r) => [r.service_id, r.rank]))

  const reviewStats = new Map<string, { sum: number; count: number }>()
  for (const review of reviews) {
    const current = reviewStats.get(review.service_id) ?? { sum: 0, count: 0 }
    current.sum += review.rating
    current.count += 1
    reviewStats.set(review.service_id, current)
  }

  const recStats = new Map<string, { positive: number; negative: number }>()
  for (const rec of recs) {
    const current = recStats.get(rec.service_id) ?? { positive: 0, negative: 0 }
    if (rec.would_recommend) current.positive += 1
    else current.negative += 1
    recStats.set(rec.service_id, current)
  }

  let eligibleServices = services.filter((s) => s.latitude != null && s.longitude != null)
  if (scope === 'near') {
    eligibleServices = eligibleServices.filter((s) => {
      const dist = haversineMiles(lat, lng, s.latitude!, s.longitude!)
      return dist <= NEAR_RADIUS_MILES
    })
  }

  const eligibleIds = new Set(eligibleServices.map((s) => s.id))

  const ranked = eligibleServices
    .map((service) => {
      const rec = recStats.get(service.id) ?? { positive: 0, negative: 0 }
      const rev = reviewStats.get(service.id) ?? { sum: 0, count: 0 }
      const total = rec.positive + rec.negative
      const avgRating = rev.count > 0 ? Math.round((rev.sum / rev.count) * 10) / 10 : null
      const score = computeTopPicksScore(rec.positive, rec.negative, avgRating, rev.count)
      const recommendPercent =
        total >= MIN_FOR_PERCENT ? Math.round((rec.positive / total) * 100) : null

      return {
        service,
        score,
        positiveRecommendations: rec.positive,
        negativeRecommendations: rec.negative,
        totalRecommendations: total,
        recommendPercent,
        averageRating: avgRating,
        reviewCount: rev.count,
      }
    })
    .filter((entry) => entry.score > 0 && eligibleIds.has(entry.service.id))
    .sort((a, b) => b.score - a.score || b.positiveRecommendations - a.positiveRecommendations)
    .slice(0, 10)
    .map((entry, index) => {
      const rank = index + 1
      const previousRank = prevRankMap.get(entry.service.id) ?? null
      let movement: 'up' | 'down' | 'same' | 'new' = 'new'
      if (previousRank != null) {
        if (rank < previousRank) movement = 'up'
        else if (rank > previousRank) movement = 'down'
        else movement = 'same'
      }

      return {
        rank,
        score: entry.score,
        movement,
        previousRank,
        positiveRecommendations: entry.positiveRecommendations,
        negativeRecommendations: entry.negativeRecommendations,
        totalRecommendations: entry.totalRecommendations,
        recommendPercent: entry.recommendPercent,
        averageRating: entry.averageRating,
        reviewCount: entry.reviewCount,
        service: {
          id: entry.service.id,
          name: entry.service.name,
          category: entry.service.category,
          town: entry.service.town,
          county: entry.service.county,
          image: entry.service.images?.[0] ?? null,
        },
      }
    })

  if (checkAdminKey(req.headers) && ranked.length > 0) {
    const finalize = req.query?.finalize === '1'
    if (finalize) {
      for (const item of ranked) {
        await fetch(
          `${config.url}/rest/v1/top_pick_results?on_conflict=service_id,period_year,period_month,scope,scope_key`,
          {
            method: 'POST',
            headers: supabaseHeaders(config.key, 'resolution=merge-duplicates,return=minimal'),
            body: JSON.stringify({
              service_id: item.service.id,
              period_year: year,
              period_month: month,
              scope,
              scope_key: scopeKey,
              rank: item.rank,
              top_picks_score: item.score,
              positive_recommendations: item.positiveRecommendations,
              negative_recommendations: item.negativeRecommendations,
              total_recommendations: item.totalRecommendations,
              recommend_percent: item.recommendPercent,
              average_rating: item.averageRating,
              review_count: item.reviewCount,
              previous_rank: item.previousRank,
              finalized_at: new Date().toISOString(),
            }),
          },
        )

        if (item.rank <= 10) {
          const label =
            item.rank === 1
              ? `Ask Reilly Top Pick — ${MONTH_NAMES[month - 1]} ${year}`
              : `Ask Reilly Community Top 10 — ${MONTH_NAMES[month - 1]} ${year}`
          await fetch(
            `${config.url}/rest/v1/top_pick_badges?on_conflict=service_id,period_year,period_month,scope`,
            {
              method: 'POST',
              headers: supabaseHeaders(config.key, 'resolution=merge-duplicates,return=minimal'),
              body: JSON.stringify({
                service_id: item.service.id,
                period_year: year,
                period_month: month,
                scope,
                rank: item.rank,
                label,
              }),
            },
          )
        }
      }
    }
  }

  return res.status(200).json({
    scope,
    year,
    month,
    methodology:
      'Top Picks Score = Wilson 95% lower bound on recommendation rate × log(1 + positive recommendations) + small review quality boost.',
    items: ranked,
    source: 'live',
  })
}

const MONTH_NAMES = [
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
