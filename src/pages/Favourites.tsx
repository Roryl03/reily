import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { MobilePageHeader } from '@/components/layout/MobilePageHeader'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { useApp } from '@/context/AppContext'
import { enrichService } from '@/lib/filters'

export function FavouritesPage() {
  const { favourites, services, location, isFavourite, toggleFavourite } = useApp()
  const [search, setSearch] = useState('')

  const favouriteServices = useMemo(() => {
    return services
      .filter((s) => favourites.includes(s.id))
      .map((s) => enrichService(s, location))
      .filter((s) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          s.town.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        )
      })
  }, [favourites, services, location, search])

  if (favourites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <ReilyIcon name="favourites" size="xl" variant="terracotta" label="Favourites" />
        <h1 className="text-2xl font-bold text-sage-900">Favourites</h1>
        <p className="max-w-sm text-sage-600">Save places you would like to remember.</p>
        <Button asChild>
          <Link to="/explore">Explore services</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <MobilePageHeader
        title="Saved"
        subtitle={`${favourites.length} ${favourites.length === 1 ? 'place' : 'places'}`}
      />
      <header className="hidden lg:block">
        <h1 className="text-2xl font-bold text-sage-900">Favourites</h1>
        <p className="text-sage-600">{favourites.length} saved places</p>
      </header>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search saved"
        aria-label="Search favourites"
      />

      {favouriteServices.length === 0 ? (
        <p className="text-center text-sage-600 py-8">No favourites match your search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favouriteServices.map((s) => (
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
