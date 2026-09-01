import { ExternalLink, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPhoneLink, formatWebsiteUrl } from '@/lib/utils'
import { SUPPORT_COVERAGE, SUPPORT_TOPICS, sectionLabel, type SupportResource } from '@/types/supportResource'

function topicLabel(id: string) {
  return SUPPORT_TOPICS.find((t) => t.id === id)?.label ?? id
}

function coverageLabel(id: string) {
  return SUPPORT_COVERAGE.find((c) => c.id === id)?.label ?? id
}

export function SupportResourceCard({
  resource,
  showSection = true,
  compact = false,
}: {
  resource: SupportResource
  showSection?: boolean
  compact?: boolean
}) {
  if (compact) {
    return (
      <Link
        to={`/support/${resource.id}`}
        className="flex items-center gap-3 rounded-2xl border border-sage-100 bg-white p-4 shadow-sm transition hover:border-sage-200 hover:shadow-md focus-ring min-h-[4.5rem]"
      >
        <ReilyIcon
          name={resource.isHelpline ? 'support-services' : 'community-groups'}
          size="sm"
          variant={resource.isHelpline ? 'terracotta' : 'blue'}
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sage-900 leading-snug">{resource.name}</p>
          <p className="mt-0.5 text-sm text-sage-600 line-clamp-2">{resource.shortDescription}</p>
          {resource.phone && (
            <p className="mt-1 text-sm font-medium text-blue-muted">{resource.phone}</p>
          )}
        </div>
        {resource.isHelpline && (
          <Badge variant="secondary" className="shrink-0 hidden sm:inline-flex">
            Helpline
          </Badge>
        )}
      </Link>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <ReilyIcon name="support-services" size="md" variant="blue" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-start gap-2">
              <h3 className="text-lg font-semibold text-sage-900 leading-tight">{resource.name}</h3>
              {resource.isUrgent && (
                <Badge variant="accent" className="bg-terracotta-light text-terracotta">
                  Urgent help
                </Badge>
              )}
              {resource.verificationStatus === 'verified' && resource.source === 'leaflet' && (
                <Badge variant="success" className="bg-sage-100 text-sage-700 border-sage-200">
                  NI directory
                </Badge>
              )}
              {resource.verificationStatus === 'pending' && (
                <Badge variant="outline">Verify before use</Badge>
              )}
            </div>
            <p className="text-sm text-sage-600">{resource.shortDescription}</p>
            {showSection && (
              <p className="text-xs text-blue-muted font-medium">{sectionLabel(resource.section)}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {resource.topics.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary">
              {topicLabel(t)}
            </Badge>
          ))}
          {resource.isHelpline && <Badge variant="default">Helpline</Badge>}
          {resource.isFree && <Badge variant="success">Free</Badge>}
        </div>

        <div className="space-y-2 text-sm text-sage-700">
          {resource.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-blue-muted" aria-hidden />
              <a
                href={formatPhoneLink(resource.phone)}
                className="font-semibold text-sage-900 hover:text-sage-600 focus-ring rounded"
              >
                {resource.phone}
              </a>
              {resource.phoneLabel && (
                <span className="text-sage-500">· {resource.phoneLabel}</span>
              )}
            </p>
          )}
          {resource.secondaryPhone && (
            <p className="flex items-center gap-2 pl-6">
              <a href={formatPhoneLink(resource.secondaryPhone)} className="font-medium hover:text-sage-600 focus-ring rounded">
                {resource.secondaryPhone}
              </a>
            </p>
          )}
          {resource.mobile && (
            <p className="flex items-center gap-2">
              <span className="text-sage-500">Mobile:</span>
              <a href={formatPhoneLink(resource.mobile)} className="font-medium hover:text-sage-600 focus-ring rounded">
                {resource.mobile}
              </a>
            </p>
          )}
          {resource.provider && (
            <p className="text-sage-600"><span className="text-sage-500">Provider:</span> {resource.provider}</p>
          )}
          {resource.hours && <p className="text-sage-600">{resource.hours}</p>}
          {resource.coverage.length > 0 && (
            <p className="text-sage-600">
              Covers: {resource.coverage.map(coverageLabel).join(', ')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {resource.phone && (
            <Button asChild size="sm">
              <a href={formatPhoneLink(resource.phone)}>
                <Phone className="h-4 w-4" />
                Call
              </a>
            </Button>
          )}
          {resource.website && (
            <Button asChild size="sm" variant="secondary">
              <a href={formatWebsiteUrl(resource.website)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Website
              </a>
            </Button>
          )}
          {resource.email && (
            <Button asChild size="sm" variant="secondary">
              <a href={`mailto:${resource.email}`}>
                <Mail className="h-4 w-4" />
                Email
              </a>
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <Link to={`/support/${resource.id}`}>Full details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SupportHelplineStrip({ resources }: { resources: SupportResource[] }) {
  const urgent = resources.filter((r) => r.isUrgent || (r.isHelpline && r.featured))

  if (urgent.length === 0) return null

  return (
    <div className="rounded-2xl border border-terracotta/25 bg-terracotta-light p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ReilyIcon name="support-services" size="sm" variant="terracotta" />
        <h2 className="font-semibold text-sage-900">Need to talk now?</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {urgent.slice(0, 4).map((r) => (
          <a
            key={r.id}
            href={r.phone ? formatPhoneLink(r.phone) : formatWebsiteUrl(r.website)}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm hover:shadow-md focus-ring min-h-11"
          >
            <span className="text-sm font-medium text-sage-800">{r.name}</span>
            {r.phone && <span className="text-sm font-bold text-terracotta">{r.phone}</span>}
          </a>
        ))}
      </div>
    </div>
  )
}
