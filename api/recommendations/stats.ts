export default async function handler(
  req: { method?: string; query?: Record<string, string | string[] | undefined> },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const serviceId =
    typeof req.query?.service_id === 'string' ? req.query.service_id.trim() : ''
  if (!serviceId) {
    return res.status(400).json({ error: 'Missing service_id' })
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    return res.status(503).json({ error: 'Database not configured' })
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }

  const rpcRes = await fetch(`${url}/rest/v1/rpc/get_service_recommendation_stats`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_service_id: serviceId }),
  })

  if (rpcRes.ok) {
    const data = (await rpcRes.json()) as {
      positive?: number
      negative?: number
      total?: number
    }
    const positive = Number(data.positive ?? 0)
    const negative = Number(data.negative ?? 0)
    const total = Number(data.total ?? positive + negative)
    return res.status(200).json({ positive, negative, total })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return res.status(503).json({
      error: 'Recommendation stats unavailable. Run supabase/community-stats-rpc.sql in Supabase.',
    })
  }

  const fetchRes = await fetch(
    `${url}/rest/v1/service_recommendations?service_id=eq.${encodeURIComponent(serviceId)}&ranking_eligible=eq.true&select=would_recommend`,
    { headers: { ...headers, Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )

  if (!fetchRes.ok) {
    return res.status(500).json({ error: 'Failed to load stats' })
  }

  const rows = (await fetchRes.json()) as Array<{ would_recommend: boolean }>
  let positive = 0
  for (const row of rows) {
    if (row.would_recommend) positive++
  }

  return res.status(200).json({
    positive,
    negative: rows.length - positive,
    total: rows.length,
  })
}
