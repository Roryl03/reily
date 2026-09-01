import { Link } from 'react-router-dom'
import { getCategoryIcon, ReilyIcon, ReilyIconGlyph } from '@/components/icons'
import { LocationDisplay } from '@/components/location/LocationSearch'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { enrichService } from '@/lib/filters'
import { isOpenNow, isQuietToday } from '@/lib/openingHours'
import { CATEGORIES } from '@/types/service'

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

      <Card className="border-blue-muted/30 bg-gradient-to-br from-blue-muted-light to-white overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <ReilyIcon name="support-services" size="lg" variant="blue" label="Parent support" />
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold text-sage-900">
                New to SEN? You&apos;re not alone.
              </h2>
              <p className="text-sm text-sage-700">
                Browse helplines, advice centres and support organisations across all of Northern
                Ireland — built for parents finding their way.
              </p>
              <Button asChild className="mt-1">
                <Link to="/support">Open support directory</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-sage-100 bg-gradient-to-br from-blue-muted-light to-cream-100">
        <CardContent className="flex items-center gap-4 p-5">
          <ReilyIcon name="weather" size="lg" variant="blue" label="Weather conditions" />
          <div>
            <p className="text-sm font-medium text-sage-600">Conditions near you</p>
            <p className="text-lg font-semibold text-sage-900">Mild & partly cloudy — good for outdoors</p>
            <p className="text-sm text-sage-500">Demo weather · 16°C</p>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="mb-4 text-lg font-semibold text-sage-900">
          Browse by category
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const icon = getCategoryIcon(cat)
            const href =
              cat === 'Support services'
                ? '/support'
                : `/explore?category=${encodeURIComponent(cat)}`
            return (
              <Link
                key={cat}
                to={href}
                className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-4 pt-5 text-center shadow-sm transition-shadow hover:shadow-md focus-ring min-h-[96px] justify-center"
                aria-label={cat}
              >
                <ReilyIcon name={icon.name} variant={icon.variant} size="lg" label={cat} />
                <span className="text-xs font-medium text-sage-700 leading-tight">{cat}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {recommended.length > 0 && (
        <section aria-labelledby="recommended-heading">
          <div className="mb-4 flex items-center gap-2">
            <ReilyIcon name="compass" size="md" variant="sage" label="Recommended" />
            <h2 id="recommended-heading" className="text-lg font-semibold text-sage-900">
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

      {openNow.length > 0 && (
        <section aria-labelledby="open-heading">
          <div className="mb-4 flex items-center gap-2">
            <ReilyIcon name="open-now" size="md" variant="gold" label="Open now" />
            <h2 id="open-heading" className="text-lg font-semibold text-sage-900">
              Open now
            </h2>
          </div>
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

      {quietToday.length > 0 && (
        <section aria-labelledby="quiet-heading">
          <div className="mb-4 flex items-center gap-2">
            <ReilyIcon name="quiet-hour" size="md" variant="lavender" label="Quiet today" />
            <h2 id="quiet-heading" className="text-lg font-semibold text-sage-900">
              Quiet today
            </h2>
          </div>
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
                <ReilyIcon name="location" size="sm" variant="sage" tile={false} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <Button asChild size="lg" className="w-full gap-2">
        <Link to="/explore">
          <ReilyIconGlyph name="compass" className="h-5 w-5 text-white" />
          Explore all services
        </Link>
      </Button>
    </div>
  )
}
