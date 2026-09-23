import { getSupabaseConfig, supabaseHeaders, UUID_RE } from '../_lib/supabaseAdmin'

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
  const badgeRes = await fetch(
    `${config.url}/rest/v1/top_pick_badges?service_id=eq.${serviceId}&select=period_year,period_month,scope,rank,label&order=period_year.desc,period_month.desc`,
    { headers },
  )

  if (!badgeRes.ok) {
    return res.status(500).json({ error: 'Failed to load badges' })
  }

  const badges = (await badgeRes.json()) as Array<{
    period_year: number
    period_month: number
    scope: 'near' | 'across'
    rank: number
    label: string
  }>

  return res.status(200).json({
    badges: badges.map((b) => ({
      year: b.period_year,
      month: b.period_month,
      scope: b.scope,
      rank: b.rank,
      label: b.label,
    })),
  })
}
