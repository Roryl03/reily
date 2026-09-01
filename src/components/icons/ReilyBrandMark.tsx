import { cn } from '@/lib/utils'

export function ReilyBrandMark({
  size = 'md',
  className,
  label = 'Reily',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}) {
  const sizes = {
    sm: { box: 'h-10 w-10 rounded-xl', icon: 28 },
    md: { box: 'h-14 w-14 rounded-2xl', icon: 36 },
    lg: { box: 'h-20 w-20 rounded-2xl', icon: 52 },
    xl: { box: 'h-24 w-24 rounded-3xl', icon: 64 },
  }
  const s = sizes[size]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center bg-sage-500 shadow-sm',
        s.box,
        className,
      )}
      role="img"
      aria-label={label}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        <path
          d="M10 28c3-8 8-12 14-12s11 4 14 12"
          stroke="#F5F0E8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M24 10c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Z"
          fill="#F5F0E8"
        />
        <circle cx="24" cy="17" r="3.5" fill="#6B8F71" stroke="#F5F0E8" strokeWidth="1.5" />
      </svg>
    </span>
  )
}

export function ReilyLogoWordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ReilyBrandMark size="sm" />
      <div>
        <p className="text-xl font-bold text-sage-700 leading-tight">Reily</p>
        <p className="text-xs text-sage-500">Find places that understand</p>
      </div>
    </div>
  )
}
