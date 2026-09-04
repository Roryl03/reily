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
  return <AskReillyLogo size="md" className={className} />
}

export function ReilyLogoFull({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const logoSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'
  return <AskReillyLogo size={logoSize} className={className} />
}

export { ReilyLogoMark } from './ReilyLogoMark'
