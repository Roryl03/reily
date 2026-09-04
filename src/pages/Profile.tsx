import {
  ChevronRight,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { MobilePageHeader } from '@/components/layout/MobilePageHeader'
import { LocationButton, LocationSearch } from '@/components/location/LocationSearch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IOSGroup, IOSRow } from '@/components/ui/ios-group'
import { Label } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useApp } from '@/context/AppContext'
import { hasAdminAccess } from '@/lib/config'
import { isSupabaseEnabled } from '@/lib/supabase'
import type { RadiusOption } from '@/types/service'

const RADIUS_OPTIONS: { value: string; label: string }[] = [
  { value: '5', label: '5 miles' },
  { value: '10', label: '10 miles' },
  { value: '20', label: '20 miles' },
  { value: '30', label: '30 miles' },
  { value: '50', label: '50 miles' },
  { value: 'anywhere', label: 'Anywhere' },
]

export function ProfilePage() {
  const {
    location,
    preferences,
    updatePreferences,
    favourites,
    reports,
    clearDemoData,
    resetApp,
  } = useApp()

  return (
    <div className="space-y-5 lg:space-y-8">
      <MobilePageHeader title="Profile" subtitle="Preferences and settings" />
      <header className="hidden lg:block">
        <h1 className="font-display text-3xl text-sage-900">Profile & preferences</h1>
        <p className="text-sage-600">No registration required for this mockup</p>
      </header>

      <IOSGroup className="lg:hidden">
        <IOSRow href="/favourites">
          <ReilyIcon name="favourites" size="sm" variant="terracotta" label="" />
          <span className="flex-1">Saved places</span>
          <span className="text-[15px] text-sage-500">{favourites.length}</span>
        </IOSRow>
        <IOSRow href="/about">
          <ReilyIcon name="community-groups" size="sm" variant="terracotta" label="" />
          <span className="flex-1">About Us</span>
        </IOSRow>
      </IOSGroup>

      {hasAdminAccess() && (
        <IOSGroup className="lg:hidden">
          <IOSRow href="/add-service">
            <ReilyIcon name="add-service" size="sm" variant="sage" label="" />
            <span className="flex-1">Manage facilities</span>
          </IOSRow>
        </IOSGroup>
      )}

      {hasAdminAccess() && (
        <Card className="hidden lg:block">
          <CardContent className="p-5">
            <h2 className="font-semibold text-sage-900">Admin</h2>
            <p className="mt-1 text-sm text-sage-600">
              Add, edit and review listings on Ask Reilly.
            </p>
            <Button asChild className="mt-4">
              <Link to="/add-service">Manage facilities</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Location */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-semibold text-sage-900 flex items-center gap-2">
            <ReilyIcon name="location" size="sm" variant="sage" />
            Location
          </h2>
          {location && <p className="text-sm text-sage-600">{location.label}</p>}
          <LocationButton variant="secondary" />
          <LocationSearch />
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardContent className="space-y-5 p-5">
          <h2 className="font-semibold text-sage-900">Preferences</h2>

          <div className="space-y-2">
            <Label htmlFor="radius-pref">Preferred search radius</Label>
            <Select
              value={String(preferences.searchRadius)}
              onValueChange={(v) =>
                updatePreferences({
                  searchRadius: v === 'anywhere' ? 'anywhere' : (Number(v) as RadiusOption),
                })
              }
            >
              <SelectTrigger id="radius-pref">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age-range">Age range</Label>
            <Select
              value={preferences.ageRange ?? 'any'}
              onValueChange={(v) => updatePreferences({ ageRange: v === 'any' ? undefined : v })}
            >
              <SelectTrigger id="age-range">
                <SelectValue placeholder="Any age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any age</SelectItem>
                <SelectItem value="0-5">0-5 years</SelectItem>
                <SelectItem value="5-12">5-12 years</SelectItem>
                <SelectItem value="12-18">12-18 years</SelectItem>
                <SelectItem value="adult">Adults</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Accessibility preferences</Label>
            {[
              { key: 'autismFriendly' as const, label: 'Autism-friendly' },
              { key: 'wheelchairAccessible' as const, label: 'Wheelchair accessible' },
              { key: 'quietHour' as const, label: 'Quiet hours' },
              { key: 'sensoryFriendly' as const, label: 'Sensory-friendly' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between min-h-11">
                <span className="text-sm text-sage-700">{label}</span>
                <Switch
                  checked={!!preferences.accessibilityPreferences[key]}
                  onCheckedChange={(checked) =>
                    updatePreferences({
                      accessibilityPreferences: {
                        ...preferences.accessibilityPreferences,
                        [key]: checked,
                      },
                    })
                  }
                  aria-label={label}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="space-y-2">
        <Link
          to="/favourites"
          className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md focus-ring"
        >
          <span className="flex items-center gap-3">
            <ReilyIcon name="favourites" size="sm" variant="terracotta" />
            <span className="font-medium text-sage-900">Favourites</span>
          </span>
          <span className="text-sm text-sage-500">{favourites.length}</span>
        </Link>

        <Link
          to="/submitted-reports"
          className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md focus-ring"
        >
          <span className="flex items-center gap-3">
            <ReilyIcon name="sen-session" size="sm" variant="blue" />
            <span className="font-medium text-sage-900">Submitted reports</span>
          </span>
          <span className="flex items-center gap-2 text-sm text-sage-500">
            {reports.length}
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      {/* Data management */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="font-semibold text-sage-900 flex items-center gap-2">
            <ReilyIcon name="booking-required" size="sm" variant="gold" />
            Data management
          </h2>
          <p className="text-sm text-sage-600">
            Demo services are clearly labelled. Community submissions are stored locally on this device.
          </p>
          <Button variant="secondary" onClick={() => void clearDemoData()} className="w-full">
            <Trash2 className="h-4 w-4" />
            Clear demo data
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Reset the app? All local data will be cleared.')) {
                resetApp()
                window.location.href = '/'
              }
            }}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4" />
            Reset app
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function MySubmissionsPage() {
  const { services, deleteService, duplicateService } = useApp()
  const submissions = isSupabaseEnabled
    ? services
    : services.filter((s) => s.submittedByCurrentUser || s.source === 'community')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-sage-900">My submissions</h1>
        <p className="text-sage-600">Services you&apos;ve added to Reilly</p>
      </header>

      {submissions.length === 0 ? (
        <p className="text-center text-sage-600 py-8">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="rounded-xl bg-white p-4 shadow-sm space-y-3">
              <div>
                <p className="font-semibold text-sage-900">{s.name}</p>
                <p className="text-sm text-sage-600">{s.town} · {s.category}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link to={`/service/${s.id}`}>Preview</Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link to={`/add-service/edit/${s.id}`}>Edit</Link>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void duplicateService(s.id)}
                >
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        'Are you sure you want to delete this service? This cannot be undone.',
                      )
                    ) {
                      void deleteService(s.id)
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SubmittedReportsPage() {
  const { reports } = useApp()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-sage-900">Submitted reports</h1>
        <p className="text-sage-600">Corrections you&apos;ve reported locally</p>
      </header>

      {reports.length === 0 ? (
        <p className="text-center text-sage-600 py-8">No reports submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-medium text-sage-900">{r.serviceName}</p>
              <p className="text-sm text-sage-600">{r.issueType}</p>
              <p className="text-sm text-sage-500 mt-1">{r.details}</p>
              <p className="text-xs text-sage-400 mt-2">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
