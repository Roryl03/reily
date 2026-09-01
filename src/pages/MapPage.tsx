import { Crosshair, List, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPreviewCard, MapView } from '@/components/map/MapView'
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
    getServiceById,
  } = useApp()
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const selected = selectedId ? getServiceById(selectedId) : null
  const selectedEnriched = selected
    ? filteredServices.find((s) => s.id === selectedId) ?? null
    : null

  const handleClearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, search: filters.search, radius: filters.radius })
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Map</h1>
          <p className="text-sm text-sage-600">{location?.label ?? 'Northern Ireland'}</p>
        </div>
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
      </header>

      {showFilters && (
        <FilterPanel filters={filters} onChange={setFilters} onClear={handleClearFilters} />
      )}
      <FilterChips filters={filters} onChange={setFilters} onClear={handleClearFilters} />

      {view === 'map' ? (
        <div className="relative">
          <MapView
            location={location}
            services={filteredServices}
            selectedId={selectedId}
            onSelect={setSelectedId}
            height="calc(100dvh - 280px)"
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

      <div className="flex gap-2">
        <Button asChild variant="secondary" className="flex-1">
          <Link to={`/add-service${location ? `?lat=${location.latitude}&lng=${location.longitude}` : ''}`}>
            Add service at my location
          </Link>
        </Button>
      </div>
    </div>
  )
}
