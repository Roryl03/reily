import { List, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FilterChips, FilterPanel } from '@/components/services/FilterPanel'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import { DEFAULT_FILTERS, type SortOption } from '@/types/service'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'open_now', label: 'Open now' },
  { value: 'recently_added', label: 'Recently added' },
  { value: 'alphabetical', label: 'Alphabetical' },
]

export function ExplorePage() {
  const {
    filteredServices,
    filters,
    setFilters,
    sort,
    setSort,
    isFavourite,
    toggleFavourite,
  } = useApp()
  const [showFilters, setShowFilters] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setFilters((f) => ({ ...f, category: category as typeof f.category }))
    }
  }, [searchParams, setFilters])

  const handleClearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, search: filters.search, radius: filters.radius })
  }

  const widenSearch = () => {
    setFilters((f) => ({ ...f, radius: 'anywhere' }))
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-sage-900">Explore</h1>
        <p className="text-sage-600">Find inclusive places near you</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" aria-hidden />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search places, activities or services"
          className="pl-10"
          aria-label="Search services"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-[160px]" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>

        <Button variant="ghost" asChild size="sm">
          <Link to="/map">
            <List className="h-4 w-4" />
            Map view
          </Link>
        </Button>
      </div>

      {showFilters && (
        <FilterPanel filters={filters} onChange={setFilters} onClear={handleClearFilters} />
      )}

      <FilterChips filters={filters} onChange={setFilters} onClear={handleClearFilters} />

      {filteredServices.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center space-y-4">
          <p className="text-lg font-medium text-sage-800">No exact matches nearby yet.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="secondary" onClick={handleClearFilters}>
              Clear filters
            </Button>
            <Button variant="secondary" onClick={widenSearch}>
              Search a wider area
            </Button>
            <Button asChild>
              <Link to="/add-service">Add a service</Link>
            </Button>
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
    </div>
  )
}
