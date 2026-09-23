import reviewSubmit from './_handlers/reviews/submit.js'
import reviewList from './_handlers/reviews/list.js'
import reviewSummary from './_handlers/reviews/summary.js'
import reviewHelpful from './_handlers/reviews/helpful.js'
import reviewReport from './_handlers/reviews/report.js'

const routes: Record<string, typeof reviewSubmit> = {
  submit: reviewSubmit,
  list: reviewList,
  summary: reviewSummary,
  helpful: reviewHelpful,
  report: reviewReport,
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
  const action = String(req.query?.action ?? '')
  const route = routes[action]
  if (!route) return res.status(404).json({ error: 'Not found' })
  return route(req, res)
}
