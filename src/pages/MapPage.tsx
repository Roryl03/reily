import { Crosshair, List, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPreviewCard, MapView } from '@/components/map/MapView'
import { MobilePageHeader } from '@/components/layout/MobilePageHeader'
import { FilterChips, FilterPanel } from '@/components/services/FilterPanel'
import { ListYourFacilityCta } from '@/components/services/ListYourFacilityCta'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { track } from '@/lib/analytics'
import { filterServices, sortServices } from '@/lib/filters'
import { DEFAULT_FILTERS, isLiveService } from '@/types/service'

export function MapPage() {
  const [searchParams] = useSearchParams()
  const hidePins =
    import.meta.env.VITE_HIDE_MAP_PINS === 'true' ||
    searchParams.get('screenshot') === '1'

  const {
    location,
    filteredServices,
    services,
    filters,
    sort,
    setFilters,
    requestCurrentLocation,
    isFavourite,
    toggleFavourite,
  } = useApp()

  const activeServices = useMemo(
    () => services.filter(isLiveService),
    [services],
  )

  /** Map shows all of NI — don't hide listings outside the search radius. */
  const mapServices = useMemo(() => {
    const filtered = filterServices(
      activeServices,
      { ...filters, radius: 'anywhere' },
      location,
    )
    return sortServices(filtered, sort)
  }, [activeServices, filters, location, sort])

  const activeCount = activeServices.length
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const selectedEnriched = selectedId
    ? mapServices.find((s) => s.id === selectedId) ?? null
    : null

  const handleClearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, search: filters.search, radius: filters.radius })
  }

  return (
    <div className="space-y-4">
      <MobilePageHeader
        title="Map"
        subtitle={location?.label ?? 'Northern Ireland'}
      />

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => requestCurrentLocation()}
          aria-label="Re-centre on me"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setView(view === 'map' ? 'list' : 'map')}
          aria-label={view === 'map' ? 'Switch to list view' : 'Switch to map view'}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <FilterPanel filters={filters} onChange={setFilters} onClear={handleClearFilters} />
      )}
      <FilterChips filters={filters} onChange={setFilters} onClear={handleClearFilters} />

      {view === 'map' ? (
        <div className="space-y-3">
          <div className="px-1 lg:px-0" aria-live="polite">
            <p className="font-display text-2xl sm:text-[1.75rem] text-sage-900 leading-tight">
              {activeCount} active {activeCount === 1 ? 'service' : 'services'}
            </p>
            {mapServices.length < activeCount && (
              <p className="mt-1 text-sm text-sage-600">
                Showing {mapServices.length} on the map
              </p>
            )}
          </div>
          <div className="relative -mx-4 lg:mx-0">
            <MapView
              location={location}
              services={mapServices}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                if (id) track('MAP_INTERACTION', { action: 'pin_select' })
              }}
              showPopups={false}
              hidePins={hidePins}
              height="calc(100dvh - 14rem - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px))"
            />
            {!hidePins && selectedEnriched && (
              <div className="absolute bottom-4 left-4 right-4 z-[1000] lg:max-w-sm">
                <MapPreviewCard service={selectedEnriched} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredServices.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              isFavourite={isFavourite(s.id)}
              onToggleFavourite={() => toggleFavourite(s.id)}
            />
          ))}
        </div>
      )}

      <ListYourFacilityCta />
    </div>
  )
}
