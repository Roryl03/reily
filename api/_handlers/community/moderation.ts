import { checkAdminKey, getSupabaseConfig, supabaseHeaders, UUID_RE } from '../../_lib/supabaseAdmin.js'

type ReviewRow = {
  id: string
  service_id: string
  rating: number
  would_recommend: boolean
  review_text: string
  display_name: string | null
  is_anonymous: boolean
  status: string
  created_at: string
  visit_month: number | null
  visit_year: number | null
}

export default async function handler(
  req: {
    method?: string
    query?: Record<string, string | string[] | undefined>
    body?: Record<string, unknown>
    headers?: Record<string, string | undefined>
  },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  if (!checkAdminKey(req.headers)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const config = getSupabaseConfig()
  if (!config) {
    return res.status(503).json({ error: 'Database not configured' })
  }

  const headers = supabaseHeaders(config.key)

  if (req.method === 'GET') {
    const filter = String(req.query?.filter ?? 'pending')
    let statusFilter = 'status=eq.pending'
    if (filter === 'reported') {
      const reportsRes = await fetch(
        `${config.url}/rest/v1/review_reports?status=eq.open&select=review_id,reason,created_at&order=created_at.desc&limit=100`,
        { headers },
      )
      const reports = reportsRes.ok
        ? ((await reportsRes.json()) as Array<{ review_id: string; reason: string; created_at: string }>)
        : []
      const reviewIds = [...new Set(reports.map((r) => r.review_id))]
      if (reviewIds.length === 0) {
        return res.status(200).json({ reviews: [], reports: [] })
      }
      const reviewsRes = await fetch(
        `${config.url}/rest/v1/service_reviews?id=in.(${reviewIds.join(',')})&select=id,service_id,rating,would_recommend,review_text,display_name,is_anonymous,status,created_at,visit_month,visit_year&order=created_at.desc`,
        { headers },
      )
      const reviews = reviewsRes.ok ? ((await reviewsRes.json()) as ReviewRow[]) : []
      return res.status(200).json({ reviews, reports })
    }
    if (filter === 'all') statusFilter = ''
    else if (filter === 'approved') statusFilter = 'status=eq.approved'
    else if (filter === 'hidden') statusFilter = 'status=eq.hidden'
    else if (filter === 'removed') statusFilter = 'status=eq.removed'

    const query = statusFilter
      ? `${config.url}/rest/v1/service_reviews?${statusFilter}&select=id,service_id,rating,would_recommend,review_text,display_name,is_anonymous,status,created_at,visit_month,visit_year&order=created_at.desc&limit=100`
      : `${config.url}/rest/v1/service_reviews?select=id,service_id,rating,would_recommend,review_text,display_name,is_anonymous,status,created_at,visit_month,visit_year&order=created_at.desc&limit=100`

    const reviewsRes = await fetch(query, { headers })
    const reviews = reviewsRes.ok ? ((await reviewsRes.json()) as ReviewRow[]) : []

    const logRes = await fetch(
      `${config.url}/rest/v1/review_moderation_log?select=review_id,action,previous_status,new_status,admin_note,created_at&order=created_at.desc&limit=50`,
      { headers },
    )
    const log = logRes.ok ? await logRes.json() : []

    return res.status(200).json({ reviews, log })
  }

  if (req.method === 'POST') {
    const reviewId = String(req.body?.review_id ?? '')
    const action = String(req.body?.action ?? '')
    const note = req.body?.admin_note ? String(req.body.admin_note).slice(0, 500) : null

    if (!UUID_RE.test(reviewId)) {
      return res.status(400).json({ error: 'Invalid review id' })
    }

    const currentRes = await fetch(
      `${config.url}/rest/v1/service_reviews?id=eq.${reviewId}&select=status,review_text`,
      { headers },
    )
    const currentRows = currentRes.ok
      ? ((await currentRes.json()) as Array<{ status: string; review_text: string }>)
      : []
    const current = currentRows[0]
    if (!current) {
      return res.status(404).json({ error: 'Review not found' })
    }
    const previousStatus = current.status

    if (action === 'delete') {
      await fetch(`${config.url}/rest/v1/review_moderation_log`, {
        method: 'POST',
        headers: supabaseHeaders(config.key, 'return=minimal'),
        body: JSON.stringify({
          review_id: reviewId,
          action: 'delete',
          previous_status: previousStatus,
          new_status: 'deleted',
          admin_note: note ?? current.review_text.slice(0, 120),
        }),
      })

      const deleteRes = await fetch(`${config.url}/rest/v1/service_reviews?id=eq.${reviewId}`, {
        method: 'DELETE',
        headers: supabaseHeaders(config.key, 'return=minimal'),
      })

      if (!deleteRes.ok) {
        return res.status(500).json({ error: 'Failed to delete review' })
      }

      return res.status(200).json({ ok: true, deleted: true })
    }

    const statusMap: Record<string, string> = {
      approve: 'approved',
      hide: 'hidden',
      remove: 'removed',
      restore: 'approved',
    }
    const newStatus = statusMap[action]
    if (!newStatus) {
      return res.status(400).json({ error: 'Invalid action' })
    }

    const patchRes = await fetch(`${config.url}/rest/v1/service_reviews?id=eq.${reviewId}`, {
      method: 'PATCH',
      headers: supabaseHeaders(config.key, 'return=minimal'),
      body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() }),
    })

    if (!patchRes.ok) {
      return res.status(500).json({ error: 'Failed to update review' })
    }

    await fetch(`${config.url}/rest/v1/review_moderation_log`, {
      method: 'POST',
      headers: supabaseHeaders(config.key, 'return=minimal'),
      body: JSON.stringify({
        review_id: reviewId,
        action,
        previous_status: previousStatus,
        new_status: newStatus,
        admin_note: note,
      }),
    })

    if (action === 'approve' && req.body?.report_id && UUID_RE.test(String(req.body.report_id))) {
      await fetch(`${config.url}/rest/v1/review_reports?id=eq.${req.body.report_id}`, {
        method: 'PATCH',
        headers: supabaseHeaders(config.key, 'return=minimal'),
        body: JSON.stringify({ status: 'reviewed' }),
      })
    }

    return res.status(200).json({ ok: true, status: newStatus })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
