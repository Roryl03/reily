import { ReilyIcon } from '@/components/icons'

export function SupportHero() {
  return (
    <section
      aria-labelledby="support-hero-heading"
      className="relative overflow-hidden rounded-3xl border border-lavender/20 bg-gradient-to-br from-lavender-light via-cream-50 to-blue-muted-light px-5 py-6 sm:px-7 sm:py-8"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-lavender/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-blue-muted/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
        <ReilyIcon name="support-services" size="lg" variant="lavender" label="" />
        <div className="space-y-3">
          <p className="text-sm font-medium text-lavender">A gentle place to start</p>
          <h1 id="support-hero-heading" className="text-2xl font-semibold leading-snug text-sage-900 sm:text-3xl">
            You&apos;re doing your best — and help is here
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-sage-700">
            Navigating SEN support can feel overwhelming. Take a breath. We&apos;ve gathered trusted
            contacts across Northern Ireland so you can find the right help, one step at a time.
          </p>
          <p className="text-sm text-sage-600">
            Start with a category below, or search if you already know what you need.
          </p>
        </div>
      </div>
    </section>
  )
}
