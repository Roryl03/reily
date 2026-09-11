import { IRISH_COUNTIES } from '@/data/irishCounties'
import { NI_TOWNS } from '@/types/service'

/** Canonical spellings for towns across NI (lowercase key → display form). */
const TOWN_CANONICAL: Record<string, string> = Object.fromEntries(
  Object.values(NI_TOWNS).map(({ label }) => {
    const base = label.split('/')[0]?.trim() ?? label
    return [base.toLowerCase(), base]
  }),
)

const EXTRA_TOWNS: Record<string, string> = {
  omagh: 'Omagh',
  enniskillen: 'Enniskillen',
  newry: 'Newry',
  lisburn: 'Lisburn',
  bangor: 'Bangor',
  newtownards: 'Newtownards',
  craigavon: 'Craigavon',
  lurgan: 'Lurgan',
  portadown: 'Portadown',
  armagh: 'Armagh',
  downpatrick: 'Downpatrick',
  banbridge: 'Banbridge',
  cookstown: 'Cookstown',
  dungannon: 'Dungannon',
  magherafelt: 'Magherafelt',
  strabane: 'Strabane',
  carrickfergus: 'Carrickfergus',
  larne: 'Larne',
  ballymoney: 'Ballymoney',
  ballycastle: 'Ballycastle',
  portrush: 'Portrush',
  portstewart: 'Portstewart',
  'crossgar': 'Crossgar',
  'holywood': 'Holywood',
  'comber': 'Comber',
  'antrim town': 'Antrim',
}

Object.assign(TOWN_CANONICAL, EXTRA_TOWNS)

const LOWERCASE_WORDS = new Set(['and', 'of', 'the', 'in', 'on', 'at', 'de', 'la', 'an'])
const ADDRESS_ABBREVIATIONS: Record<string, string> = {
  st: 'St',
  rd: 'Rd',
  dr: 'Dr',
  ave: 'Ave',
  ln: 'Ln',
  ct: 'Ct',
  pl: 'Pl',
}

function titleCaseSegment(word: string): string {
  if (!word) return word
  const lower = word.toLowerCase()

  if (ADDRESS_ABBREVIATIONS[lower]) return ADDRESS_ABBREVIATIONS[lower]

  if (lower.startsWith("mc") && lower.length > 2) {
    return `Mc${lower.charAt(2).toUpperCase()}${lower.slice(3)}`
  }
  if (lower.startsWith("mac") && lower.length > 3) {
    return `Mac${lower.charAt(3).toUpperCase()}${lower.slice(4)}`
  }
  if (lower.startsWith("o'") && lower.length > 2) {
    return `O'${lower.charAt(2).toUpperCase()}${lower.slice(3)}`
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/** UK (BT…) and Irish Eircode postcodes → standard uppercase form with a space. */
export function normalizePostcode(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (trimmed.toUpperCase() === 'N/A') return 'N/A'

  const cleaned = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!cleaned) return ''

  // Irish Eircode: 3 chars + 4 chars (e.g. D02 X285)
  if (/^[A-Z]\d{2}[A-Z0-9]{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  }

  // UK postcode: outward + inward (last 3 chars)
  if (cleaned.length >= 5) {
    const inward = cleaned.slice(-3)
    const outward = cleaned.slice(0, -3)
    return `${outward} ${inward}`
  }

  return cleaned
}

/** UK or Irish Eircode format (after normalisation). */
export function isValidPostcode(postcode: string): boolean {
  const normalized = normalizePostcode(postcode)
  if (!normalized || normalized === 'N/A') return normalized === 'N/A'

  if (/^[A-Z]\d{2}\s[A-Z0-9]{4}$/.test(normalized)) return true

  return /^[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}$/.test(normalized)
}

/** Town or area name → canonical capitalisation (Belfast, Omagh, Derry, etc.). */
export function normalizeTown(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''

  const key = trimmed.toLowerCase()
  if (TOWN_CANONICAL[key]) return TOWN_CANONICAL[key]

  // "belfast area", "mid ulster" — title-case each word
  return trimmed
    .split(/(\s+|\/|-)/)
    .map((part, index) => {
      if (/^[\s/-]+$/.test(part)) return part
      if (index > 0 && LOWERCASE_WORDS.has(part.toLowerCase())) {
        return part.toLowerCase()
      }
      const canonical = TOWN_CANONICAL[part.toLowerCase()]
      return canonical ?? titleCaseSegment(part)
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Street address → house number preserved, words title-cased. */
export function normalizeAddress(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  if (trimmed.toLowerCase() === 'no fixed location') return 'No fixed location'

  return trimmed
    .split(' ')
    .map((word, index) => {
      if (/^\d+[A-Z]?$/i.test(word)) return word.toUpperCase()
      if (index > 0 && LOWERCASE_WORDS.has(word.toLowerCase())) {
        return word.toLowerCase()
      }
      return titleCaseSegment(word)
    })
    .join(' ')
}

/** Match county against the official list (Antrim, Londonderry, etc.). */
export function normalizeCounty(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return 'Antrim'
  const match = IRISH_COUNTIES.find((c) => c.toLowerCase() === trimmed.toLowerCase())
  return match ?? titleCaseSegment(trimmed)
}

export interface LocationFields {
  address: string
  town: string
  county: string
  postcode: string
  noFixedLocation?: boolean
}

export function normalizeLocationFields(fields: LocationFields): LocationFields {
  if (fields.noFixedLocation) {
    return {
      ...fields,
      address: 'No fixed location',
      town: fields.town.trim() ? normalizeTown(fields.town) : fields.town,
      county: normalizeCounty(fields.county),
      postcode: fields.postcode.trim()
        ? normalizePostcode(fields.postcode)
        : 'N/A',
    }
  }

  return {
    ...fields,
    address: normalizeAddress(fields.address),
    town: normalizeTown(fields.town),
    county: normalizeCounty(fields.county),
    postcode: normalizePostcode(fields.postcode),
  }
}
