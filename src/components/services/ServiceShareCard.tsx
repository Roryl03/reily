import { forwardRef, type ReactNode } from 'react'
import { getCategoryIcon, ReilyIconGlyph } from '@/components/icons'
import type { ReilyColorVariant } from '@/components/icons'
import { ASK_REILLY_LOGO_SRC, AskReillyLogo } from '@/components/icons/AskReillyLogo'
import { CommunityBadge, OpenStatusBadge, ServiceBadges } from '@/components/services/ServiceBadges'
import { Card, CardContent } from '@/components/ui/card'
import { enrichService } from '@/lib/filters'
import { formatOpenStatus } from '@/lib/openingHours'
import { cn } from '@/lib/utils'
import type { Service } from '@/types/service'

const CATEGORY_GLYPH_COLOR: Record<ReilyColorVariant, string> = {
  sage: 'text-hunter',
  blue: 'text-hunter',
  terracotta: 'text-terracotta',
  gold: 'text-gold',
  lavender: 'text-lavender',
  cream: 'text-sage-700',
}

interface ServiceShareCardProps {
  service: Service
  imageSrc: string
  className?: string
}

export const ServiceShareCard = forwardRef<HTMLDivElement, ServiceShareCardProps>(
  function ServiceShareCard({ service, imageSrc, className }, ref) {
    const enriched = enrichService(service)
    const status = formatOpenStatus(enriched.openStatus)
    const categoryIcon = getCategoryIcon(service.category)

    return (
      <div
        ref={ref}
        className={cn('w-[540px] bg-cream-50 px-8 py-10', className)}
        style={{ fontFamily: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif' }}
      >
        <div className="flex flex-col items-center text-center">
          <p
            className="font-decorative text-4xl text-hunter leading-none"
            style={{ fontFamily: '"Caveat", cursive' }}
          >
            Now on
          </p>
          <AskReillyLogo size="lg" className="mt-3 mx-auto object-center" />
        </div>

        <Card className="mt-8 overflow-hidden border-border shadow-[var(--shadow-card)]">
          <div className="relative">
            <img
              src={imageSrc}
              alt=""
              className="h-44 w-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sage-200 bg-sage-100 shadow-sm">
                  <ReilyIconGlyph
                    name={categoryIcon.name}
                    className={cn('h-5 w-5', CATEGORY_GLYPH_COLOR[categoryIcon.variant])}
                  />
                </span>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-sage-900">{service.name}</h3>
                  <p className="text-sm text-sage-600">{service.category}</p>
                </div>
              </div>
              {service.source === 'community' && <CommunityBadge />}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-sage-600">
              <span className="flex items-center gap-1.5">
                <ReilyIconGlyph name="location" className="h-4 w-4 text-sage-700" />
                {service.town}
              </span>
              <OpenStatusBadge status={status} />
            </div>

            <p className="text-sm text-sage-700">{service.shortDescription}</p>
            <ServiceBadges features={service.accessibilityFeatures} limit={99} />
          </CardContent>
        </Card>

        <div className="mt-6 space-y-4 text-sm text-sage-700">
          {service.phone && <DetailRow label="Phone">{service.phone}</DetailRow>}

          {service.website && (
            <DetailRow label="Website">
              {service.website.replace(/^https?:\/\//, '')}
            </DetailRow>
          )}

          {service.email && <DetailRow label="Email">{service.email}</DetailRow>}

          {service.pricing && <DetailRow label="Pricing">{service.pricing}</DetailRow>}

          {service.quietHours && service.quietHours.length > 0 && (
            <DetailRow label="Quiet hours">
              <ul className="mt-1 space-y-0.5">
                {service.quietHours.map((q, i) => (
                  <li key={i}>
                    {q.label ?? 'Quiet hour'}: {q.day} {q.start}–{q.end}
                  </li>
                ))}
              </ul>
            </DetailRow>
          )}

          {service.senSessions && service.senSessions.length > 0 && (
            <DetailRow label="SEN sessions">
              <ul className="mt-1 space-y-0.5">
                {service.senSessions.map((s, i) => (
                  <li key={i}>
                    {s.label}: {s.day} {s.start}–{s.end}
                  </li>
                ))}
              </ul>
            </DetailRow>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-sage-500">
          Find more on Ask Reilly · askreillyni.com
        </p>

        {/* Preload logo for html-to-image capture */}
        <img src={ASK_REILLY_LOGO_SRC} alt="" className="hidden" aria-hidden />
      </div>
    )
  },
)

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">{label}</p>
      <div className="mt-0.5 text-sage-800">{children}</div>
    </div>
  )
}
