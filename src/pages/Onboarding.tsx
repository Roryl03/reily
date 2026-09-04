import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AskReillyMark } from '@/components/icons'
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome'
import { useApp } from '@/context/AppContext'
import { DEMO_LOCATION } from '@/types/service'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding, locationError, setLocation } = useApp()

  const finish = () => {
    completeOnboarding()
    navigate('/')
  }

  const useDemo = () => {
    setLocation(DEMO_LOCATION)
    finish()
  }

  return (
    <OnboardingWelcome
      onLocationSuccess={finish}
      locationError={locationError}
      onUseDemo={useDemo}
    />
  )
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { preferences, locationLoading } = useApp()

  if (!preferences.onboardingComplete) {
    return <OnboardingPage />
  }

  if (locationLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-gradient-to-b from-hunter-light/30 to-cream-200 px-6 safe-top safe-bottom">
        <AskReillyMark size="lg" />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-hunter" aria-label="Loading" />
          <p className="text-[17px] font-medium text-sage-800">Finding your location…</p>
          <p className="text-[15px] text-sage-500 text-center max-w-xs">
            This will only take a moment
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
