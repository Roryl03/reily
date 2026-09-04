import { MapPin, Navigation, Search } from 'lucide-react'
import { ReilyIcon, ReilyLogoFull } from '@/components/icons'
import { LocationButton, LocationSearch } from '@/components/location/LocationSearch'
import { cn } from '@/lib/utils'

function WelcomeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-8 top-12 h-48 w-48 rounded-full bg-hunter/8 blur-3xl" />
      <div className="absolute -left-6 bottom-24 h-40 w-40 rounded-full bg-blue-muted/10 blur-3xl" />
      <div className="absolute right-8 bottom-16 h-28 w-28 rounded-full bg-lavender/10 blur-2xl" />
    </div>
  )
}

/** Friendly icon cluster - shows users what Reilly is for */
function WelcomeIconCluster() {
  return (
    <div className="flex justify-center gap-4 py-2" aria-hidden>
      <div className="flex flex-col items-center gap-1.5">
        <ReilyIcon name="support-services" size="md" variant="blue" label="" />
        <span className="text-[11px] font-medium text-sage-500">Support</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <ReilyIcon name="explore" size="md" variant="gold" label="" />
        <span className="text-[11px] font-medium text-sage-500">Explore</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <ReilyIcon name="map" size="md" variant="sage" label="" />
        <span className="text-[11px] font-medium text-sage-500">Map</span>
      </div>
    </div>
  )
}

export function OnboardingWelcome({
  onLocationSuccess,
  locationError,
  onUseDemo,
}: {
  onLocationSuccess: () => void
  locationError: string | null
  onUseDemo: () => void
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-b from-hunter-light/40 via-cream-200 to-cream-200 safe-top safe-bottom">
      <WelcomeBackdrop />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8 sm:py-12">
        {/* Welcome header */}
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <ReilyLogoFull size="lg" />
          </div>
          <div className="space-y-2 pt-1">
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-sage-900 sm:text-3xl">
              You&apos;re in the right place
            </h1>
            <p className="text-[17px] leading-relaxed text-sage-600">
              Reilly helps families find inclusive places and support across Northern Ireland.
            </p>
          </div>
          <WelcomeIconCluster />
        </div>

        {/* Location step */}
        <div className="mt-8 flex-1 space-y-4">
          <div className="ios-card space-y-1 p-5 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-hunter/80">
              One quick step
            </p>
            <h2 className="text-[20px] font-semibold text-sage-900">
              Where are you based?
            </h2>
            <p className="text-[15px] leading-relaxed text-sage-600">
              So we can show places and support near you. Pick whichever feels easiest -
              there&apos;s no wrong choice.
            </p>
          </div>

          {/* Option 1: GPS */}
          <div className="ios-card overflow-hidden">
            <div className="flex items-start gap-4 p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-hunter-light">
                <Navigation className="h-7 w-7 text-hunter" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-1 text-left">
                <p className="text-[17px] font-semibold text-sage-900">Use my current location</p>
                <p className="text-[15px] text-sage-600 leading-snug">
                  The easiest option - tap below and allow location when asked.
                </p>
              </div>
            </div>
            <div className="border-t border-sage-100 px-5 pb-5 pt-4">
              <LocationButton
                onComplete={() => {
                  if (!locationError) onLocationSuccess()
                }}
                label="Yes, use my location"
                className="w-full min-h-[54px] text-[17px] rounded-[14px]"
              />
            </div>
          </div>

          {/* Option 2: Manual search */}
          <div className="ios-card p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-muted-light">
                <Search className="h-7 w-7 text-blue-muted" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-1 text-left">
                <p className="text-[17px] font-semibold text-sage-900">Or type your town</p>
                <p className="text-[15px] text-sage-600 leading-snug">
                  e.g. Belfast, Carrickfergus, or a postcode like BT41
                </p>
              </div>
            </div>
            <LocationSearch onSuccess={onLocationSuccess} />
          </div>

          {locationError && (
            <div
              className="ios-card border-l-4 border-l-terracotta p-5 text-left space-y-4"
              role="alert"
            >
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-terracotta mt-0.5" aria-hidden />
                <div className="space-y-1">
                  <p className="text-[17px] font-semibold text-sage-900">No worries - try another way</p>
                  <p className="text-[15px] text-sage-700">{locationError}</p>
                </div>
              </div>
              <LocationSearch onSuccess={onLocationSuccess} />
              <button
                type="button"
                onClick={onUseDemo}
                className={cn(
                  'w-full rounded-[14px] border border-sage-200 bg-white py-3.5',
                  'text-[15px] font-medium text-sage-700 touch-scale focus-ring',
                )}
              >
                Just show me around (demo area)
              </button>
            </div>
          )}
        </div>

        {/* Reassurance footer */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-3">
          <ReilyIcon name="support-services" size="sm" variant="lavender" label="" />
          <p className="text-[13px] leading-relaxed text-sage-600 text-left">
            Your location is only used to find nearby places. We never share your exact
            position publicly.
          </p>
        </div>
      </div>
    </div>
  )
}
