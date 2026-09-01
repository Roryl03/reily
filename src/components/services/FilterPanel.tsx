import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckboxField } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getActiveFilterCount } from '@/lib/filters'
import { CATEGORIES, type ServiceFilters } from '@/types/service'

interface FilterPanelProps {
  filters: ServiceFilters
  onChange: (filters: ServiceFilters) => void
  onClear: () => void
}

const RADIUS_OPTIONS = [
  { value: '5', label: '5 miles' },
  { value: '10', label: '10 miles' },
  { value: '20', label: '20 miles' },
  { value: '30', label: '30 miles' },
  { value: '50', label: '50 miles' },
  { value: 'anywhere', label: 'Anywhere' },
]

export function FilterChips({ filters, onChange, onClear }: FilterPanelProps) {
  const chips: { key: string; label: string }[] = []
  if (filters.category) chips.push({ key: 'category', label: filters.category })
  if (filters.openNow) chips.push({ key: 'openNow', label: 'Open now' })
  if (filters.wheelchairAccess) chips.push({ key: 'wheelchairAccess', label: 'Wheelchair access' })
  if (filters.accessibleToilet) chips.push({ key: 'accessibleToilet', label: 'Accessible toilet' })
  if (filters.changingPlaces) chips.push({ key: 'changingPlaces', label: 'Changing Places' })
  if (filters.quietHour) chips.push({ key: 'quietHour', label: 'Quiet hour' })
  if (filters.senSession) chips.push({ key: 'senSession', label: 'SEN session' })
  if (filters.autismFriendly) chips.push({ key: 'autismFriendly', label: 'Autism-friendly' })
  if (filters.sensoryFriendly) chips.push({ key: 'sensoryFriendly', label: 'Sensory-friendly' })
  if (filters.indoor) chips.push({ key: 'indoor', label: 'Indoor' })
  if (filters.outdoor) chips.push({ key: 'outdoor', label: 'Outdoor' })
  if (filters.freeActivities) chips.push({ key: 'freeActivities', label: 'Free activities' })
  if (filters.parkingAvailable) chips.push({ key: 'parkingAvailable', label: 'Parking' })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() =>
            onChange({ ...filters, [chip.key]: chip.key === 'category' ? undefined : false })
          }
          className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-3 py-1.5 text-sm text-sage-700 focus-ring min-h-9"
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear all
      </Button>
    </div>
  )
}

export function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  const toggle = (key: keyof ServiceFilters) => {
    onChange({ ...filters, [key]: !filters[key] })
  }

  return (
    <div className="space-y-5 rounded-2xl border border-sage-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sage-900">Filters</h3>
        {getActiveFilterCount(filters) > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="radius">Distance</Label>
        <Select
          value={String(filters.radius)}
          onValueChange={(v) =>
            onChange({
              ...filters,
              radius: v === 'anywhere' ? 'anywhere' : (Number(v) as ServiceFilters['radius']),
            })
          }
        >
          <SelectTrigger id="radius" aria-label="Search radius">
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
        <Label htmlFor="category">Category</Label>
        <Select
          value={filters.category ?? 'all'}
          onValueChange={(v) =>
            onChange({ ...filters, category: v === 'all' ? undefined : (v as ServiceFilters['category']) })
          }
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <CheckboxField id="openNow" label="Open now" checked={filters.openNow} onCheckedChange={() => toggle('openNow')} />
        <CheckboxField id="wheelchair" label="Wheelchair access" checked={filters.wheelchairAccess} onCheckedChange={() => toggle('wheelchairAccess')} />
        <CheckboxField id="toilet" label="Accessible toilet" checked={filters.accessibleToilet} onCheckedChange={() => toggle('accessibleToilet')} />
        <CheckboxField id="changing" label="Changing Places" checked={filters.changingPlaces} onCheckedChange={() => toggle('changingPlaces')} />
        <CheckboxField id="quiet" label="Quiet hour" checked={filters.quietHour} onCheckedChange={() => toggle('quietHour')} />
        <CheckboxField id="sen" label="SEN-specific session" checked={filters.senSession} onCheckedChange={() => toggle('senSession')} />
        <CheckboxField id="autism" label="Autism-friendly" checked={filters.autismFriendly} onCheckedChange={() => toggle('autismFriendly')} />
        <CheckboxField id="sensory" label="Sensory-friendly" checked={filters.sensoryFriendly} onCheckedChange={() => toggle('sensoryFriendly')} />
        <CheckboxField id="indoor" label="Indoor" checked={filters.indoor} onCheckedChange={() => toggle('indoor')} />
        <CheckboxField id="outdoor" label="Outdoor" checked={filters.outdoor} onCheckedChange={() => toggle('outdoor')} />
        <CheckboxField id="booking" label="Booking required" checked={filters.bookingRequired} onCheckedChange={() => toggle('bookingRequired')} />
        <CheckboxField id="free" label="Free activities" checked={filters.freeActivities} onCheckedChange={() => toggle('freeActivities')} />
        <CheckboxField id="parking" label="Parking available" checked={filters.parkingAvailable} onCheckedChange={() => toggle('parkingAvailable')} />
      </div>
    </div>
  )
}
