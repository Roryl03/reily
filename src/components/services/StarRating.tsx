import { cn } from '@/lib/utils'

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  label = 'Overall rating',
}: {
  value: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md'
  label?: string
}) {
  const sizeClass = size === 'sm' ? 'text-base' : 'text-xl'

  return (
    <div
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `${value} out of 5 stars` : label}
      className={cn('inline-flex items-center gap-0.5', sizeClass)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        if (readOnly) {
          return (
            <span
              key={star}
              aria-hidden
              className={filled ? 'text-gold' : 'text-sage-200'}
            >
              ★
            </span>
          )
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => onChange?.(star)}
            className={cn(
              'min-h-11 min-w-11 rounded-lg touch-scale focus-ring',
              filled ? 'text-gold' : 'text-sage-300 hover:text-gold/70',
            )}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
