const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url, key }
}

function supabaseHeaders(key: string, prefer?: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) }
}

function checkAdminKey(headers?: Record<string, string | undefined>) {
  const adminKey = process.env.ADMIN_KEY ?? process.env.VITE_ADMIN_KEY ?? ""
  const authHeader = headers?.["x-admin-key"] ?? headers?.["X-Admin-Key"]
  return Boolean(adminKey && authHeader === adminKey)
}




type ReviewRow = {
  id: string
  rating: number
  would_recommend: boolean
  visit_month: number | null
  visit_year: number | null
  review_text: string
  display_name: string | null
  is_anonymous: boolean
  helpful_count: number
  created_at: string
}

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
  const sort = String(req.query?.sort ?? 'helpful')
  const visitorId = String(req.query?.visitor_id ?? '')

  if (!UUID_RE.test(serviceId)) {
    return res.status(400).json({ error: 'Invalid service id' })
  }

  const headers = supabaseHeaders(config.key)
  const reviewRes = await fetch(
    `${config.url}/rest/v1/service_reviews?service_id=eq.${serviceId}&status=eq.approved&select=id,rating,would_recommend,visit_month,visit_year,review_text,display_name,is_anonymous,helpful_count,created_at&limit=100`,
    { headers },
  )

  if (!reviewRes.ok) {
    return res.status(500).json({ error: 'Failed to load reviews' })
  }

  let rows = (await reviewRes.json()) as ReviewRow[]

  switch (sort) {
    case 'newest':
      rows.sort((a, b) => b.created_at.localeCompare(a.created_at))
      break
    case 'highest':
      rows.sort((a, b) => b.rating - a.rating || b.created_at.localeCompare(a.created_at))
      break
    case 'lowest':
      rows.sort((a, b) => a.rating - b.rating || b.created_at.localeCompare(a.created_at))
      break
    default:
      rows.sort(
        (a, b) =>
          b.helpful_count - a.helpful_count || b.created_at.localeCompare(a.created_at),
      )
  }

  let helpfulIds = new Set<string>()
  if (UUID_RE.test(visitorId) && rows.length > 0) {
    const ids = rows.map((r) => r.id).join(',')
    const helpfulRes = await fetch(
      `${config.url}/rest/v1/review_helpful_votes?review_id=in.(${ids})&visitor_id=eq.${visitorId}&select=review_id`,
      { headers },
    )
    if (helpfulRes.ok) {
      const helpfulRows = (await helpfulRes.json()) as Array<{ review_id: string }>
      helpfulIds = new Set(helpfulRows.map((h) => h.review_id))
    }
  }

  const reviews = rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    wouldRecommend: row.would_recommend,
    visitMonth: row.visit_month,
    visitYear: row.visit_year,
    reviewText: row.review_text,
    displayName: row.is_anonymous
      ? 'Anonymous Ask Reilly user'
      : row.display_name?.trim() || 'Ask Reilly user',
    helpfulCount: row.helpful_count,
    createdAt: row.created_at,
    userFoundHelpful: helpfulIds.has(row.id),
  }))

  return res.status(200).json({ reviews })
}
