import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TopPickCard } from '@/components/top-picks/TopPickCard'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { track } from '@/lib/analytics'
import {
  fetchTopPicks,
  fetchTopPicksArchive,
  formatTopPicksMonth,
  type TopPickItem,
  type TopPicksArchivePeriod,
} from '@/lib/topPicks'
import { cn } from '@/lib/utils'

type Scope = 'near' | 'across'

export function TopPicksPage() {
  const { location } = useApp()
  const [scope, setScope] = useState<Scope>('across')
  const [items, setItems] = useState<TopPickItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [archive, setArchive] = useState<TopPicksArchivePeriod[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<{ year: number; month: number } | null>(null)

  const now = new Date()
  const displayYear = selectedPeriod?.year ?? now.getUTCFullYear()
  const displayMonth = selectedPeriod?.month ?? now.getUTCMonth() + 1
  const isCurrentMonth = !selectedPeriod

  useEffect(() => {
    track('TOP_PICKS_VIEWED', { scope })
  }, [scope])

  useEffect(() => {
    void fetchTopPicksArchive(scope).then(setArchive)
  }, [scope])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    void fetchTopPicks({
      scope,
      location,
      year: displayYear,
      month: displayMonth,
      archive: !isCurrentMonth,
    })
      .then((data) => {
        if (!cancelled) setItems(data.items)
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
  }, [scope, location, displayYear, displayMonth, isCurrentMonth])

  const needsLocation = scope === 'near' && !location

  return (
    <div className="mobile-page space-y-6 pb-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-sage-900">Ask Reilly Top Picks</h1>
        <p className="text-sage-700 leading-relaxed">
          <strong>The services our community has been recommending this month.</strong>
        </p>
        <p className="text-sm text-sage-600">
          Rankings are based on community recommendations, not editorial choices by Ask Reilly.
          Experiences shared by families help others discover places worth trying.
        </p>
      </header>

      <div className="flex gap-1 rounded-xl bg-sage-100 p-1" role="tablist" aria-label="Top Picks views">
        <button
          type="button"
          role="tab"
          aria-selected={scope === 'near'}
          onClick={() => setScope('near')}
          className={cn(
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium focus-ring',
            scope === 'near' ? 'bg-white text-sage-900 shadow-sm' : 'text-sage-600',
          )}
        >
          Near You
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={scope === 'across'}
          onClick={() => setScope('across')}
          className={cn(
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium focus-ring',
            scope === 'across' ? 'bg-white text-sage-900 shadow-sm' : 'text-sage-600',
          )}
        >
          Across Ask Reilly
        </button>
      </div>

      {needsLocation ? (
        <div className="ios-card space-y-3 p-5">
          <p className="font-semibold text-sage-900">Set your location to see Top Picks near you</p>
          <p className="text-sm text-sage-600">
            Ask Reilly uses your chosen town or area. We won&apos;t ask for your exact location again.
          </p>
          <Button asChild>
            <Link to="/profile">Set location in Profile</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl text-sage-900">
              Top 10 {scope === 'near' ? 'Near You' : 'Across Ask Reilly'},{' '}
              {formatTopPicksMonth(displayYear, displayMonth)}
            </h2>
            {archive.length > 0 && (
              <select
                className="rounded-lg border border-sage-200 bg-white px-3 py-2 text-sm focus-ring"
                value={selectedPeriod ? `${selectedPeriod.year}-${selectedPeriod.month}` : 'current'}
                onChange={(e) => {
                  if (e.target.value === 'current') {
                    setSelectedPeriod(null)
                    return
                  }
                  const [year, month] = e.target.value.split('-').map(Number)
                  setSelectedPeriod({ year, month })
                }}
                aria-label="Previous Top Picks"
              >
                <option value="current">This month (live)</option>
                {archive.map((period) => (
                  <option key={`${period.year}-${period.month}`} value={`${period.year}-${period.month}`}>
                    {formatTopPicksMonth(period.year, period.month)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {loading ? (
            <p className="text-sage-600 py-8 text-center">Loading Top Picks…</p>
          ) : error ? (
            <p className="text-error py-8 text-center">{error}</p>
          ) : items.length === 0 ? (
            <div className="ios-card p-6 text-center space-y-2">
              <p className="font-semibold text-sage-900">No Top Picks yet this month</p>
              <p className="text-sm text-sage-600">
                As families recommend services, rankings will appear here. Visit a service and share
                your experience to help build the community leaderboard.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <TopPickCard key={`${item.rank}-${item.service?.id}`} item={item} />
              ))}
            </div>
          )}

          <p className="text-xs text-sage-500 leading-relaxed">
            Top Picks Score combines recommendation confidence (Wilson 95% lower bound) with
            positive recommendation volume and community review quality. Paid promotion never
            influences these rankings.
          </p>
        </>
      )}
    </div>
  )
}
