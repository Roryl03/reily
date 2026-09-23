const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function handler(
  req: { method?: string; body?: Record<string, unknown> },
  res: { status: (code: number) => { json: (body: unknown) => void } },
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
    return res.status(503).json({ error: 'Database not configured' })
  }

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
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  }

  const serviceCheck = await fetch(
    `${url}/rest/v1/services?id=eq.${serviceId}&source=neq.demo&select=id`,
    { headers },
  )
  const services = (await serviceCheck.json()) as unknown[]
  if (!Array.isArray(services) || services.length === 0) {
    return res.status(404).json({ error: 'Service not found' })
  }

  const upsertRes = await fetch(
    `${url}/rest/v1/service_recommendations?on_conflict=service_id,visitor_id`,
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
