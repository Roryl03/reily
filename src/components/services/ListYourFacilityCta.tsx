import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type ListYourFacilityCtaProps = {
  className?: string
  /** card = home-style panel; bare = inline text only */
  variant?: 'card' | 'bare'
  linkLabel?: string
}

export function ListYourFacilityCta({
  className,
  variant = 'card',
  linkLabel = 'Submit your facility',
}: ListYourFacilityCtaProps) {
  const link = (
    <Link
      to="/list-facility"
      className="inline-flex items-center gap-1 font-semibold text-hunter underline decoration-hunter/30 underline-offset-2 hover:decoration-hunter focus-ring rounded-sm"
    >
      {linkLabel}
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </Link>
  )

  if (variant === 'bare') {
    return (
      <p className={cn('text-[15px] leading-relaxed text-sage-600', className)}>
        Want to get your facility on Reilly? {link}
      </p>
    )
  }

  return (
    <div className={cn('ios-card p-4 text-center space-y-2 sm:p-5', className)}>
      <p className="text-[15px] leading-relaxed text-sage-600">
        Want to get your facility on Reilly?
      </p>
      <p className="text-[15px] text-sage-600">{link}</p>
    </div>
  )
}
