import { ReilyIcon } from '@/components/icons'

/** Soft decorative shapes — hunter green at low opacity, keeps the palette calm */
function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-6 top-4 h-36 w-36 rounded-full bg-hunter/8 blur-2xl" />
      <div className="absolute -left-4 bottom-0 h-28 w-28 rounded-full bg-blue-muted/10 blur-2xl" />
      <div className="absolute right-12 bottom-6 h-20 w-20 rounded-full bg-lavender/10 blur-xl" />
      <svg
        className="absolute right-0 top-0 h-full w-2/5 max-w-[220px] opacity-[0.07] text-hunter"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <path d="M40 160c30-80 70-120 120-100s60 90 20 120-90-10-140-20z" />
      </svg>
    </div>
  )
}

/** Floating accent icons — each keeps its own colour; hunter frames the scene */
function HeroIconCluster() {
  return (
    <div className="relative mx-auto shrink-0 sm:mx-0" aria-hidden>
      <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
        <div className="absolute inset-0 rounded-full bg-white/60 ring-1 ring-hunter/10 shadow-sm" />
        <ReilyIcon name="compass" size="xl" variant="sage" label="" />
        <div className="absolute -left-2 top-1">
          <ReilyIcon name="support-services" size="sm" variant="blue" label="" />
        </div>
        <div className="absolute -right-2 top-5">
          <ReilyIcon name="quiet-hour" size="sm" variant="lavender" label="" />
        </div>
        <div className="absolute bottom-0 left-2">
          <ReilyIcon name="map" size="sm" variant="gold" label="" />
        </div>
        <div className="absolute bottom-2 -right-1">
          <ReilyIcon name="favourites" size="sm" variant="terracotta" label="" />
        </div>
      </div>
    </div>
  )
}

export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative overflow-hidden rounded-3xl border border-hunter/10 bg-gradient-to-br from-hunter-light via-cream-50 to-blue-muted-light/40 px-5 py-6 sm:px-7 sm:py-8"
    >
      <HeroBackdrop />

      <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
        <HeroIconCluster />
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-medium text-hunter">Welcome to Reily</p>
          <h1
            id="home-hero-heading"
            className="text-2xl font-semibold leading-snug text-sage-900 sm:text-3xl"
          >
            Take your time — we&apos;ll help you find your way
          </h1>
          <p className="max-w-md text-base leading-relaxed text-sage-700">
            Whether you need support, a quiet outing, or a place that understands — start wherever
            feels right. No rush.
          </p>
        </div>
      </div>
    </section>
  )
}
