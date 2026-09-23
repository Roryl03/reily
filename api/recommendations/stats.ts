export default async function handler(
  req: { method?: string; query?: Record<string, string | string[] | undefined> },
  res: {
    status: (code: number) => { json: (body: unknown) => void }
  },
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

  const fetchRes = await fetch(
    `${url}/rest/v1/service_recommendations?service_id=eq.${encodeURIComponent(serviceId)}&ranking_eligible=eq.true&select=would_recommend`,
    { headers },
  )

  if (!fetchRes.ok) {
    return res.status(500).json({ error: 'Failed to load stats' })
  }

  const rows = (await fetchRes.json()) as Array<{ would_recommend: boolean }>
  let positive = 0
  let negative = 0
  for (const row of rows) {
    if (row.would_recommend) positive++
    else negative++
  }

  return res.status(200).json({ positive, negative, total: positive + negative })
}
