import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ReilyBrandMark({
  size = 'md',
  className,
  label = 'Reily',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}) {
  const sizes = {
    xs: { box: 'h-8 w-8 rounded-lg', icon: 16 },
    sm: { box: 'h-10 w-10 rounded-xl', icon: 20 },
    md: { box: 'h-14 w-14 rounded-2xl', icon: 28 },
    lg: { box: 'h-20 w-20 rounded-2xl', icon: 40 },
    xl: { box: 'h-24 w-24 rounded-3xl', icon: 48 },
  }
  const s = sizes[size]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center bg-hunter shadow-[0_2px_8px_rgba(53,94,59,0.25)]',
        s.box,
        className,
      )}
      role="img"
      aria-label={label}
    >
      <MapPin
        size={s.icon}
        strokeWidth={1.75}
        absoluteStrokeWidth
        className="text-cream-100"
        aria-hidden
      />
    </span>
  )
}

export function ReilyLogoWordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ReilyBrandMark size="sm" />
      <div>
        <p className="text-xl font-bold text-hunter leading-tight tracking-tight">Reily</p>
        <p className="text-xs text-sage-500 tracking-wide">Find places that understand</p>
      </div>
    </div>
  )
}
