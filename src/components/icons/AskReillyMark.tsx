import { cn } from '@/lib/utils'

export const ASK_REILLY_MARK_SRC = '/ask-reilly-mark.png'

const SIZES = {
  xs: 'h-8 w-8',
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
  xl: 'h-24 w-24',
} as const

/** Icon-only Ask Reilly mark — favicon, loading, compact contexts */
export function AskReillyMark({
  size = 'md',
  className,
  label = 'Ask Reilly',
}: {
  size?: keyof typeof SIZES
  className?: string
  label?: string
}) {
  return (
    <img
      src={ASK_REILLY_MARK_SRC}
      alt={label}
      className={cn('object-contain', SIZES[size], className)}
      decoding="async"
    />
  )
}
