import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReilyIconGlyph } from '@/components/icons/ReilyIconGlyph'
import { getCategoryIcon } from '@/components/icons/config'
import type { ReilyColorVariant } from '@/components/icons/types'

/** Inline styles matching ReilyIcon tiles on the home screen. */
const TILE_INLINE: Record<
  ReilyColorVariant,
  { background: string; boxShadow: string; color: string }
> = {
  sage: {
    background: '#dde8e2',
    boxShadow: '0 0 0 1px rgba(11, 61, 46, 0.12)',
    color: '#0b3d2e',
  },
  blue: {
    background: '#dde8e2',
    boxShadow: '0 0 0 1px rgba(138, 155, 121, 0.25)',
    color: '#0b3d2e',
  },
  terracotta: {
    background: '#fceeee',
    boxShadow: '0 0 0 1px rgba(233, 141, 141, 0.3)',
    color: '#20332d',
  },
  gold: {
    background: '#faf0df',
    boxShadow: '0 0 0 1px rgba(223, 161, 56, 0.35)',
    color: '#20332d',
  },
  lavender: {
    background: '#dde8e2',
    boxShadow: '0 0 0 1px rgba(138, 155, 121, 0.25)',
    color: '#0b3d2e',
  },
  cream: {
    background: '#ffffff',
    boxShadow: '0 0 0 1px #d7dfd3',
    color: '#20332d',
  },
}

function PinCategoryTile({
  category,
  tilePx,
  glyphPx,
}: {
  category: string
  tilePx: number | string
  glyphPx: number | string
}) {
  const { name, variant } = getCategoryIcon(category)
  const tile = TILE_INLINE[variant]
  const radius =
    typeof tilePx === 'number' ? Math.round(tilePx * 0.36) : '36%'

  return createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: typeof tilePx === 'number' ? tilePx : '100%',
        height: typeof tilePx === 'number' ? tilePx : '100%',
        borderRadius: radius,
        background: tile.background,
        boxShadow: `${tile.boxShadow}, 0 1px 2px rgba(11, 61, 46, 0.08)`,
        flexShrink: 0,
        lineHeight: 0,
        boxSizing: 'border-box',
      },
    },
    createElement(ReilyIconGlyph, {
      name,
      className: undefined,
      style: {
        width: glyphPx,
        height: glyphPx,
        color: tile.color,
        display: 'block',
      },
    }),
  )
}

/** Home-screen style category tile markup for map pin heads. */
export function getCategoryPinTileMarkup(
  category: string,
  selected = false,
  embedded = false,
): string {
  const tilePx = embedded ? '100%' : selected ? 20 : 18
  const glyphPx = embedded ? '62%' : selected ? 11 : 10
  return renderToStaticMarkup(
    createElement(PinCategoryTile, { category, tilePx, glyphPx }),
  )
}

/** Icon tile placement inside the pin SVG viewBox (0 0 30 36). */
export const PIN_TILE_VIEWBOX = {
  x: 10,
  y: 5,
  size: 10,
} as const
