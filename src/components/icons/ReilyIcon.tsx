import { cn } from '@/lib/utils'
import { ReilyIconGlyph } from './ReilyIconGlyph'
import {
  GLYPH_SIZE,
  TILE_BASE,
  TILE_SIZE,
  VARIANT_STYLES,
  type ReilyColorVariant,
  type ReilyIconName,
  type ReilyIconSize,
} from './types'

export interface ReilyIconProps {
  name: ReilyIconName
  size?: ReilyIconSize
  variant?: ReilyColorVariant
  tile?: boolean
  className?: string
  glyphClassName?: string
  label?: string
}

export function ReilyIcon({
  name,
  size = 'md',
  variant = 'sage',
  tile = true,
  className,
  glyphClassName,
  label,
}: ReilyIconProps) {
  const styles = VARIANT_STYLES[variant]
  const glyph = (
    <ReilyIconGlyph
      name={name}
      className={cn(GLYPH_SIZE[size], styles.glyph, glyphClassName)}
    />
  )

  if (!tile) {
    return (
      <span className={cn('inline-flex', className)} aria-hidden={!label} aria-label={label}>
        {glyph}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center shrink-0',
        TILE_SIZE[size],
        TILE_BASE,
        styles.tile,
        className,
      )}
      aria-hidden={!label}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {glyph}
    </span>
  )
}

export function ReilyIconInline({
  name,
  className,
  variant = 'sage',
}: {
  name: ReilyIconName
  className?: string
  variant?: ReilyColorVariant
}) {
  return (
    <ReilyIconGlyph
      name={name}
      className={cn('h-4 w-4 shrink-0', VARIANT_STYLES[variant].glyph, className)}
    />
  )
}
