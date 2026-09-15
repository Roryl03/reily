import { ReilyLogoFull } from '@/components/icons'
import { track } from '@/lib/analytics'
import { setStoredAudience } from '@/lib/visitor'
import { AUDIENCE_OPTIONS, type AudienceType } from '@/types/analytics'
import { cn } from '@/lib/utils'

export function OnboardingAudience({ onComplete }: { onComplete: () => void }) {
  const choose = (id: AudienceType) => {
    setStoredAudience(id)
    track('AUDIENCE_SELECTED', { audience: id })
    onComplete()
  }

  const skip = () => {
    track('AUDIENCE_SKIPPED')
    onComplete()
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-b from-hunter-light/40 via-cream-200 to-cream-200 safe-top safe-bottom">
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8 sm:py-12">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <ReilyLogoFull size="lg" />
          </div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-hunter/80">
            One quick question
          </p>
          <h1 className="font-display text-3xl leading-tight text-sage-900">
            What best describes you?
          </h1>
          <p className="text-[16px] leading-relaxed text-sage-600">
            This helps us understand who Ask Reilly is helping. Tap an option to continue — no
            sign-up required.
          </p>
        </div>

        <div className="mt-8 flex-1 space-y-2">
          {AUDIENCE_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => choose(id)}
              className={cn(
                'w-full rounded-[14px] border border-sage-200 bg-white px-4 py-3.5',
                'text-left text-[16px] font-medium text-sage-900 touch-scale focus-ring',
                'hover:border-hunter/30 hover:bg-hunter-light/20',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={skip}
          className="mt-6 w-full py-3 text-[15px] font-medium text-sage-500 touch-scale focus-ring"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
