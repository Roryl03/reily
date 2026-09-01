import { Phone } from 'lucide-react'
import { formatPhoneLink } from '@/lib/utils'
import type { SupportResource } from '@/types/supportResource'

export function SupportQuickHelp({
  resources,
  onViewHelplines,
}: {
  resources: SupportResource[]
  onViewHelplines: () => void
}) {
  const quick = resources
    .filter((r) => r.isUrgent || (r.isHelpline && r.featured))
    .slice(0, 3)

  if (quick.length === 0) return null

  return (
    <section aria-labelledby="quick-help-heading" className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 id="quick-help-heading" className="text-[20px] font-semibold tracking-tight text-sage-900">
          Need someone to talk to?
        </h2>
        <button
          type="button"
          onClick={onViewHelplines}
          className="text-[15px] font-semibold text-blue-muted touch-scale rounded-lg px-1 focus-ring"
        >
          All
        </button>
      </div>

      <div className="ios-group">
        {quick.map((r) => (
          <a
            key={r.id}
            href={r.phone ? formatPhoneLink(r.phone) : undefined}
            className="ios-row touch-scale active:bg-blue-muted-light/30"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-medium text-sage-900 truncate">{r.name}</p>
              {r.hours && <p className="text-[13px] text-sage-500 truncate">{r.hours}</p>}
            </div>
            {r.phone && (
              <span className="flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-blue-muted">
                <Phone className="h-4 w-4" aria-hidden />
                {r.phone}
              </span>
            )}
          </a>
        ))}
      </div>
    </section>
  )
}
