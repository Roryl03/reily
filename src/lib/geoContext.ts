import { IRISH_COUNTIES } from '@/data/irishCounties'
import type { UserLocation } from '@/types/service'

/** Derive coarse geography from location label — never send raw lat/lng to analytics. */
export function coarseGeoFromLocation(location: UserLocation | null): {
  county?: string
  town?: string
} {
  if (!location?.label) return {}

  const label = location.label
  const townMatch = label.split(',')[0]?.trim()
  const town = townMatch && townMatch.length < 48 ? townMatch : undefined

  const lower = label.toLowerCase()
  let county: string | undefined

  for (const c of IRISH_COUNTIES) {
    if (lower.includes(c.toLowerCase())) {
      county = c
      break
    }
  }

  if (!county) {
    for (const [key, val] of Object.entries({
      belfast: 'Antrim',
      derry: 'Derry',
      londonderry: 'Derry',
      newry: 'Down',
      lisburn: 'Antrim',
      bangor: 'Down',
      omagh: 'Tyrone',
      enniskillen: 'Fermanagh',
      armagh: 'Armagh',
    })) {
      if (lower.includes(key)) {
        county = val
        break
      }
    }
  }

  return { county, town }
}
