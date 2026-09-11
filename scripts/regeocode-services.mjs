#!/usr/bin/env node
/**
 * One-off: re-geocode all services from postcodes and patch lat/lng in Supabase.
 * Usage: SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... node scripts/regeocode-services.mjs
 */

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

function normalizePostcode(raw) {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.toUpperCase() === 'N/A') return trimmed
  const cleaned = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.length >= 5) {
    return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`
  }
  return cleaned
}

async function geocodePostcode(postcode) {
  const normalized = normalizePostcode(postcode)
  const res = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized.replace(/\s+/g, ''))}`,
  )
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 200 || !data.result) return null
  return { lat: data.result.latitude, lng: data.result.longitude }
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

const listRes = await fetch(
  `${url}/rest/v1/services?select=id,name,postcode,no_fixed_location,source&source=neq.demo`,
  { headers },
)
const services = await listRes.json()
if (!Array.isArray(services)) {
  console.error(services)
  process.exit(1)
}

let updated = 0
let failed = 0

for (const service of services) {
  if (service.no_fixed_location) continue
  const coords = await geocodePostcode(service.postcode)
  if (!coords) {
    console.warn('FAIL', service.name, service.postcode)
    failed++
    continue
  }

  const patchRes = await fetch(`${url}/rest/v1/services?id=eq.${service.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      latitude: coords.lat,
      longitude: coords.lng,
      postcode: normalizePostcode(service.postcode),
    }),
  })

  if (!patchRes.ok) {
    console.warn('PATCH FAIL', service.name, await patchRes.text())
    failed++
  } else {
    console.log('OK', service.name, '→', coords.lat.toFixed(4), coords.lng.toFixed(4))
    updated++
  }

  await new Promise((r) => setTimeout(r, 120))
}

console.log(`\nDone: ${updated} updated, ${failed} failed, ${services.length} total`)
