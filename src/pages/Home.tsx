import {
  CloudSun,
  Compass,
  MapPin,
  Sparkles,
  Sun,
  Volume2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { LocationDisplay } from '@/components/location/LocationSearch'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { enrichService } from '@/lib/filters'
import { isOpenNow, isQuietToday } from '@/lib/openingHours'
import { CATEGORIES } from '@/types/service'

const CATEGORY_ICONS: Record<string, string> = {
  Activities: '🎯',
  'Food and drink': '☕',
  'Parks and outdoors': '🌳',
  'Support services': '🤝',
  Shopping: '🛍️',
  Cinema: '🎬',
  'Soft play': '🧸',
  Accommodation: '🏨',
  Education: '📚',
  Healthcare: '💚',
  Haircuts: '✂️',
  'Community groups': '👥',
}

export function HomePage() {
  const {
    location,
    filteredServices,
    services,
    isFavourite,
    toggleFavourite,
    recentlyViewedIds,
  } = useApp()

  const enriched = services.map((s) => enrichService(s, location))
  const recommended = filteredServices.slice(0, 3)
  const openNow = enriched.filter(isOpenNow).slice(0, 3)
  const quietToday = enriched.filter(isQuietToday).slice(0, 3)
  const recent = recentlyViewedIds
    .map((id) => enriched.find((s) => s.id === id))
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-sage-900 md:text-3xl">
          Where would you like to go today?
        </h1>
        <LocationDisplay />
        <Button variant="link" asChild className="h-auto p-0">
          <Link to="/profile">Change location</Link>
        </Button>
      </header>

      {/* Weather-style condition card */}
      <Card className="border-sage-100 bg-gradient-to-br from-blue-muted-light to-cream-100">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <CloudSun className="h-8 w-8 text-blue-muted" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-sage-600">Conditions near you</p>
            <p className="text-lg font-semibold text-sage-900">Mild & partly cloudy — good for outdoors</p>
            <p className="text-sm text-sage-500">Demo weather · 16°C</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick categories */}
      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="mb-4 text-lg font-semibold text-sage-900">
          Browse by category
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/explore?category=${encodeURIComponent(cat)}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md focus-ring min-h-[88px] justify-center"
            >
              <span className="text-2xl" aria-hidden>
                {CATEGORY_ICONS[cat] ?? '📍'}
              </span>
              <span className="text-xs font-medium text-sage-700 leading-tight">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section aria-labelledby="recommended-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recommended-heading" className="text-lg font-semibold text-sage-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sage-500" aria-hidden />
              Recommended nearby
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                isFavourite={isFavourite(s.id)}
                onToggleFavourite={() => toggleFavourite(s.id)}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* Open now */}
      {openNow.length > 0 && (
        <section aria-labelledby="open-heading">
          <h2 id="open-heading" className="mb-4 text-lg font-semibold text-sage-900 flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" aria-hidden />
            Open now
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {openNow.map((s) => (
              <Link
                key={s.id}
                to={`/service/${s.id}`}
                className="min-w-[240px] snap-start rounded-2xl bg-white p-4 shadow-sm hover:shadow-md focus-ring"
              >
                <p className="font-semibold text-sage-900">{s.name}</p>
                <p className="text-sm text-sage-600">{s.town}</p>
                <Badge variant="success" className="mt-2">Open now</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quiet today */}
      {quietToday.length > 0 && (
        <section aria-labelledby="quiet-heading">
          <h2 id="quiet-heading" className="mb-4 text-lg font-semibold text-sage-900 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-muted" aria-hidden />
            Quiet today
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {quietToday.map((s) => (
              <Link
                key={s.id}
                to={`/service/${s.id}`}
                className="min-w-[240px] snap-start rounded-2xl bg-white p-4 shadow-sm hover:shadow-md focus-ring"
              >
                <p className="font-semibold text-sage-900">{s.name}</p>
                <p className="text-sm text-sage-600">{s.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      {recent.length > 0 && (
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="mb-4 text-lg font-semibold text-sage-900">
            Recently viewed
          </h2>
          <div className="space-y-2">
            {recent.map((s) => s && (
              <Link
                key={s.id}
                to={`/service/${s.id}`}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md focus-ring"
              >
                <div>
                  <p className="font-medium text-sage-900">{s.name}</p>
                  <p className="text-sm text-sage-600">{s.town}</p>
                </div>
                <MapPin className="h-4 w-4 text-sage-400" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      )}

      <Button asChild size="lg" className="w-full">
        <Link to="/explore">
          <Compass className="h-5 w-5" />
          Explore all services
        </Link>
      </Button>
    </div>
  )
}
