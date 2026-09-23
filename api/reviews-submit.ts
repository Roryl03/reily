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




export default async function handler(
  req: { method?: string; body?: Record<string, unknown> },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const config = getSupabaseConfig()
  if (!config) {
    return res.status(503).json({ error: 'Database not configured' })
  }

  const serviceId = String(req.body?.serviceId ?? req.body?.service_id ?? '')
  const visitorId = String(req.body?.visitor_id ?? '')
  const rating = Number(req.body?.rating)
  const wouldRecommend = req.body?.wouldRecommend ?? req.body?.would_recommend
  const visitMonth = Number(req.body?.visitMonth ?? req.body?.visit_month)
  const visitYear = Number(req.body?.visitYear ?? req.body?.visit_year)
  const reviewText = String(req.body?.reviewText ?? req.body?.review_text ?? '').trim()
  const isAnonymous = req.body?.isAnonymous ?? req.body?.is_anonymous
  const displayNameRaw = req.body?.displayName ?? req.body?.display_name

  if (!UUID_RE.test(serviceId) || !UUID_RE.test(visitorId)) {
    return res.status(400).json({ error: 'Invalid service or visitor id' })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1–5' })
  }
  if (typeof wouldRecommend !== 'boolean') {
    return res.status(400).json({ error: 'Recommendation required' })
  }
  if (!Number.isInteger(visitMonth) || visitMonth < 1 || visitMonth > 12) {
    return res.status(400).json({ error: 'Visit month required' })
  }
  if (!Number.isInteger(visitYear) || visitYear < 2000 || visitYear > 2100) {
    return res.status(400).json({ error: 'Visit year required' })
  }
  if (reviewText.length < 10 || reviewText.length > 4000) {
    return res.status(400).json({ error: 'Review must be 10–4000 characters' })
  }

  const anonymous = isAnonymous !== false
  const displayName =
    !anonymous && typeof displayNameRaw === 'string'
      ? displayNameRaw.trim().slice(0, 64)
      : null

  if (!anonymous && (!displayName || displayName.length < 2)) {
    return res.status(400).json({ error: 'Display name required when not posting anonymously' })
  }

  const headers = supabaseHeaders(config.key, 'return=minimal')
  const serviceCheck = await fetch(
    `${config.url}/rest/v1/services?id=eq.${serviceId}&source=neq.demo&select=id`,
    { headers },
  )
  const services = (await serviceCheck.json()) as unknown[]
  if (!Array.isArray(services) || services.length === 0) {
    return res.status(404).json({ error: 'Service not found' })
  }

  const now = new Date().toISOString()
  const row = {
    service_id: serviceId,
    visitor_id: visitorId,
    rating,
    would_recommend: wouldRecommend,
    visit_month: visitMonth,
    visit_year: visitYear,
    review_text: reviewText,
    display_name: displayName,
    is_anonymous: anonymous,
    extra_answers: {},
    status: 'pending',
    audience_type: req.body?.audience_type
      ? String(req.body.audience_type).slice(0, 64)
      : null,
    county: req.body?.county ? String(req.body.county).slice(0, 64) : null,
    updated_at: now,
  }

  const insertRes = await fetch(`${config.url}/rest/v1/service_reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify(row),
  })

  if (!insertRes.ok) {
    const text = await insertRes.text()
    return res.status(500).json({ error: 'Failed to submit review', detail: text })
  }

  return res.status(200).json({ ok: true, status: 'pending' })
}
