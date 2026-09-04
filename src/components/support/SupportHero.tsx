export function SupportHero() {
  return (
    <section
      aria-labelledby="support-hero-heading"
      className="ios-card relative overflow-hidden px-4 py-5 sm:px-7 sm:py-8"
    >
      <div className="relative space-y-2.5">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-sage-accent">
          A gentle place to start
        </p>
        <h1
          id="support-hero-heading"
          className="font-display text-3xl leading-[1.15] text-sage-900 sm:text-4xl"
        >
          You&apos;re doing your best - and help is here
        </h1>
        <p className="text-[15px] leading-relaxed text-sage-600 sm:max-w-xl">
          Navigating SEN support can feel overwhelming. We&apos;ve gathered trusted contacts so
          you can find the right help, one step at a time.
        </p>
      </div>
    </section>
  )
}
