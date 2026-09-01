import { Phone } from 'lucide-react'
import { ReilyIcon } from '@/components/icons'
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
    <section aria-labelledby="quick-help-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ReilyIcon name="support-services" size="sm" variant="blue" />
          <h2 id="quick-help-heading" className="font-medium text-sage-900">
            Need someone to talk to?
          </h2>
        </div>
        <button
          type="button"
          onClick={onViewHelplines}
          className="text-sm font-medium text-blue-muted hover:text-sage-800 focus-ring rounded px-1"
        >
          All helplines
        </button>
      </div>

      <div className="rounded-2xl border border-blue-muted/20 bg-blue-muted-light/60 p-3 space-y-2">
        {quick.map((r) => (
          <a
            key={r.id}
            href={r.phone ? formatPhoneLink(r.phone) : undefined}
            className="flex items-center justify-between gap-3 rounded-xl bg-white/90 px-4 py-3 transition hover:bg-white focus-ring min-h-11"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-sage-900 truncate">{r.name}</p>
              {r.hours && <p className="text-xs text-sage-500 truncate">{r.hours}</p>}
            </div>
            {r.phone && (
              <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-muted">
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
