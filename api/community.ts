import moderation from './_handlers/community/moderation.js'
import communityInsights from './_handlers/community/insights.js'

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
  if (action === 'moderation') return moderation(req, res)
  if (action === 'insights') return communityInsights(req, res)
  return res.status(404).json({ error: 'Not found' })
}
