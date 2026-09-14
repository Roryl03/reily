import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReilyIconGlyph } from '@/components/icons/ReilyIconGlyph'
import { getCategoryIcon } from '@/components/icons/config'
import type { Category } from '@/types/service'

/** Muted, distinct pin colours — easy on the eye, still readable with white icons. */
export const MAP_PIN_PALETTE: Record<
  Category,
  { fill: string; ring: string }
> = {
  Activities: { fill: '#3D6B52', ring: '#B8D4C4' },
  'Food and drink': { fill: '#A86B58', ring: '#E8D0C8' },
  'Parks and outdoors': { fill: '#4F8089', ring: '#BFD8DD' },
  'Support services': { fill: '#6E6794', ring: '#CDC8E0' },
  Shopping: { fill: '#9A7654', ring: '#E2D4C4' },
  Cinema: { fill: '#5A6F8F', ring: '#C4D0E4' },
  'Soft play': { fill: '#A8864A', ring: '#E4DAC4' },
  Accommodation: { fill: '#5F8578', ring: '#C4DDD4' },
  Education: { fill: '#5B7890', ring: '#C0D0E0' },
  Healthcare: { fill: '#6E8560', ring: '#CDDCC4' },
  Haircuts: { fill: '#94685E', ring: '#E4CCC8' },
  'Community groups': { fill: '#5C6570', ring: '#D0D4D8' },
}

const DEFAULT_PIN = { fill: '#3D6B52', ring: '#B8D4C4' }

export function getMapPinPalette(category: string): { fill: string; ring: string } {
  return MAP_PIN_PALETTE[category as Category] ?? DEFAULT_PIN
}

function PinIcon({ category, size }: { category: string; size: number }) {
  const { name } = getCategoryIcon(category)
  return createElement(ReilyIconGlyph, {
    name,
    style: {
      width: size,
      height: size,
      color: '#ffffff',
      display: 'block',
      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))',
    },
  })
}

/** White category icon markup for map pin discs. */
export function getPinIconMarkup(category: string, sizePx: number): string {
  return renderToStaticMarkup(createElement(PinIcon, { category, size: sizePx }))
}

export const MAP_PIN_SIZE = {
  default: 36,
  selected: 42,
  iconDefault: 16,
  iconSelected: 18,
} as const
