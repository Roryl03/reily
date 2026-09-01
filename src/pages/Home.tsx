import { Link } from 'react-router-dom'
import {
  HomeCategoryStrip,
  HomeHero,
  HomeLocationPill,
  HomeNearbySection,
  HomeQuickActions,
  HomeSupportSpotlight,
} from '@/components/home'
import { ReilyIconGlyph } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { enrichService } from '@/lib/filters'
import { isOpenNow } from '@/lib/openingHours'

export function HomePage() {
  const {
    location,
    filteredServices,
    services,
    isFavourite,
    toggleFavourite,
  } = useApp()

  const enriched = services.map((s) => enrichService(s, location))
  const recommended = filteredServices.slice(0, 3)
  const openNow = enriched.filter(isOpenNow).slice(0, 3)

  return (
    <div className="mobile-page pb-2">
      <HomeHero />
      <HomeLocationPill />
      <HomeQuickActions />
      <HomeSupportSpotlight />
      <HomeCategoryStrip />
      <HomeNearbySection
        recommended={recommended}
        openNow={openNow}
        isFavourite={isFavourite}
        toggleFavourite={toggleFavourite}
      />

      <div className="ios-card p-4 text-center space-y-3 sm:p-5">
        <p className="text-[15px] text-sage-600 leading-relaxed">
          Know a great inclusive place? Help other families discover it.
        </p>
        <Button asChild variant="secondary" size="lg" className="gap-2">
          <Link to="/add-service">
            <ReilyIconGlyph name="add-service" className="h-4 w-4 text-hunter" />
            Suggest a place
          </Link>
        </Button>
      </div>
    </div>
  )
}
