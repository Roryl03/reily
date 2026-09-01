import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { ReilyIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'

export function LocationSearch({ onSuccess }: { onSuccess?: () => void }) {
  const { searchByTownOrPostcode } = useApp()
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const handleSearch = () => {
    const found = searchByTownOrPostcode(query)
    if (found) {
      setError('')
      onSuccess?.()
    } else {
      setError('Try a town like Belfast, Ballymena, or a postcode such as BT41.')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <ReilyIcon name="search" size="sm" variant="cream" tile={false} glyphClassName="text-sage-600" />
          </span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter a town or postcode"
            className="pl-10"
            aria-label="Town or postcode search"
          />
        </div>
        <Button onClick={handleSearch} type="button">
          Search
        </Button>
      </div>
      {error && <p className="text-sm text-terracotta" role="alert">{error}</p>}
    </div>
  )
}

export function LocationButton({
  onComplete,
  variant = 'default',
  className,
}: {
  onComplete?: () => void
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}) {
  const { requestCurrentLocation, locationLoading } = useApp()

  return (
    <Button
      variant={variant}
      className={className}
      onClick={async () => {
        await requestCurrentLocation()
        onComplete?.()
      }}
      disabled={locationLoading}
    >
      {locationLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Finding your location…
        </>
      ) : (
        <>
          <ReilyIcon
            name="location"
            size="xs"
            variant={variant === 'default' ? 'cream' : 'sage'}
            className={variant === 'default' ? '!bg-white/20' : undefined}
          />
          Use my current location
        </>
      )}
    </Button>
  )
}

export function LocationDisplay() {
  const { location } = useApp()
  if (!location) return null

  return (
    <p className="flex items-center gap-2 text-sm text-sage-600">
      <ReilyIcon name="location" size="xs" variant="sage" tile={false} />
      <span>{location.label}</span>
      {location.isDemo && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">Demo location</span>
      )}
    </p>
  )
}
