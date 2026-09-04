import { ExternalLink, Mail, Phone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getSupportResourceById } from '@/lib/supportStorage'
import { formatPhoneLink, formatWebsiteUrl } from '@/lib/utils'
import { SUPPORT_COVERAGE, SUPPORT_TOPICS, sectionLabel } from '@/types/supportResource'

export function SupportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const resource = id ? getSupportResourceById(id) : undefined

  if (!resource) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sage-600">Support service not found.</p>
        <Button asChild>
          <Link to="/support">Back to support directory</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" asChild className="pl-0">
        <Link to="/support">← Back to all support services</Link>
      </Button>

      <header className="space-y-4">
        <div className="flex items-start gap-4">
          <ReilyIcon name="support-services" size="lg" variant="blue" />
          <div>
            <h1 className="font-display text-3xl text-sage-900">{resource.name}</h1>
            <p className="text-sage-600 mt-1">{resource.shortDescription}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{sectionLabel(resource.section)}</Badge>
          {resource.topics.map((t) => (
            <Badge key={t} variant="secondary">
              {SUPPORT_TOPICS.find((x) => x.id === t)?.label}
            </Badge>
          ))}
          {resource.isHelpline && <Badge>Helpline</Badge>}
          {resource.isFree && <Badge variant="success">Free</Badge>}
          {resource.verificationStatus === 'verified' && (
            <Badge variant="success">NI support directory</Badge>
          )}
        </div>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sage-700 leading-relaxed">{resource.fullDescription}</p>

          {resource.ageFocus && (
            <p className="text-sm text-sage-600">
              <strong className="text-sage-800">Who it&apos;s for:</strong> {resource.ageFocus}
            </p>
          )}

          {resource.coverage.length > 0 && (
            <p className="text-sm text-sage-600">
              <strong className="text-sage-800">Coverage:</strong>{' '}
              {resource.coverage
                .map((c) => SUPPORT_COVERAGE.find((x) => x.id === c)?.label)
                .join(', ')}
            </p>
          )}

          {resource.provider && (
            <p className="text-sm text-sage-600">
              <strong className="text-sage-800">Provider:</strong> {resource.provider}
            </p>
          )}

          {resource.notes && (
            <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3">{resource.notes}</p>
          )}

          {resource.mobile && (
            <p className="text-sm text-sage-600">
              <strong className="text-sage-800">Mobile:</strong>{' '}
              <a href={formatPhoneLink(resource.mobile)} className="font-semibold">{resource.mobile}</a>
            </p>
          )}

          {resource.textService && (
            <p className="text-sm text-sage-600">
              <strong className="text-sage-800">Text:</strong> {resource.textService}
            </p>
          )}

          {resource.address && (
            <p className="text-sm text-sage-600">
              <strong className="text-sage-800">Address:</strong> {resource.address}
              {resource.town && `, ${resource.town}`}
            </p>
          )}

          {resource.hours && (
            <p className="text-sm text-sage-600">
              <strong className="text-sage-800">Hours:</strong> {resource.hours}
            </p>
          )}

          {resource.lastCheckedAt && (
            <p className="text-xs text-sage-400">Last checked: {resource.lastCheckedAt}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {resource.phone && (
          <Button asChild size="lg">
            <a href={formatPhoneLink(resource.phone)}>
              <Phone className="h-4 w-4" />
              Call {resource.phone}
            </a>
          </Button>
        )}
        {resource.website && (
          <Button asChild size="lg" variant="secondary">
            <a href={formatWebsiteUrl(resource.website)} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Visit website
            </a>
          </Button>
        )}
        {resource.email && (
          <Button asChild size="lg" variant="secondary">
            <a href={`mailto:${resource.email}`}>
              <Mail className="h-4 w-4" />
              Email
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
