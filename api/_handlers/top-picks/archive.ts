import { getSupabaseConfig, supabaseHeaders } from '../../_lib/supabaseAdmin.js'

export default async function handler(
  req: { method?: string; query?: Record<string, string | string[] | undefined> },
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
  const headers = supabaseHeaders(config.key)

  const resultRes = await fetch(
    `${config.url}/rest/v1/top_pick_results?scope=eq.${scope}&select=period_year,period_month,finalized_at&order=period_year.desc,period_month.desc&limit=500`,
    { headers },
  )

  if (!resultRes.ok) {
    return res.status(500).json({ error: 'Failed to load archive' })
  }

  const rows = (await resultRes.json()) as Array<{
    period_year: number
    period_month: number
    finalized_at: string | null
  }>

  const seen = new Set<string>()
  const periods: Array<{ year: number; month: number; finalizedAt: string | null }> = []
  for (const row of rows) {
    const key = `${row.period_year}-${row.period_month}`
    if (seen.has(key)) continue
    seen.add(key)
    periods.push({
      year: row.period_year,
      month: row.period_month,
      finalizedAt: row.finalized_at,
    })
  }

  return res.status(200).json({ scope, periods })
}
