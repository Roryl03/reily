import { forwardRef, type ReactNode } from 'react'
import { getCategoryIcon, ReilyIconGlyph } from '@/components/icons'
import type { ReilyColorVariant } from '@/components/icons'
import { CommunityBadge, OpenStatusBadge, ServiceBadges } from '@/components/services/ServiceBadges'
import { enrichService } from '@/lib/filters'
import { SHARE_IMAGE_PREVIEW_SIZE } from '@/lib/generateShareImage'
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
  logoSrc: string
  className?: string
}

export const ServiceShareCard = forwardRef<HTMLDivElement, ServiceShareCardProps>(
  function ServiceShareCard({ service, imageSrc, logoSrc, className }, ref) {
    const enriched = enrichService(service)
    const status = formatOpenStatus(enriched.openStatus)
    const categoryIcon = getCategoryIcon(service.category)

    return (
      <div
        ref={ref}
        className={cn('box-border overflow-hidden bg-[#FAF9F5]', className)}
        style={{
          width: SHARE_IMAGE_PREVIEW_SIZE,
          height: SHARE_IMAGE_PREVIEW_SIZE,
          padding: '20px 24px',
          fontFamily: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div className="flex flex-col items-center text-center">
          <p
            className="font-decorative text-3xl text-hunter leading-none"
            style={{ fontFamily: '"Caveat", cursive' }}
          >
            Now on
          </p>
          <img
            src={logoSrc}
            alt="Ask Reilly"
            className="mt-2 block h-14 w-auto max-w-[min(100%,18rem)] object-contain"
            decoding="sync"
          />
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl bg-white">
          <img
            src={imageSrc}
            alt=""
            className="block h-24 w-full object-cover"
            decoding="sync"
          />
          <div className="space-y-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage-100">
                  <ReilyIconGlyph
                    name={categoryIcon.name}
                    className={cn('h-4 w-4', CATEGORY_GLYPH_COLOR[categoryIcon.variant])}
                  />
                </span>
                <div className="min-w-0 text-left">
                  <h3 className="truncate text-base font-semibold text-sage-900">{service.name}</h3>
                  <p className="truncate text-xs text-sage-600">{service.category}</p>
                </div>
              </div>
              {service.source === 'community' && <CommunityBadge />}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-sage-600">
              <span className="flex items-center gap-1">
                <ReilyIconGlyph name="location" className="h-3.5 w-3.5 text-sage-700" />
                {service.town}
              </span>
              <OpenStatusBadge status={status} />
            </div>

            <p className="line-clamp-2 text-xs leading-snug text-sage-700">
              {service.shortDescription}
            </p>
            <ServiceBadges features={service.accessibilityFeatures} limit={3} />
          </div>
        </div>

        {(service.phone || service.website || service.pricing) && (
          <div className="mt-2 space-y-1 text-xs text-sage-700">
            {service.phone && <CompactDetail label="Phone">{service.phone}</CompactDetail>}
            {service.website && (
              <CompactDetail label="Website">
                {service.website.replace(/^https?:\/\//, '')}
              </CompactDetail>
            )}
            {service.pricing && <CompactDetail label="Pricing">{service.pricing}</CompactDetail>}
          </div>
        )}

        <p className="mt-3 text-center text-[10px] text-sage-500">
          Find more on Ask Reilly · askreillyni.com
        </p>
      </div>
    )
  },
)

function CompactDetail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="truncate">
      <span className="font-semibold text-sage-500">{label}: </span>
      <span className="text-sage-800">{children}</span>
    </p>
  )
}
