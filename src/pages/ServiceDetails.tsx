import {
  Calendar,
  ExternalLink,
  Navigation,
  Phone,
  Share2,
  AlertCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ReilyIconGlyph } from '@/components/icons'
import { ServiceImage } from '@/components/services/ServiceImage'
import { CommunityBadge, DemoBadge, ServiceBadges } from '@/components/services/ServiceBadges'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import { hasAdminAccess } from '@/lib/config'
import { enrichService } from '@/lib/filters'
import { formatDayHours, formatOpenStatus } from '@/lib/openingHours'
import {
  formatDistance,
  formatPhoneLink,
  formatWebsiteUrl,
  getDirectionsUrl,
  shareService,
} from '@/lib/utils'

const REPORT_TYPES = [
  'Incorrect opening hours',
  'Incorrect accessibility information',
  'Service closed',
  'Wrong address',
  'Duplicate listing',
  'Other issue',
]

export function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const {
    getServiceById,
    location,
    isFavourite,
    toggleFavourite,
    addRecentlyViewed,
    saveReport,
  } = useApp()
  const [reportOpen, setReportOpen] = useState(false)
  const [reportType, setReportType] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const service = id ? getServiceById(id) : undefined
  const isPending = service?.verificationStatus === 'pending'
  const canView = service && (!isPending || hasAdminAccess())
  const enriched = canView ? enrichService(service, location) : undefined

  useEffect(() => {
    if (id && canView) addRecentlyViewed(id)
  }, [id, canView, addRecentlyViewed])

  if (!canView || !enriched) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sage-600">Service not found.</p>
        <Button asChild>
          <Link to="/explore">Back to explore</Link>
        </Button>
      </div>
    )
  }

  const status = formatOpenStatus(enriched.openStatus)

  const handleReport = () => {
    saveReport({
      serviceId: service.id,
      serviceName: service.name,
      issueType: reportType,
      details: reportDetails,
    })
    setReportSubmitted(true)
    setReportOpen(false)
  }

  return (
    <div className="space-y-6 -mx-4 sm:mx-0">
      <div className="relative">
        <ServiceImage
          src={service.images[0]}
          category={service.category}
          className="h-56 w-full object-cover sm:rounded-2xl"
        />
        <button
          type="button"
          onClick={() => toggleFavourite(service.id)}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow focus-ring"
          aria-label={isFavourite(service.id) ? 'Remove from favourites' : 'Add to favourites'}
        >
          <ReilyIconGlyph
            name="favourites"
            className={`h-5 w-5 ${isFavourite(service.id) ? 'text-terracotta [&>path]:fill-terracotta' : 'text-sage-600'}`}
          />
        </button>
      </div>

      <div className="space-y-4 px-4 sm:px-0">
        <div className="flex flex-wrap gap-2">
          {service.source === 'demo' && <DemoBadge />}
          {service.source === 'community' && <CommunityBadge />}
          <Badge variant={enriched.openStatus === 'open' ? 'success' : 'outline'}>{status}</Badge>
          {enriched.hasSenSessionToday && <Badge variant="accent">SEN session today</Badge>}
          {enriched.hasQuietHourToday && <Badge variant="accent">Quiet hour today</Badge>}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-sage-900">{service.name}</h1>
          <p className="text-sage-600">{service.category}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-sage-600">
          <span className="flex items-center gap-1.5">
            <ReilyIconGlyph name="location" className="h-4 w-4 text-sage-500" />
            {service.address}, {service.town}, {service.postcode}
          </span>
          {enriched.distanceMiles !== undefined && (
            <span>{formatDistance(enriched.distanceMiles)} away</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a
              href={getDirectionsUrl(service.latitude, service.longitude, service.name)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="h-4 w-4" />
              Get directions
            </a>
          </Button>
          {service.phone && (
            <Button asChild variant="secondary">
              <a href={formatPhoneLink(service.phone)}>
                <Phone className="h-4 w-4" />
                Call
              </a>
            </Button>
          )}
          {service.website && (
            <Button asChild variant="secondary">
              <a href={formatWebsiteUrl(service.website)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Visit website
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shareService(service.name, window.location.href)}
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sage-700">{service.fullDescription}</p>

        <section aria-labelledby="accessibility-heading">
          <h2 id="accessibility-heading" className="text-lg font-semibold text-sage-900 mb-3">
            Accessibility
          </h2>
          <ServiceBadges features={service.accessibilityFeatures} limit={20} />
        </section>

        {service.goodToKnow && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="text-lg font-semibold text-sage-900">Good to know before you go</h2>
              {service.goodToKnow.noiseLevels && (
                <p className="text-sm"><strong>Noise:</strong> {service.goodToKnow.noiseLevels}</p>
              )}
              {service.goodToKnow.lighting && (
                <p className="text-sm"><strong>Lighting:</strong> {service.goodToKnow.lighting}</p>
              )}
              {service.goodToKnow.queues && (
                <p className="text-sm"><strong>Queues:</strong> {service.goodToKnow.queues}</p>
              )}
              {service.goodToKnow.busyPeriods && (
                <p className="text-sm"><strong>Busy periods:</strong> {service.goodToKnow.busyPeriods}</p>
              )}
              {service.goodToKnow.quietRetreat && (
                <p className="text-sm"><strong>Quiet space:</strong> {service.goodToKnow.quietRetreat}</p>
              )}
            </CardContent>
          </Card>
        )}

        <section aria-labelledby="hours-heading">
          <h2 id="hours-heading" className="text-lg font-semibold text-sage-900 mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" aria-hidden />
            Opening hours
          </h2>
          <ul className="space-y-1 text-sm text-sage-700">
            {formatDayHours(service.openingHours).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {service.senSessions && service.senSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-sage-900 mb-3">SEN sessions</h2>
            <ul className="space-y-2 text-sm text-sage-700">
              {service.senSessions.map((s, i) => (
                <li key={i} className="rounded-lg bg-sage-50 p-3">
                  <strong className="capitalize">{s.day}</strong> {s.start}-{s.end}: {s.label}
                </li>
              ))}
            </ul>
          </section>
        )}

        {service.quietHours && service.quietHours.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-sage-900 mb-3">Quiet hours</h2>
            <ul className="space-y-2 text-sm text-sage-700">
              {service.quietHours.map((q, i) => (
                <li key={i} className="rounded-lg bg-blue-muted-light p-3">
                  <strong className="capitalize">{q.day}</strong> {q.start}-{q.end}
                  {q.label && `: ${q.label}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid gap-3 sm:grid-cols-2 text-sm text-sage-700">
          {service.ageRange && <p><strong>Age suitability:</strong> {service.ageRange}</p>}
          {service.pricing && <p><strong>Price:</strong> {service.pricing}</p>}
          {service.parkingInformation && <p><strong>Parking:</strong> {service.parkingInformation}</p>}
          {service.bookingRequired !== undefined && (
            <p><strong>Booking:</strong> {service.bookingRequired ? 'Required' : 'Not required'}</p>
          )}
        </div>

        {service.lastCheckedAt && (
          <p className="text-xs text-sage-400">
            Information last checked: {service.lastCheckedAt}
          </p>
        )}

        <Button variant="outline" className="w-full" onClick={() => setReportOpen(true)}>
          <AlertCircle className="h-4 w-4" />
          Is something incorrect?
        </Button>

        {reportSubmitted && (
          <p className="text-sm text-sage-600 text-center" role="status">
            Thank you - your report has been saved locally.
          </p>
        )}
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report incorrect information</DialogTitle>
            <DialogDescription>
              Help improve this listing. Reports are stored locally in this mockup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issue-type">Issue type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="issue-type">
                  <SelectValue placeholder="Select an issue" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-details">Details</Label>
              <Textarea
                id="report-details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Tell us what's wrong…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button onClick={handleReport} disabled={!reportType}>Submit report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
