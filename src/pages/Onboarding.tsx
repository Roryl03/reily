import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReilyBrandMark, ReilyIcon } from '@/components/icons'
import { LocationButton, LocationSearch } from '@/components/location/LocationSearch'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { DEMO_LOCATION } from '@/types/service'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding, locationError, setLocation } = useApp()
  const [showSearch, setShowSearch] = useState(false)

  const finish = () => {
    completeOnboarding()
    navigate('/')
  }

  const useDemo = () => {
    setLocation(DEMO_LOCATION)
    finish()
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-200 px-6 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <ReilyBrandMark size="lg" className="mx-auto" />
          <h1 className="text-3xl font-bold text-sage-800">Find places that understand.</h1>
          <p className="text-lg text-sage-600">
            Discover inclusive activities, services and venues near you.
          </p>
        </div>

        <div className="space-y-4">
          <LocationButton
            onComplete={() => {
              if (!locationError) finish()
            }}
            className="w-full min-h-12 text-base rounded-2xl"
          />

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => setShowSearch(true)}
          >
            Enter a town or postcode
          </Button>

          {showSearch && (
            <div className="text-left">
              <LocationSearch onSuccess={finish} />
            </div>
          )}

          {locationError && (
            <div className="rounded-xl bg-terracotta-light p-4 text-left space-y-3" role="alert">
              <p className="text-sm text-sage-800">{locationError}</p>
              <LocationSearch onSuccess={finish} />
              <Button variant="outline" size="sm" onClick={useDemo} className="w-full">
                <ReilyIcon name="location" size="xs" variant="sage" tile={false} />
                Use demo location (Randalstown)
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-sage-500">
          Reily uses your approximate location to find nearby places. Your exact coordinates are never shown publicly.
        </p>
      </div>
    </div>
  )
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { preferences, locationLoading } = useApp()

  if (!preferences.onboardingComplete) {
    return <OnboardingPage />
  }

  if (locationLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sage-500" aria-label="Loading" />
        <p className="text-sm text-sage-600">Finding your location…</p>
      </div>
    )
  }

  return <>{children}</>
}
