const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function dbConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url, key }
}

export default async function handler(
  req: {
    method?: string
    query?: Record<string, string | string[] | undefined>
    body?: Record<string, unknown>
  },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  const action = String(req.query?.action ?? '')

  if (action === 'stats' && req.method === 'GET') {
    const config = dbConfig()
    if (!config) return res.status(503).json({ error: 'Database not configured' })

    const serviceId =
      typeof req.query?.service_id === 'string' ? req.query.service_id.trim() : ''
    if (!serviceId) return res.status(400).json({ error: 'Missing service_id' })

    const headers = {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
    }

    const fetchRes = await fetch(
      `${config.url}/rest/v1/service_recommendations?service_id=eq.${encodeURIComponent(serviceId)}&ranking_eligible=eq.true&select=would_recommend`,
      { headers },
    )
    if (!fetchRes.ok) return res.status(500).json({ error: 'Failed to load stats' })

    const rows = (await fetchRes.json()) as Array<{ would_recommend: boolean }>
    let positive = 0
    for (const row of rows) {
      if (row.would_recommend) positive++
    }
    const negative = rows.length - positive
    return res.status(200).json({ positive, negative, total: rows.length })
  }

  if (action === 'vote' && req.method === 'POST') {
    const config = dbConfig()
    if (!config) return res.status(503).json({ error: 'Database not configured' })

    const serviceId = String(req.body?.service_id ?? '')
    const visitorId = String(req.body?.visitor_id ?? '')
    const wouldRecommend = req.body?.would_recommend

    if (!UUID_RE.test(serviceId) || !UUID_RE.test(visitorId)) {
      return res.status(400).json({ error: 'Invalid service or visitor id' })
    }
    if (typeof wouldRecommend !== 'boolean') {
      return res.status(400).json({ error: 'would_recommend must be boolean' })
    }

    const headers = {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }

    const serviceCheck = await fetch(
      `${config.url}/rest/v1/services?id=eq.${serviceId}&source=neq.demo&select=id`,
      { headers },
    )
    const services = (await serviceCheck.json()) as unknown[]
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(404).json({ error: 'Service not found' })
    }

    const upsertRes = await fetch(
      `${config.url}/rest/v1/service_recommendations?on_conflict=service_id,visitor_id`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          service_id: serviceId,
          visitor_id: visitorId,
          would_recommend: wouldRecommend,
          audience_type: req.body?.audience_type
            ? String(req.body.audience_type).slice(0, 64)
            : null,
          county: req.body?.county ? String(req.body.county).slice(0, 64) : null,
          town: req.body?.town ? String(req.body.town).slice(0, 64) : null,
          ranking_eligible: true,
          updated_at: new Date().toISOString(),
        }),
      },
    )

    if (!upsertRes.ok) {
      const text = await upsertRes.text()
      return res.status(500).json({ error: 'Failed to save recommendation', detail: text })
    }

    return res.status(200).json({ ok: true })
  }

  return res.status(404).json({ error: 'Not found' })
}
