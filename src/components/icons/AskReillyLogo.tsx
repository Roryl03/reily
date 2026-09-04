import { cn } from '@/lib/utils'

export const ASK_REILLY_LOGO_SRC = '/ask-reilly-logo.png'

const HEIGHTS = {
  xs: 'h-8',
  sm: 'h-11',
  md: 'h-14',
  lg: 'h-20 sm:h-[5.5rem]',
  xl: 'h-24 sm:h-28',
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
      className={cn(
        'w-auto max-w-[min(100%,20rem)] object-contain object-left',
        HEIGHTS[size],
        className,
      )}
      decoding="async"
    />
  )
}
