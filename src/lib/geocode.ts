import { normalizePostcode } from '@/lib/locationFormat'

export interface GeocodeResult {
  latitude: number
  longitude: number
  displayName?: string
}

function buildAddressQuery(
  address: string,
  town: string,
  postcode: string,
  county: string,
): string {
  return [address, town, normalizePostcode(postcode), county, 'Northern Ireland']
    .filter(Boolean)
    .join(', ')
}

async function geocodeViaApi(query: string): Promise<GeocodeResult | null> {
  const url = `/api/geocode?q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as { lat?: number; lng?: number; displayName?: string }
  if (typeof data.lat !== 'number' || typeof data.lng !== 'number') return null
  return { latitude: data.lat, longitude: data.lng, displayName: data.displayName }
}

/** UK postcode centroid via postcodes.io (browser-safe fallback). */
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
  }
  if (data.status !== 200 || !data.result) return null

  const { latitude, longitude } = data.result
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null
  return { latitude, longitude }
}

/**
 * Resolve coordinates from a full street address + postcode.
 * Tries our geocode API first (Nominatim), then postcodes.io as fallback.
 */
export async function geocodeAddress(
  address: string,
  town: string,
  postcode: string,
  county: string,
): Promise<GeocodeResult | null> {
  const query = buildAddressQuery(address, town, postcode, county)

  try {
    const fromApi = await geocodeViaApi(query)
    if (fromApi) return fromApi
  } catch {
    // API unavailable (e.g. offline dev) — try fallback
  }

  try {
    return await geocodeViaPostcodesIo(postcode)
  } catch {
    return null
  }
}
