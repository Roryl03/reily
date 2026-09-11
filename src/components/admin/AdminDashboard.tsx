import { MapPin, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { AdminStats } from '@/lib/adminStats'
import { isSupabaseEnabled } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AdminDashboard({
  stats,
  onRefreshMapLocations,
}: {
  stats: AdminStats
  onRefreshMapLocations?: () => Promise<{ updated: number; failed: number; skipped: number }>
}) {
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<string | null>(null)

  const handleRefresh = async () => {
    if (!onRefreshMapLocations) return
    setRefreshing(true)
    setRefreshResult(null)
    try {
      const result = await onRefreshMapLocations()
      setRefreshResult(
        `Updated ${result.updated} listing${result.updated === 1 ? '' : 's'}` +
          (result.failed ? ` · ${result.failed} failed` : '') +
          (result.skipped ? ` · ${result.skipped} mobile/pop-up skipped` : ''),
      )
    } catch {
      setRefreshResult('Could not refresh map locations. Try again in a moment.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Live on Ask Reilly" value={stats.totalLive} highlight />
        <StatCard label="Pending requests" value={stats.pendingRequests} />
      </div>

      {isSupabaseEnabled && onRefreshMapLocations && (
        <div className="ios-card space-y-3 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hunter-light">
              <MapPin className="h-5 w-5 text-hunter" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl text-sage-900">Map & location data</h2>
              <p className="mt-1 text-sm leading-relaxed text-sage-600">
                Re-format postcodes, towns, and addresses, then re-place every listing on the map
                from its street address. Run this after fixing data in Supabase.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            disabled={refreshing}
            onClick={handleRefresh}
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} aria-hidden />
            {refreshing ? 'Refreshing map pins…' : 'Refresh all map locations'}
          </Button>
          {refreshResult && <p className="text-sm text-sage-700">{refreshResult}</p>}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownCard title="By county" entries={stats.byCounty} emptyMessage="No county data yet." />
        <BreakdownCard
          title="By category"
          entries={stats.byCategory}
          emptyMessage="No categories yet."
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'ios-card p-6',
        highlight && 'border-hunter/20 bg-hunter-light/30',
      )}
    >
      <p className="text-sm font-medium text-sage-600">{label}</p>
      <p className="mt-2 font-display text-4xl text-sage-900">{value}</p>
    </div>
  )
}

function BreakdownCard({
  title,
  entries,
  emptyMessage,
}: {
  title: string
  entries: { label: string; count: number }[]
  emptyMessage: string
}) {
  const max = entries[0]?.count ?? 1

  return (
    <div className="ios-card p-5">
      <h2 className="font-display text-xl text-sage-900">{title}</h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-sage-600">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map(({ label, count }) => (
            <li key={label}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-sage-800">{label}</span>
                <span className="tabular-nums text-sage-600">{count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sage-100">
                <div
                  className="h-full rounded-full bg-hunter transition-all"
                  style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
