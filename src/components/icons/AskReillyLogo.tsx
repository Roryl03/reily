import { cn } from '@/lib/utils'

export const ASK_REILLY_LOGO_SRC = '/ask-reilly-logo.png'

const HEIGHTS = {
  xs: 'h-6',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14 sm:h-16',
  xl: 'h-20',
} as const

export function AskReillyLogo({
  size = 'md',
  className,
  label = 'Ask Reilly',
}: {
  size?: keyof typeof HEIGHTS
  className?: string
  label?: string
}) {
  return (
    <img
      src={ASK_REILLY_LOGO_SRC}
      alt={label}
      className={cn('w-auto max-w-full object-contain object-left', HEIGHTS[size], className)}
      decoding="async"
    />
  )
}
