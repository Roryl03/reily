import moderation from './_handlers/community/moderation'
import communityInsights from './_handlers/community/insights'
import recommendationStats from './_handlers/recommendations/stats'
import recommendationVote from './_handlers/recommendations/vote'
import reviewSubmit from './_handlers/reviews/submit'
import reviewList from './_handlers/reviews/list'
import reviewSummary from './_handlers/reviews/summary'
import reviewHelpful from './_handlers/reviews/helpful'
import reviewReport from './_handlers/reviews/report'
import topPicks from './_handlers/top-picks/index'
import topPicksArchive from './_handlers/top-picks/archive'
import topPicksBadges from './_handlers/top-picks/badges'

type Handler = (
  req: {
    method?: string
    query?: Record<string, string | string[] | undefined>
    body?: Record<string, unknown>
    headers?: Record<string, string | undefined>
  },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) => Promise<unknown> | unknown

const routes: Record<string, Handler> = {
  'recommendations/stats': recommendationStats,
  'recommendations/vote': recommendationVote,
  'reviews/submit': reviewSubmit,
  'reviews/list': reviewList,
  'reviews/summary': reviewSummary,
  'reviews/helpful': reviewHelpful,
  'reviews/report': reviewReport,
  'top-picks': topPicks,
  'top-picks/archive': topPicksArchive,
  'top-picks/badges': topPicksBadges,
  'community/moderation': moderation,
  'community/insights': communityInsights,
}

export default async function handler(
  req: {
    method?: string
    query?: Record<string, string | string[] | undefined>
    body?: Record<string, unknown>
    headers?: Record<string, string | undefined>
    url?: string
  },
  res: { status: (code: number) => { json: (body: unknown) => void } },
) {
  const rawPath = req.query?.path
  const segments = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath ?? '')
  const route = routes[segments]

  if (!route) {
    return res.status(404).json({ error: 'Not found' })
  }

  return route(req, res)
}
