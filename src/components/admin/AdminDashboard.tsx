import type { AdminStats } from '@/lib/adminStats'
import { cn } from '@/lib/utils'

export function AdminDashboard({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Live on Ask Reilly" value={stats.totalLive} highlight />
        <StatCard label="Pending requests" value={stats.pendingRequests} />
      </div>

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
