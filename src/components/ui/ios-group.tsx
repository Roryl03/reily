import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** iOS-style inset grouped section */
export function IOSGroup({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-2', className)}>
      {title && (
        <h2 className="ios-group-label px-4">{title}</h2>
      )}
      <div className="ios-group">{children}</div>
    </section>
  )
}

export function IOSRow({
  children,
  className,
  onClick,
  href,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
}) {
  const classes = cn(
    'ios-row touch-scale',
    (onClick || href) && 'cursor-pointer active:bg-sage-50',
    className,
  )

  if (href) {
    return (
      <Link to={href} className={classes}>
        <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-sage-300" aria-hidden />
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, 'w-full text-left')}>
        <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-sage-300" aria-hidden />
      </button>
    )
  }

  return <div className={classes}>{children}</div>
}
