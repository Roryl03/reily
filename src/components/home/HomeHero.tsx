function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-6 top-4 h-36 w-36 rounded-full bg-hunter/6 blur-3xl" />
      <div className="absolute -left-4 bottom-0 h-28 w-28 rounded-full bg-blue-muted/8 blur-3xl" />
    </div>
  )
}

export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="ios-card relative overflow-hidden px-4 py-5 sm:px-7 sm:py-8"
    >
      <HeroBackdrop />

      <div className="relative space-y-2.5 sm:space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-hunter/80">
          Welcome
        </p>
        <h1
          id="home-hero-heading"
          className="text-[28px] font-bold leading-[1.15] tracking-tight text-sage-900 sm:text-3xl"
        >
          Take your time — we&apos;ll help you find your way
        </h1>
        <p className="text-[15px] leading-relaxed text-sage-600 sm:max-w-md sm:text-base">
          Support, quiet outings, and places that understand — start wherever feels right.
        </p>
      </div>
    </section>
  )
}
