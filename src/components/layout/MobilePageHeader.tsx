import { cn } from '@/lib/utils'

export function MobilePageHeader({
  title,
  subtitle,
  className,
}: {
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <header className={cn('lg:hidden', className)}>
      <h1 className="ios-large-title">{title}</h1>
      {subtitle && <p className="ios-subtitle">{subtitle}</p>}
    </header>
  )
}
