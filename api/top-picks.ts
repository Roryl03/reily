import topPicks from './_handlers/top-picks/index.js'
import topPicksArchive from './_handlers/top-picks/archive.js'
import topPicksBadges from './_handlers/top-picks/badges.js'

export default async function handler(
  req: {
    method?: string
    query?: Record<string, string | string[] | undefined>
    body?: Record<string, unknown>
    headers?: Record<string, string | undefined>
  },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  const action = String(req.query?.action ?? 'index')
  if (action === 'archive') return topPicksArchive(req, res)
  if (action === 'badges') return topPicksBadges(req, res)
  return topPicks(req, res)
}
