const ADMIN_KEY = process.env.ADMIN_KEY ?? process.env.VITE_ADMIN_KEY ?? ''

function periodStart(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

function pct(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 1000) / 10
}

export default async function handler(
  req: { method?: string; query?: Record<string, string | string[] | undefined>; headers?: Record<string, string | undefined> },
  res: {
    status: (code: number) => { json: (body: unknown) => void }
  },
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers?.['x-admin-key'] ?? req.headers?.['X-Admin-Key']
  if (!ADMIN_KEY || authHeader !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return res.status(503).json({ error: 'Database not configured' })
  }

  const daysRaw = req.query?.days
  const days = typeof daysRaw === 'string' ? Math.min(365, Math.max(7, Number(daysRaw) || 30)) : 30
  const since = periodStart(days)
  const prevSince = periodStart(days * 2)

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }

  async function fetchEvents(filter: string) {
    const res = await fetch(
      `${url}/rest/v1/analytics_events?select=visitor_id,session_id,event_type,audience_type,county,town,properties,created_at&created_at=gte.${encodeURIComponent(filter)}&order=created_at.desc&limit=50000`,
      { headers },
    )
    if (!res.ok) return []
    return (await res.json()) as Array<{
      visitor_id: string
      session_id: string
      event_type: string
      audience_type: string | null
      county: string | null
      town: string | null
      properties: Record<string, unknown>
      created_at: string
    }>
  }

  const [currentEvents, previousEvents, servicesRes] = await Promise.all([
    fetchEvents(since),
    fetchEvents(prevSince),
    fetch(`${url}/rest/v1/services?select=id,category,county,verification_status,source&source=neq.demo`, {
      headers,
    }),
  ])

  const services = servicesRes.ok
    ? ((await servicesRes.json()) as Array<{ id: string; category: string; county: string }>)
    : []

  const prevOnly = previousEvents.filter((e) => e.created_at < since)

  function summarize(events: typeof currentEvents) {
    const visitors = new Set<string>()
    const sessions = new Set<string>()
    const audienceCounts: Record<string, number> = {}
    let audienceKnown = 0
    let searches = 0
    let serviceViews = 0
    let interactions = 0
    const categoryViews: Record<string, number> = {}
    const audienceCategory: Record<string, Record<string, number>> = {}
    const countyVisitors: Record<string, Set<string>> = {}
    const countyAudience: Record<string, Record<string, number>> = {}
    const professionalVisitors = new Set<string>()

    const PROFESSIONAL = new Set([
      'healthcare_professional',
      'social_worker',
      'education_professional',
      'charity_community',
    ])

    for (const e of events) {
      visitors.add(e.visitor_id)
      sessions.add(e.session_id)

      if (e.audience_type) {
        audienceCounts[e.audience_type] = (audienceCounts[e.audience_type] ?? 0) + 1
        if (e.audience_type !== 'prefer_not_to_say') audienceKnown++
        if (PROFESSIONAL.has(e.audience_type)) professionalVisitors.add(e.visitor_id)
      }

      if (e.county) {
        countyVisitors[e.county] ??= new Set()
        countyVisitors[e.county].add(e.visitor_id)
        if (e.audience_type) {
          countyAudience[e.county] ??= {}
          countyAudience[e.county][e.audience_type] =
            (countyAudience[e.county][e.audience_type] ?? 0) + 1
        }
      }

      if (e.event_type === 'SEARCH_PERFORMED') searches++
      if (e.event_type === 'SERVICE_VIEWED') serviceViews++
      if (
        [
          'SERVICE_WEBSITE_CLICKED',
          'SERVICE_PHONE_CLICKED',
          'SERVICE_DIRECTIONS_CLICKED',
          'SERVICE_SHARED',
          'FAVOURITE_ADDED',
        ].includes(e.event_type)
      ) {
        interactions++
      }

      if (e.event_type === 'CATEGORY_VIEWED' && e.properties?.category) {
        const cat = String(e.properties.category)
        categoryViews[cat] = (categoryViews[cat] ?? 0) + 1
      }

      if (e.event_type === 'SERVICE_VIEWED' && e.audience_type && e.properties?.category) {
        const aud = e.audience_type
        const cat = String(e.properties.category)
        audienceCategory[aud] ??= {}
        audienceCategory[aud][cat] = (audienceCategory[aud][cat] ?? 0) + 1
      }
    }

    const returningVisitors = new Set<string>()
    const firstSeen = new Map<string, string>()
    for (const e of events) {
      const prev = firstSeen.get(e.visitor_id)
      if (!prev) firstSeen.set(e.visitor_id, e.created_at)
      else if (prev !== e.created_at) returningVisitors.add(e.visitor_id)
    }

    return {
      totalVisitors: visitors.size,
      totalSessions: sessions.size,
      returningVisitors: returningVisitors.size,
      searches,
      serviceViews,
      interactions,
      audienceCounts,
      audienceKnownVisitors: audienceKnown,
      professionalVisitors: professionalVisitors.size,
      categoryViews,
      audienceCategory,
      countyVisitors: Object.fromEntries(
        Object.entries(countyVisitors).map(([k, v]) => [k, v.size]),
      ),
      countyAudience,
    }
  }

  const current = summarize(currentEvents)
  const previous = summarize(prevOnly)

  const audienceBreakdown = Object.entries(current.audienceCounts)
    .map(([id, count]) => ({
      id,
      count,
      pctOfKnown: pct(count, current.audienceKnownVisitors || 1),
      pctOfTotal: pct(count, current.totalVisitors || 1),
    }))
    .sort((a, b) => b.count - a.count)

  const servicesByCounty: Record<string, number> = {}
  const servicesByCategory: Record<string, number> = {}
  for (const s of services) {
    if (s.county) servicesByCounty[s.county] = (servicesByCounty[s.county] ?? 0) + 1
    if (s.category) servicesByCategory[s.category] = (servicesByCategory[s.category] ?? 0) + 1
  }

  const countiesCovered = Object.keys(servicesByCounty).length

  return res.status(200).json({
    periodDays: days,
    hasData: currentEvents.length > 0,
    overview: {
      services: services.length,
      visitors: current.totalVisitors,
      sessions: current.totalSessions,
      returningVisitors: current.returningVisitors,
      serviceViews: current.serviceViews,
      searches: current.searches,
      interactions: current.interactions,
      countiesCovered,
      countiesTotal: 32,
    },
    audience: {
      breakdown: audienceBreakdown,
      knownCount: current.audienceKnownVisitors,
      unansweredCount: Math.max(0, current.totalVisitors - current.audienceKnownVisitors),
      professionalUsage: {
        count: current.professionalVisitors,
        pctOfKnown: pct(current.professionalVisitors, current.audienceKnownVisitors || 1),
        growthPct:
          previous.professionalVisitors > 0
            ? pct(
                current.professionalVisitors - previous.professionalVisitors,
                previous.professionalVisitors,
              )
            : null,
      },
    },
    geography: {
      byCounty: Object.entries(current.countyVisitors)
        .map(([county, visitors]) => ({
          county,
          visitors,
          audience: current.countyAudience[county] ?? {},
          servicesListed: servicesByCounty[county] ?? 0,
        }))
        .sort((a, b) => b.visitors - a.visitors),
    },
    engagement: {
      categoryViews: current.categoryViews,
      audienceCategory: current.audienceCategory,
      servicesByCategory,
    },
    trends: {
      visitorsGrowthPct:
        previous.totalVisitors > 0
          ? pct(current.totalVisitors - previous.totalVisitors, previous.totalVisitors)
          : null,
      sessionsGrowthPct:
        previous.totalSessions > 0
          ? pct(current.totalSessions - previous.totalSessions, previous.totalSessions)
          : null,
    },
    recent24h: summarize(
      currentEvents.filter(
        (e) => e.created_at >= periodStart(1),
      ),
    ),
  })
}
