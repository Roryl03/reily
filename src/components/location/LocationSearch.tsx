import { Loader2, Search } from 'lucide-react'
import { useState } from 'react'
import { ReilyIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'

export function LocationSearch({
  onSuccess,
  compact = false,
}: {
  onSuccess?: () => void
  compact?: boolean
}) {
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
      <div className={compact ? 'flex gap-2' : 'space-y-3'}>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-sage-400"
            aria-hidden
          />
          <Input
            variant="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Town or postcode"
            autoComplete="off"
            className="min-h-[50px]"
            aria-label="Town or postcode search"
          />
        </div>
        <Button
          onClick={handleSearch}
          type="button"
          size="lg"
          className={compact ? 'shrink-0' : 'w-full'}
        >
          {compact ? 'Go' : 'Find my area'}
        </Button>
      </div>
      {error && (
        <p className="text-base text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function LocationButton({
  onComplete,
  variant = 'default',
  className,
  label = 'Use my current location',
  loadingLabel = 'Finding your location…',
}: {
  onComplete?: () => void
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
  label?: string
  loadingLabel?: string
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
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          {loadingLabel}
        </>
      ) : (
        <>
          <ReilyIcon
            name="location"
            size="xs"
            variant={variant === 'default' ? 'cream' : 'sage'}
            className={variant === 'default' ? '!bg-white/20' : undefined}
          />
          {label}
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
