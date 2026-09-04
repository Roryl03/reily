import {
  HomeCategoryStrip,
  HomeHero,
  HomeLocationPill,
  HomeNearbySection,
  HomeQuickActions,
  HomeSupportSpotlight,
} from '@/components/home'
import { ListYourFacilityCta } from '@/components/services/ListYourFacilityCta'
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

      <ListYourFacilityCta />
    </div>
  )
}
