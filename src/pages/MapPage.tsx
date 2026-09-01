import { Crosshair, List, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPreviewCard, MapView } from '@/components/map/MapView'
import { MobilePageHeader } from '@/components/layout/MobilePageHeader'
import { FilterChips, FilterPanel } from '@/components/services/FilterPanel'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { DEFAULT_FILTERS } from '@/types/service'

export function MapPage() {
  const {
    location,
    filteredServices,
    filters,
    setFilters,
    requestCurrentLocation,
    isFavourite,
    toggleFavourite,
  } = useApp()
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const selectedEnriched = selectedId
    ? filteredServices.find((s) => s.id === selectedId) ?? null
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
        <div className="relative -mx-4 lg:mx-0">
          <MapView
            location={location}
            services={filteredServices}
            selectedId={selectedId}
            onSelect={setSelectedId}
            height="calc(100dvh - 14rem - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px))"
          />
          {selectedEnriched && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000] lg:max-w-sm">
              <MapPreviewCard service={selectedEnriched} />
            </div>
          )}
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

      <Button asChild variant="secondary" size="lg" className="w-full">
        <Link to={`/add-service${location ? `?lat=${location.latitude}&lng=${location.longitude}` : ''}`}>
          Add service at my location
        </Link>
      </Button>
    </div>
  )
}
