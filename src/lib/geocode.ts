import { normalizePostcode } from '@/lib/locationFormat'

export interface GeocodeResult {
  latitude: number
  longitude: number
  displayName?: string
  source: 'postcode' | 'address'
}

function buildAddressQuery(
  address: string,
  town: string,
  postcode: string,
): string {
  return [address, town, normalizePostcode(postcode), 'Northern Ireland']
    .filter(Boolean)
    .join(', ')
}

function isGenericGeocodeResult(displayName?: string): boolean {
  if (!displayName) return true
  const lower = displayName.toLowerCase()
  if (lower === 'northern ireland' || lower.startsWith('northern ireland /')) return true
  if (lower === 'ireland' || lower === 'united kingdom') return true
  // County-only results are too vague for a street pin
  if (/^county .+, northern ireland/i.test(displayName)) return true
  return false
}

async function geocodeViaApi(query: string): Promise<GeocodeResult | null> {
  const url = `/api/geocode?q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as {
    lat?: number
    lng?: number
    displayName?: string
  }
  if (typeof data.lat !== 'number' || typeof data.lng !== 'number') return null
  if (isGenericGeocodeResult(data.displayName)) return null
  return {
    latitude: data.lat,
    longitude: data.lng,
    displayName: data.displayName,
    source: 'address',
  }
}

/** UK postcode centroid via postcodes.io — reliable for NI postcodes. */
async function geocodeViaPostcodesIo(postcode: string): Promise<GeocodeResult | null> {
  const normalized = normalizePostcode(postcode)
  if (!normalized || normalized === 'N/A') return null

  const res = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized.replace(/\s+/g, ''))}`,
  )
  if (!res.ok) return null

  const data = (await res.json()) as {
    status?: number
    result?: { latitude?: number; longitude?: number }
    terminated?: { latitude?: number; longitude?: number }
  }

  const hit = data.result ?? data.terminated
  if (!hit) return null

  const { latitude, longitude } = hit
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null
  return { latitude, longitude, source: 'postcode' }
}

/**
 * Resolve map coordinates from address + postcode.
 * Postcode lookup is primary (accurate across NI); street geocoding refines when available.
 */
export async function geocodeAddress(
  address: string,
  town: string,
  postcode: string,
  _county: string,
): Promise<GeocodeResult | null> {
  const postcodeResult = await geocodeViaPostcodesIo(postcode)

  try {
    const query = buildAddressQuery(address, town, postcode)
    const streetResult = await geocodeViaApi(query)
    if (streetResult) return streetResult
  } catch {
    // Offline or API unavailable — postcode result is enough
  }

  return postcodeResult
}
