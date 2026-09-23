import { getSupabaseConfig, supabaseHeaders, UUID_RE } from '../_lib/supabaseAdmin'

const ALLOWED_REASONS = new Set([
  'Inappropriate',
  'Spam',
  'Personal information',
  'Abusive',
  'Potentially false/misleading',
  'Other',
])

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
  const reason = String(req.body?.reason ?? '')
  const details = req.body?.details ? String(req.body.details).slice(0, 500) : null

  if (!UUID_RE.test(reviewId) || !UUID_RE.test(visitorId)) {
    return res.status(400).json({ error: 'Invalid id' })
  }
  if (!ALLOWED_REASONS.has(reason)) {
    return res.status(400).json({ error: 'Invalid report reason' })
  }

  const headers = supabaseHeaders(config.key, 'return=minimal,resolution=ignore-duplicates')
  const insertRes = await fetch(`${config.url}/rest/v1/review_reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      review_id: reviewId,
      visitor_id: visitorId,
      reason,
      details,
    }),
  })

  if (!insertRes.ok && insertRes.status !== 409) {
    return res.status(500).json({ error: 'Failed to submit report' })
  }

  return res.status(200).json({ ok: true })
}
