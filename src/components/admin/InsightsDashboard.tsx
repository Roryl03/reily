import { useEffect, useState } from 'react'
import { AUDIENCE_OPTIONS } from '@/types/analytics'
import { fetchInsights, type InsightsData } from '@/lib/insightsClient'
import { cn } from '@/lib/utils'

const AUDIENCE_LABELS = Object.fromEntries(
  AUDIENCE_OPTIONS.map((o) => [o.id, o.label]),
) as Record<string, string>

const PERIODS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
  { days: 365, label: '12 months' },
]

export function InsightsDashboard() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<InsightsData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void fetchInsights(days)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [days])

  if (loading) {
    return <p className="text-sage-600 py-8 text-center">Loading insights…</p>
  }

  if (error) {
    return (
      <div className="ios-card p-5 space-y-2">
        <p className="font-semibold text-sage-900">Insights unavailable</p>
        <p className="text-sm text-sage-600">{error}</p>
        <p className="text-sm text-sage-500">
          Run <code className="text-xs bg-sage-100 px-1 rounded">supabase/analytics.sql</code> in
          Supabase and ensure analytics events are being collected.
        </p>
      </div>
    )
  }

  if (!data) return null

  const parentCarer = data.audience.breakdown.find((b) => b.id === 'parent_carer')
  const parentPct = parentCarer?.pctOfKnown ?? 0
  const proPct = data.audience.professionalUsage.pctOfKnown

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            type="button"
            onClick={() => setDays(p.days)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium touch-scale focus-ring',
              days === p.days
                ? 'bg-hunter text-white'
                : 'bg-sage-100 text-sage-700 hover:bg-sage-200',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!data.hasData && (
        <div className="ios-card border-l-4 border-l-gold p-5">
          <p className="font-semibold text-sage-900">No analytics data yet</p>
          <p className="mt-1 text-sm text-sage-600">
            Metrics will appear once visitors use Ask Reilly and events are stored. All figures
            below are real counts from your database — currently zero.
          </p>
        </div>
      )}

      <section>
        <h2 className="font-display text-2xl text-sage-900 mb-4">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Services listed" value={data.overview.services} />
          <MetricCard
            label={`Visitors — last ${data.periodDays} days`}
            value={data.overview.visitors}
            delta={data.trends.visitorsGrowthPct}
          />
          <MetricCard label="Sessions" value={data.overview.sessions} delta={data.trends.sessionsGrowthPct} />
          <MetricCard label="Returning visitors" value={data.overview.returningVisitors} />
          <MetricCard label="Service views" value={data.overview.serviceViews} />
          <MetricCard label="Searches" value={data.overview.searches} />
          <MetricCard label="Service interactions" value={data.overview.interactions} />
          <MetricCard
            label="Counties with listings"
            value={`${data.overview.countiesCovered} / ${data.overview.countiesTotal}`}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-sage-900 mb-1">Audience</h2>
        <p className="text-sm text-sage-600 mb-4">
          Known audience: {data.audience.knownCount} · Did not answer: {data.audience.unansweredCount}
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ios-card p-5 space-y-3">
            <h3 className="font-semibold text-sage-900">Breakdown</h3>
            {data.audience.breakdown.length === 0 ? (
              <p className="text-sm text-sage-600">No audience selections recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.audience.breakdown.map((row) => (
                  <li key={row.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-sage-800">
                        {AUDIENCE_LABELS[row.id] ?? row.id}
                      </span>
                      <span className="text-sage-600 tabular-nums">
                        {row.count} · {row.pctOfKnown}% known · {row.pctOfTotal}% all
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-sage-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-hunter"
                        style={{ width: `${Math.max(4, row.pctOfKnown)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ios-card p-5 space-y-3">
            <h3 className="font-semibold text-sage-900">Professional usage</h3>
            <p className="font-display text-4xl text-sage-900">{proPct}%</p>
            <p className="text-sm text-sage-600">of known visitors (health, social work, education, charity)</p>
            <p className="text-sm text-sage-700">
              {data.audience.professionalUsage.count} professional visitors
              {data.audience.professionalUsage.growthPct != null && (
                <span
                  className={cn(
                    'ml-2 font-medium',
                    data.audience.professionalUsage.growthPct >= 0
                      ? 'text-hunter'
                      : 'text-terracotta',
                  )}
                >
                  {data.audience.professionalUsage.growthPct >= 0 ? '+' : ''}
                  {data.audience.professionalUsage.growthPct}% vs previous period
                </span>
              )}
            </p>
            <p className="text-sm text-sage-600">
              Parent / Carer: {parentPct}% of known audience
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-sage-900 mb-4">Last 24 hours</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Sessions" value={data.recent24h.totalSessions} />
          <MetricCard label="Service views" value={data.recent24h.serviceViews} />
          <MetricCard label="Searches" value={data.recent24h.searches} />
          <MetricCard label="Interactions" value={data.recent24h.interactions} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-sage-900 mb-4">Audience × geography</h2>
        {data.geography.byCounty.length === 0 ? (
          <p className="text-sm text-sage-600">No geographic data yet.</p>
        ) : (
          <div className="space-y-4">
            {data.geography.byCounty.slice(0, 8).map((row) => (
              <div key={row.county} className="ios-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-sage-900">{row.county}</h3>
                  <span className="text-sm text-sage-600">
                    {row.visitors} visitors · {row.servicesListed} listed services
                  </span>
                </div>
                {Object.keys(row.audience).length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs text-sage-700">
                    {Object.entries(row.audience)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([id, count]) => (
                        <li key={id} className="rounded-full bg-sage-100 px-2 py-1">
                          {AUDIENCE_LABELS[id] ?? id}: {count}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl text-sage-900 mb-4">Observed demand vs coverage</h2>
        <p className="text-sm text-sage-600 mb-4">
          Compares Ask Reilly engagement with listed services — not population-wide demand.
        </p>
        <div className="ios-card overflow-x-auto p-5">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-sage-600 border-b border-sage-100">
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Views</th>
                <th className="pb-2 font-medium">Listed</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys({
                ...data.engagement.categoryViews,
                ...data.engagement.servicesByCategory,
              })
                .sort(
                  (a, b) =>
                    (data.engagement.categoryViews[b] ?? 0) -
                    (data.engagement.categoryViews[a] ?? 0),
                )
                .map((cat) => {
                  const views = data.engagement.categoryViews[cat] ?? 0
                  const listed = data.engagement.servicesByCategory[cat] ?? 0
                  const gap = views >= 10 && listed <= 2
                  return (
                    <tr key={cat} className="border-b border-sage-50 last:border-0">
                      <td className="py-2 pr-4 font-medium text-sage-800">
                        {cat}
                        {gap && (
                          <span className="ml-2 text-xs font-normal text-gold">
                            High demand / low coverage
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-sage-700">{views}</td>
                      <td className="py-2 tabular-nums text-sage-700">{listed}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  label,
  value,
  delta,
}: {
  label: string
  value: number | string
  delta?: number | null
}) {
  return (
    <div className="ios-card p-5">
      <p className="text-sm font-medium text-sage-600">{label}</p>
      <p className="mt-2 font-display text-3xl text-sage-900">{value}</p>
      {delta != null && (
        <p
          className={cn(
            'mt-1 text-xs font-medium',
            delta >= 0 ? 'text-hunter' : 'text-terracotta',
          )}
        >
          {delta >= 0 ? '+' : ''}
          {delta}% vs previous period
        </p>
      )}
    </div>
  )
}
