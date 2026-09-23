import { formatTopPicksMonth } from '@/lib/topPicks'
import { cn } from '@/lib/utils'

export function TopPickBadge({
  rank,
  year,
  month,
  scope,
  className,
}: {
  rank: number
  year: number
  month: number
  scope: 'near' | 'across'
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex flex-col rounded-xl border border-gold/40 bg-gradient-to-br from-gold/10 to-cream-200 px-4 py-3',
        className,
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
        Ask Reilly Top Pick
      </span>
      <span className="font-display text-lg text-sage-900">{formatTopPicksMonth(year, month)}</span>
      <span className="text-sm text-sage-600">
        #{rank} {scope === 'near' ? 'Near You' : 'Across Ask Reilly'}
      </span>
    </div>
  )
}
