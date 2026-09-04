import { Check, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { MapPreview } from '@/components/map/MapView'
import { ServiceImage } from '@/components/services/ServiceImage'
import { LocationButton } from '@/components/location/LocationSearch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckboxField } from '@/components/ui/checkbox'
import { Input, Label, Textarea } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import { isSupabaseEnabled } from '@/lib/supabase'
import { uploadServiceImage } from '@/lib/serviceImages'
import { generateId, fileToDataUrl } from '@/lib/utils'
import type {
  AccessibilityFeatures,
  Category,
  DayHours,
  Service,
  SensoryInformation,
  WeekOpeningHours,
} from '@/types/service'
import { CATEGORIES, DEMO_LOCATION } from '@/types/service'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

type ServiceFormMode = 'admin' | 'request'

const defaultHours = (): WeekOpeningHours =>
  Object.fromEntries(
    DAYS.map((d) => [d, { open: '09:00', close: '17:00', closed: d === 'sunday' }]),
  ) as WeekOpeningHours

const emptyService = (): Partial<Service> => ({
  name: '',
  category: 'Activities' as Category,
  shortDescription: '',
  fullDescription: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  town: '',
  county: 'Antrim',
  postcode: '',
  latitude: DEMO_LOCATION.latitude,
  longitude: DEMO_LOCATION.longitude,
  images: [],
  openingHours: defaultHours(),
  accessibilityFeatures: {},
  sensoryInformation: {},
  ageRange: '',
  pricing: '',
  bookingRequired: false,
  bookingUrl: '',
  quietHours: [],
  senSessions: [],
  events: [],
  parkingInformation: '',
})

const ACCESSIBILITY_OPTIONS: { key: keyof AccessibilityFeatures; label: string }[] = [
  { key: 'autismFriendly', label: 'Autism-friendly' },
  { key: 'senSpecific', label: 'SEN-specific service' },
  { key: 'quietHour', label: 'Quiet hour' },
  { key: 'sensoryFriendly', label: 'Sensory-friendly' },
  { key: 'wheelchairAccessible', label: 'Wheelchair accessible' },
  { key: 'accessibleToilet', label: 'Accessible toilet' },
  { key: 'changingPlaces', label: 'Changing Places' },
  { key: 'sensoryRoom', label: 'Sensory room' },
  { key: 'earDefendersAvailable', label: 'Ear defenders available' },
  { key: 'visualGuideAvailable', label: 'Visual guide available' },
  { key: 'trainedStaff', label: 'Trained or aware staff' },
  { key: 'assistanceDogsWelcome', label: 'Assistance dogs welcome' },
  { key: 'stepFreeAccess', label: 'Step-free access' },
  { key: 'disabledParking', label: 'Disabled parking' },
  { key: 'freeParking', label: 'Free parking' },
  { key: 'publicTransportNearby', label: 'Public transport nearby' },
  { key: 'indoor', label: 'Indoor' },
  { key: 'outdoor', label: 'Outdoor' },
  { key: 'freeEntry', label: 'Free entry' },
  { key: 'bookingRequired', label: 'Booking required' },
]

export function AddServicePage({ mode = 'admin' }: { mode?: ServiceFormMode }) {
  const isRequest = mode === 'request'
  const [searchParams] = useSearchParams()
  const { saveService, location, getServiceById } = useApp()
  const { id: editId } = useParams<{ id: string }>()
  const isEdit = !isRequest && !!editId

  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<Service>>(emptyService())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageError, setImageError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    if (lat && lng) {
      setData((d) => ({ ...d, latitude: Number(lat), longitude: Number(lng) }))
    } else if (location) {
      setData((d) => ({
        ...d,
        latitude: location.latitude,
        longitude: location.longitude,
      }))
    }
  }, [searchParams, location])

  useEffect(() => {
    if (isEdit && editId) {
      const existing = getServiceById(editId)
      if (existing) setData(existing)
    }
  }, [isEdit, editId, getServiceById])

  const update = (partial: Partial<Service>) => setData((d) => ({ ...d, ...partial }))
  const updateAccessibility = (key: keyof AccessibilityFeatures, value: boolean) =>
    setData((d) => ({
      ...d,
      accessibilityFeatures: { ...d.accessibilityFeatures, [key]: value },
    }))
  const updateSensory = (partial: Partial<SensoryInformation>) =>
    setData((d) => ({
      ...d,
      sensoryInformation: { ...d.sensoryInformation, ...partial },
    }))

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!data.name?.trim()) e.name = 'Name is required'
      if (!data.shortDescription?.trim()) e.shortDescription = 'Short description is required'
    }
    if (s === 2) {
      if (!data.address?.trim()) e.address = 'Address is required'
      if (!data.town?.trim()) e.town = 'Town is required'
      if (!data.postcode?.trim()) e.postcode = 'Postcode is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 5))
  }
  const back = () => setStep((s) => Math.max(s - 1, 1))

  const handleImage = async (file: File | null) => {
    if (!file) return
    setImageError('')
    try {
      if (isSupabaseEnabled) {
        const id = data.id ?? crypto.randomUUID()
        try {
          const url = await uploadServiceImage(file, id)
          update({ id, images: [url] })
        } catch {
          // Storage RLS not configured yet - store inline so submit still works
          const url = await fileToDataUrl(file)
          update({ id, images: [url] })
        }
      } else {
        const url = await fileToDataUrl(file)
        update({ images: [url] })
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Image upload failed')
    }
  }

  const submit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    const now = new Date().toISOString()
    const serviceId =
      isEdit && editId ? editId : isSupabaseEnabled ? crypto.randomUUID() : generateId()

    const service: Service = {
      id: serviceId,
      name: data.name!,
      category: (data.category ?? 'Activities') as Category,
      shortDescription: data.shortDescription!,
      fullDescription: data.fullDescription ?? data.shortDescription!,
      address: data.address!,
      town: data.town!,
      county: data.county ?? 'Antrim',
      postcode: data.postcode!,
      latitude: data.latitude ?? DEMO_LOCATION.latitude,
      longitude: data.longitude ?? DEMO_LOCATION.longitude,
      phone: data.phone,
      email: data.email,
      website: data.website,
      images: data.images ?? [],
      openingHours: data.openingHours,
      accessibilityFeatures: data.accessibilityFeatures ?? {},
      sensoryInformation: data.sensoryInformation ?? {},
      ageRange: data.ageRange,
      pricing: data.pricing,
      bookingRequired: data.bookingRequired,
      bookingUrl: data.bookingUrl,
      quietHours: data.quietHours,
      senSessions: data.senSessions,
      events: data.events,
      parkingInformation: data.parkingInformation,
      verificationStatus: isRequest
        ? 'pending'
        : isEdit && data.verificationStatus
          ? data.verificationStatus
          : 'community',
      source: 'community',
      createdAt: isEdit && data.createdAt ? data.createdAt : now,
      updatedAt: now,
      lastCheckedAt: now.split('T')[0],
      submittedByCurrentUser: !isRequest,
    }

    try {
      const saved = await saveService(service)
      setSavedId(saved.id)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save service')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && savedId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
          <Check className="h-8 w-8 text-sage-600" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-sage-900">
          {isRequest
            ? 'Request submitted!'
            : isEdit
              ? 'Facility updated!'
              : 'Facility added!'}
        </h1>
        <p className="text-sage-600 max-w-sm">
          {isRequest
            ? 'Thanks! The Reilly team will review your listing and email you if we need anything else.'
            : `Your facility has been saved${isSupabaseEnabled ? '' : ' locally'} and is now live on Reilly.`}
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {!isRequest && (
            <Button asChild>
              <Link to={`/service/${savedId}`}>View facility</Link>
            </Button>
          )}
          {!isRequest && (
            <Button variant="secondary" asChild>
              <Link to="/add-service">Back to facilities</Link>
            </Button>
          )}
          {!isEdit && !isRequest && (
            <Button variant="secondary" asChild>
              <Link to="/add-service/new">Add another</Link>
            </Button>
          )}
          <Button variant={isRequest ? 'default' : 'ghost'} asChild>
            <Link to="/explore">Back to explore</Link>
          </Button>
        </div>
      </div>
    )
  }

  const steps = ['Basic info', 'Location', 'Accessibility', 'Opening times', 'Review']

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        {!isRequest && (
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link to="/add-service">
              <ChevronLeft className="h-4 w-4" /> Back to facilities
            </Link>
          </Button>
        )}
        {isRequest && (
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link to="/explore">
              <ChevronLeft className="h-4 w-4" /> Back to explore
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-sage-900">
            {isRequest
              ? 'Submit your facility'
              : isEdit
                ? 'Edit facility'
                : 'Add a facility'}
          </h1>
          <p className="text-sage-600 mt-1">
            Step {step} of 5 - {steps[step - 1]}
          </p>
        </div>
        {isRequest && (
          <Card className="border-amber-200 bg-amber-50/80">
            <CardContent className="flex gap-3 p-4 text-sm text-amber-950">
              <Clock className="h-5 w-5 shrink-0 text-amber-700" aria-hidden />
              <p>
                This form sends your details to our admins for review. We&apos;ll accept or
                decline your listing - it won&apos;t appear on Reilly until it&apos;s approved.
              </p>
            </CardContent>
          </Card>
        )}
      </header>

      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i + 1 <= step ? 'bg-sage-500' : 'bg-sage-200'}`}
            aria-hidden
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service or venue name *</Label>
            <Input id="name" value={data.name ?? ''} onChange={(e) => update({ name: e.target.value })} />
            {errors.name && <p className="text-sm text-terracotta" role="alert">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={data.category} onValueChange={(v) => update({ category: v as Category })}>
              <SelectTrigger id="category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="short">Short description *</Label>
            <Input id="short" value={data.shortDescription ?? ''} onChange={(e) => update({ shortDescription: e.target.value })} />
            {errors.shortDescription && <p className="text-sm text-terracotta" role="alert">{errors.shortDescription}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="full">Full description</Label>
            <Textarea id="full" value={data.fullDescription ?? ''} onChange={(e) => update({ fullDescription: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telephone</Label>
              <Input id="phone" type="tel" value={data.phone ?? ''} onChange={(e) => update({ phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={data.email ?? ''} onChange={(e) => update({ email: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={data.website ?? ''} onChange={(e) => update({ website: e.target.value })} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address line *</Label>
            <Input id="address" value={data.address ?? ''} onChange={(e) => update({ address: e.target.value })} />
            {errors.address && <p className="text-sm text-terracotta" role="alert">{errors.address}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="town">Town *</Label>
              <Input id="town" value={data.town ?? ''} onChange={(e) => update({ town: e.target.value })} />
              {errors.town && <p className="text-sm text-terracotta" role="alert">{errors.town}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input id="county" value={data.county ?? ''} onChange={(e) => update({ county: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode *</Label>
            <Input id="postcode" value={data.postcode ?? ''} onChange={(e) => update({ postcode: e.target.value })} />
            {errors.postcode && <p className="text-sm text-terracotta" role="alert">{errors.postcode}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <LocationButton
              variant="secondary"
              onComplete={() => {
                if (location) update({ latitude: location.latitude, longitude: location.longitude })
              }}
            />
            <Button
              variant="secondary"
              type="button"
              onClick={() => update({ latitude: data.latitude, longitude: data.longitude })}
            >
              Use centre of map
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" type="number" step="any" value={data.latitude ?? ''} onChange={(e) => update({ latitude: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" type="number" step="any" value={data.longitude ?? ''} onChange={(e) => update({ longitude: Number(e.target.value) })} />
            </div>
          </div>
          {data.latitude && data.longitude && (
            <MapPreview
              lat={data.latitude}
              lng={data.longitude}
              onMove={(lat, lng) => update({ latitude: lat, longitude: lng })}
              height="240px"
            />
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid gap-1 sm:grid-cols-2">
            {ACCESSIBILITY_OPTIONS.map(({ key, label }) => (
              <CheckboxField
                key={key}
                id={key}
                label={label}
                checked={!!data.accessibilityFeatures?.[key]}
                onCheckedChange={(v) => updateAccessibility(key, !!v)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Suitable age range</Label>
            <Input id="age" value={data.ageRange ?? ''} onChange={(e) => update({ ageRange: e.target.value })} placeholder="e.g. 0-12 years" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="noise">Expected noise level</Label>
              <Select value={data.sensoryInformation?.noiseLevel ?? ''} onValueChange={(v) => updateSensory({ noiseLevel: v as SensoryInformation['noiseLevel'] })}>
                <SelectTrigger id="noise"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['quiet', 'moderate', 'lively', 'variable'].map((n) => (
                    <SelectItem key={n} value={n} className="capitalize">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lighting">Expected lighting</Label>
              <Select value={data.sensoryInformation?.lightingLevel ?? ''} onValueChange={(v) => updateSensory({ lightingLevel: v as SensoryInformation['lightingLevel'] })}>
                <SelectTrigger id="lighting"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['dim', 'moderate', 'bright', 'variable'].map((n) => (
                    <SelectItem key={n} value={n} className="capitalize">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional accessibility notes</Label>
            <Textarea id="notes" value={data.sensoryInformation?.additionalNotes ?? ''} onChange={(e) => updateSensory({ additionalNotes: e.target.value })} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const hours = data.openingHours?.[day] as DayHours | undefined
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3">
                <span className="w-24 capitalize text-sm font-medium text-sage-800">{day}</span>
                <CheckboxField
                  id={`closed-${day}`}
                  label="Closed"
                  checked={!!hours?.closed}
                  onCheckedChange={(v) =>
                    update({
                      openingHours: {
                        ...data.openingHours!,
                        [day]: { ...hours!, closed: !!v },
                      },
                    })
                  }
                />
                {!hours?.closed && (
                  <>
                    <Input
                      type="time"
                      value={hours?.open ?? '09:00'}
                      onChange={(e) =>
                        update({
                          openingHours: {
                            ...data.openingHours!,
                            [day]: { ...hours!, open: e.target.value },
                          },
                        })
                      }
                      className="w-32"
                      aria-label={`${day} opening time`}
                    />
                    <span className="text-sage-400">to</span>
                    <Input
                      type="time"
                      value={hours?.close ?? '17:00'}
                      onChange={(e) =>
                        update({
                          openingHours: {
                            ...data.openingHours!,
                            [day]: { ...hours!, close: e.target.value },
                          },
                        })
                      }
                      className="w-32"
                      aria-label={`${day} closing time`}
                    />
                  </>
                )}
              </div>
            )
          })}
          <div className="space-y-2">
            <Label htmlFor="pricing">Price or pricing notes</Label>
            <Input id="pricing" value={data.pricing ?? ''} onChange={(e) => update({ pricing: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-url">Booking link</Label>
            <Input id="booking-url" value={data.bookingUrl ?? ''} onChange={(e) => update({ bookingUrl: e.target.value })} />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Cover image (optional, max 500KB)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
            />
            {imageError && <p className="text-sm text-terracotta" role="alert">{imageError}</p>}
            {data.images?.[0] && (
              <ServiceImage
                src={data.images[0]}
                category={(data.category ?? 'Activities') as Category}
                className="h-40 w-full rounded-xl object-cover"
              />
            )}
          </div>
          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              <ReviewRow label="Name" value={data.name} step={1} onEdit={() => setStep(1)} />
              <ReviewRow label="Category" value={data.category} step={1} onEdit={() => setStep(1)} />
              <ReviewRow label="Description" value={data.shortDescription} step={1} onEdit={() => setStep(1)} />
              <ReviewRow label="Address" value={`${data.address}, ${data.town}, ${data.postcode}`} step={2} onEdit={() => setStep(2)} />
              <ReviewRow label="Accessibility" value={`${Object.values(data.accessibilityFeatures ?? {}).filter(Boolean).length} features selected`} step={3} onEdit={() => setStep(3)} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between pt-4">
        {step > 1 ? (
          <Button variant="secondary" onClick={back}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <Button variant="ghost" asChild>
            <Link to={isRequest ? '/explore' : '/add-service'}>Cancel</Link>
          </Button>
        )}
        {step < 5 ? (
          <Button onClick={next}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {submitError && (
              <p className="text-sm text-terracotta" role="alert">
                {submitError}
              </p>
            )}
            <Button onClick={() => void submit()} disabled={submitting}>
              {submitting
                ? 'Saving…'
                : isRequest
                  ? 'Submit for review'
                  : isEdit
                    ? 'Save changes'
                    : 'Publish facility'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string
  value?: string
  step?: number
  onEdit: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium text-sage-800">{label}</p>
        <p className="text-sage-600">{value || '-'}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
    </div>
  )
}

export function EditServicePage() {
  return <AddServicePage mode="admin" />
}

export function SubmitFacilityPage() {
  return <AddServicePage mode="request" />
}
