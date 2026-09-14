#!/usr/bin/env node
/**
 * Bulk-import Lidl NI quiet-hour listings into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... node scripts/import-lidl-stores.mjs
 *
 * Optional:
 *   DRY_RUN=1          — log rows without writing
 *   SKIP_IMAGE=1       — skip uploading the shared cover image
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY
const dryRun = process.env.DRY_RUN === '1'
const skipImage = process.env.SKIP_IMAGE === '1'

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

const IMAGE_PATH = 'lidl-ni/store-cover.png'
const IMAGE_FILE = join(__dirname, 'assets/lidl-store.png')
const STORES_FILE = join(__dirname, '../data/lidl-stores.json')

const WEBSITE = 'https://www.lidl-ni.co.uk/'
const SHORT_DESCRIPTION = 'Quiet shopping hour every Tuesday 6–8pm.'
const FULL_DESCRIPTION =
  'Lidl supermarket offering a quieter shopping experience during designated quiet hours, with reduced in-store noise and distractions to help make shopping more comfortable for customers who may benefit from a calmer environment.'

const QUIET_HOURS = [
  {
    day: 'tuesday',
    start: '18:00',
    end: '20:00',
    label: 'Autism-friendly quiet hour',
  },
]

const ACCESSIBILITY = {
  autismFriendly: true,
  quietHour: true,
  sensoryFriendly: true,
  wheelchairAccessible: true,
  accessibleToilet: true,
  stepFreeAccess: true,
  indoor: true,
}

const SENSORY = {
  noiseLevel: 'moderate',
  lightingLevel: 'moderate',
  queueLevel: 'moderate',
}

const GOOD_TO_KNOW = {
  noiseLevels: 'Reduced in-store noise during quiet hour',
  lighting: 'Dimmed lighting where possible',
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

function normalizePostcode(raw) {
  const trimmed = raw.trim()
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
  const data = await res.json()
  const hit = data.result ?? data.terminated
  if (!hit?.latitude || !hit?.longitude) return null
  return { lat: hit.latitude, lng: hit.longitude }
}

async function uploadSharedImage() {
  if (skipImage) {
    console.log('Skipping image upload (SKIP_IMAGE=1)')
    return IMAGE_PATH
  }

  const bytes = readFileSync(IMAGE_FILE)
  const uploadUrl = `${url}/storage/v1/object/service-images/${IMAGE_PATH}`

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: bytes,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Image upload failed: ${text}`)
  }

  console.log('Uploaded shared image →', IMAGE_PATH)
  return IMAGE_PATH
}

async function existingLidlNames() {
  const res = await fetch(
    `${url}/rest/v1/services?select=name&name=like.Lidl%25`,
    { headers },
  )
  const rows = await res.json()
  if (!Array.isArray(rows)) return new Set()
  return new Set(rows.map((r) => r.name))
}

function buildRow(store, coords, now) {
  return {
    id: randomUUID(),
    name: store.name,
    category: 'Shopping',
    short_description: SHORT_DESCRIPTION,
    full_description: FULL_DESCRIPTION,
    address: store.address,
    town: store.town,
    county: store.county,
    postcode: normalizePostcode(store.postcode),
    latitude: coords.lat,
    longitude: coords.lng,
    website: WEBSITE,
    images: [IMAGE_PATH],
    quiet_hours: QUIET_HOURS,
    accessibility_features: ACCESSIBILITY,
    sensory_information: SENSORY,
    good_to_know: GOOD_TO_KNOW,
    verification_status: 'verified',
    source: 'imported',
    no_fixed_location: false,
    created_at: now,
    updated_at: now,
  }
}

const stores = JSON.parse(readFileSync(STORES_FILE, 'utf8'))
console.log(`Importing ${stores.length} Lidl stores${dryRun ? ' (DRY RUN)' : ''}…`)

if (!dryRun) {
  await uploadSharedImage()
}

const skipNames = dryRun ? new Set() : await existingLidlNames()
const now = new Date().toISOString()
let inserted = 0
let skipped = 0
let failed = 0

for (const store of stores) {
  if (skipNames.has(store.name)) {
    console.log('SKIP (exists)', store.name)
    skipped++
    continue
  }

  const coords = await geocodePostcode(store.postcode)
  if (!coords) {
    console.warn('FAIL geocode', store.name, store.postcode)
    failed++
    continue
  }

  const row = buildRow(store, coords, now)

  if (dryRun) {
    console.log('OK', store.name, '→', coords.lat.toFixed(4), coords.lng.toFixed(4))
    inserted++
    continue
  }

  const res = await fetch(`${url}/rest/v1/services`, {
    method: 'POST',
    headers,
    body: JSON.stringify(row),
  })

  if (!res.ok) {
    console.warn('FAIL insert', store.name, await res.text())
    failed++
  } else {
    console.log('OK', store.name, '→', coords.lat.toFixed(4), coords.lng.toFixed(4))
    inserted++
  }

  await new Promise((r) => setTimeout(r, 120))
}

console.log(`\nDone: ${inserted} inserted, ${skipped} skipped, ${failed} failed`)
