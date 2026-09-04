import { cn } from '@/lib/utils'
import { AskReillyLogo } from './AskReillyLogo'

export function ReilyBrandMark({
  size = 'md',
  className,
  label = 'Ask Reilly',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}) {
  return <AskReillyLogo size={size} className={className} label={label} />
}

export function ReilyLogoWordmark({ className }: { className?: string }) {
  return <AskReillyLogo size="lg" className={className} />
}

export function ReilyLogoFull({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const logoSize =
    size === 'sm' ? 'sm' : size === 'xl' ? 'xl' : size === 'lg' ? 'lg' : 'md'
  return <AskReillyLogo size={logoSize} className={cn('mx-auto', className)} />
}

export { ReilyLogoMark } from './ReilyLogoMark'
