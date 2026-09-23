import { getSupabaseConfig, supabaseHeaders, UUID_RE } from '../_lib/supabaseAdmin'

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

  const reviewId = String(req.body?.review_id ?? '')
  const visitorId = String(req.body?.visitor_id ?? '')

  if (!UUID_RE.test(reviewId) || !UUID_RE.test(visitorId)) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  const headers = supabaseHeaders(config.key, 'return=minimal,resolution=ignore-duplicates')

  const insertRes = await fetch(`${config.url}/rest/v1/review_helpful_votes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ review_id: reviewId, visitor_id: visitorId }),
  })

  if (!insertRes.ok && insertRes.status !== 409) {
    return res.status(500).json({ error: 'Failed to save helpful vote' })
  }

  const countRes = await fetch(
    `${config.url}/rest/v1/review_helpful_votes?review_id=eq.${reviewId}&select=id`,
    { headers: supabaseHeaders(config.key) },
  )
  const votes = countRes.ok ? ((await countRes.json()) as unknown[]) : []
  const helpfulCount = votes.length

  await fetch(`${config.url}/rest/v1/service_reviews?id=eq.${reviewId}`, {
    method: 'PATCH',
    headers: supabaseHeaders(config.key, 'return=minimal'),
    body: JSON.stringify({ helpful_count: helpfulCount, updated_at: new Date().toISOString() }),
  })

  return res.status(200).json({ ok: true, helpfulCount })
}
