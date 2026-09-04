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
        <p className="font-decorative text-2xl text-hunter leading-none">
          Welcome
        </p>
        <h1
          id="home-hero-heading"
          className="font-display text-3xl leading-[1.15] text-sage-900 sm:text-4xl"
        >
          Find inclusive places, support and trusted resources
        </h1>
        <p className="text-[15px] leading-relaxed text-sage-600 sm:max-w-md sm:text-base">
          For parents and carers - discover somewhere new and know what to expect before you go.
        </p>
      </div>
    </section>
  )
}
