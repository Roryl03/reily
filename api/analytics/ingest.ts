const ALLOWED_EVENTS = new Set([
  'SESSION_STARTED',
  'LOCATION_ONBOARDING_COMPLETED',
  'AUDIENCE_SELECTED',
  'AUDIENCE_SKIPPED',
  'SEARCH_PERFORMED',
  'CATEGORY_VIEWED',
  'SERVICE_VIEWED',
  'MAP_INTERACTION',
  'SERVICE_WEBSITE_CLICKED',
  'SERVICE_PHONE_CLICKED',
  'SERVICE_DIRECTIONS_CLICKED',
  'SERVICE_SHARED',
  'FAVOURITE_ADDED',
  'RECOMMENDATION_SUBMITTED',
  'REVIEW_SUBMITTED',
  'TOP_PICKS_VIEWED',
])

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function sanitizeProperties(raw: unknown): Record<string, string | number | boolean | null> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (key.length > 64) continue
    if (typeof value === 'string' && value.length <= 200) out[key] = value
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value
    else if (typeof value === 'boolean') out[key] = value
    else if (value === null) out[key] = null
  }
  return out
}

export default async function handler(
  req: { method?: string; body?: { events?: unknown[] } },
  res: {
    status: (code: number) => { json: (body: unknown) => void }
  },
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    return res.status(503).json({ error: 'Analytics storage not configured' })
  }

  const events = req.body?.events
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'No events provided' })
  }

  if (events.length > 50) {
    return res.status(400).json({ error: 'Too many events in batch' })
  }

  const rows = []
  for (const raw of events) {
    if (!raw || typeof raw !== 'object') continue
    const e = raw as Record<string, unknown>
    const eventType = String(e.event_type ?? '')
    const visitorId = String(e.visitor_id ?? '')
    const sessionId = String(e.session_id ?? '')

    if (!ALLOWED_EVENTS.has(eventType)) continue
    if (!UUID_RE.test(visitorId) || !UUID_RE.test(sessionId)) continue

    rows.push({
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: eventType,
      audience_type: e.audience_type ? String(e.audience_type).slice(0, 64) : null,
      county: e.county ? String(e.county).slice(0, 64) : null,
      town: e.town ? String(e.town).slice(0, 64) : null,
      properties: sanitizeProperties(e.properties),
      created_at: e.created_at ? String(e.created_at) : new Date().toISOString(),
    })
  }

  if (rows.length === 0) {
    return res.status(400).json({ error: 'No valid events' })
  }

  const insertRes = await fetch(`${url}/rest/v1/analytics_events`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  })

  if (!insertRes.ok) {
    const text = await insertRes.text()
    return res.status(500).json({ error: 'Failed to store events', detail: text })
  }

  return res.status(200).json({ accepted: rows.length })
}
