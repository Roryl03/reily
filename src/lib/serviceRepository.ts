import { supabase } from '@/lib/supabase'
import type { Service } from '@/types/service'

/** DB row shape (snake_case) */
interface ServiceRow {
  id: string
  name: string
  category: string
  short_description: string
  full_description: string
  address: string
  town: string
  county: string
  postcode: string
  latitude: number
  longitude: number
  phone: string | null
  email: string | null
  website: string | null
  images: string[] | null
  opening_hours: Service['openingHours'] | null
  accessibility_features: Service['accessibilityFeatures'] | null
  sensory_information: Service['sensoryInformation'] | null
  good_to_know: Service['goodToKnow'] | null
  age_range: string | null
  pricing: string | null
  booking_required: boolean | null
  booking_url: string | null
  quiet_hours: Service['quietHours'] | null
  sen_sessions: Service['senSessions'] | null
  events: Service['events'] | null
  parking_information: string | null
  verification_status: string
  source: string
  created_at: string
  updated_at: string
}

function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Service['category'],
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    address: row.address,
    town: row.town,
    county: row.county,
    postcode: row.postcode,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    images: row.images ?? [],
    openingHours: row.opening_hours ?? undefined,
    accessibilityFeatures: row.accessibility_features ?? {},
    sensoryInformation: row.sensory_information ?? {},
    goodToKnow: row.good_to_know ?? undefined,
    ageRange: row.age_range ?? undefined,
    pricing: row.pricing ?? undefined,
    bookingRequired: row.booking_required ?? undefined,
    bookingUrl: row.booking_url ?? undefined,
    quietHours: row.quiet_hours ?? undefined,
    senSessions: row.sen_sessions ?? undefined,
    events: row.events ?? undefined,
    parkingInformation: row.parking_information ?? undefined,
    verificationStatus: row.verification_status as Service['verificationStatus'],
    source: row.source as Service['source'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function serviceToRow(service: Service): Omit<ServiceRow, 'created_at' | 'updated_at'> & {
  updated_at: string
  created_at?: string
} {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    short_description: service.shortDescription,
    full_description: service.fullDescription,
    address: service.address,
    town: service.town,
    county: service.county,
    postcode: service.postcode,
    latitude: service.latitude,
    longitude: service.longitude,
    phone: service.phone ?? null,
    email: service.email ?? null,
    website: service.website ?? null,
    images: service.images ?? [],
    opening_hours: service.openingHours ?? null,
    accessibility_features: service.accessibilityFeatures,
    sensory_information: service.sensoryInformation,
    good_to_know: service.goodToKnow ?? null,
    age_range: service.ageRange ?? null,
    pricing: service.pricing ?? null,
    booking_required: service.bookingRequired ?? null,
    booking_url: service.bookingUrl ?? null,
    quiet_hours: service.quietHours ?? null,
    sen_sessions: service.senSessions ?? null,
    events: service.events ?? null,
    parking_information: service.parkingInformation ?? null,
    verification_status: service.verificationStatus,
    source: service.source,
    created_at: service.createdAt,
    updated_at: service.updatedAt,
  }
}

export async function fetchServices(): Promise<Service[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as ServiceRow[]).map(rowToService)
}

export async function upsertService(service: Service): Promise<Service> {
  if (!supabase) throw new Error('Supabase not configured')

  const row = serviceToRow(service)
  const { data, error } = await supabase
    .from('services')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return rowToService(data as ServiceRow)
}

export async function removeService(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
