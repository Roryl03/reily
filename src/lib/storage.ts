import { seedServices } from '@/data/seedServices'
import { generateId } from '@/lib/utils'
import type {
  RecentlyViewed,
  Service,
  ServiceReport,
  UserLocation,
  UserPreferences,
} from '@/types/service'
import { DEFAULT_PREFERENCES } from '@/types/service'

const KEYS = {
  services: 'reily_services',
  favourites: 'reily_favourites',
  preferences: 'reily_preferences',
  location: 'reily_location',
  reports: 'reily_reports',
  recentlyViewed: 'reily_recently_viewed',
  seeded: 'reily_seeded',
} as const

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function initializeStorage(): void {
  const seeded = localStorage.getItem(KEYS.seeded)
  if (!seeded) {
    writeJson(KEYS.services, seedServices)
    writeJson(KEYS.favourites, [] as string[])
    writeJson(KEYS.preferences, DEFAULT_PREFERENCES)
    writeJson(KEYS.reports, [] as ServiceReport[])
    writeJson(KEYS.recentlyViewed, [] as RecentlyViewed[])
    localStorage.setItem(KEYS.seeded, 'true')
  }
}

export function loadServices(): Service[] {
  return readJson<Service[]>(KEYS.services, seedServices)
}

export function saveService(service: Service): Service {
  const services = loadServices()
  const index = services.findIndex((s) => s.id === service.id)
  const updated = { ...service, updatedAt: new Date().toISOString() }
  if (index >= 0) {
    services[index] = updated
  } else {
    services.push(updated)
  }
  writeJson(KEYS.services, services)
  return updated
}

export function deleteService(id: string): void {
  const services = loadServices().filter((s) => s.id !== id)
  writeJson(KEYS.services, services)
  const favourites = loadFavourites().filter((f) => f !== id)
  writeJson(KEYS.favourites, favourites)
}

export function duplicateService(id: string): Service | null {
  const original = loadServices().find((s) => s.id === id)
  if (!original) return null
  const copy: Service = {
    ...original,
    id: generateId(),
    name: `${original.name} (copy)`,
    source: 'community',
    verificationStatus: 'community',
    submittedByCurrentUser: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return saveService(copy)
}

export function loadFavourites(): string[] {
  return readJson<string[]>(KEYS.favourites, [])
}

export function toggleFavourite(id: string): boolean {
  const favourites = loadFavourites()
  const exists = favourites.includes(id)
  const updated = exists ? favourites.filter((f) => f !== id) : [...favourites, id]
  writeJson(KEYS.favourites, updated)
  return !exists
}

export function isFavourite(id: string): boolean {
  return loadFavourites().includes(id)
}

export function loadPreferences(): UserPreferences {
  return readJson(KEYS.preferences, DEFAULT_PREFERENCES)
}

export function savePreferences(prefs: UserPreferences): void {
  writeJson(KEYS.preferences, prefs)
}

export function loadLocation(): UserLocation | null {
  return readJson<UserLocation | null>(KEYS.location, null)
}

export function saveLocation(location: UserLocation): void {
  writeJson(KEYS.location, location)
}

export function loadReports(): ServiceReport[] {
  return readJson<ServiceReport[]>(KEYS.reports, [])
}

export function saveReport(report: Omit<ServiceReport, 'id' | 'createdAt'>): ServiceReport {
  const reports = loadReports()
  const full: ServiceReport = {
    ...report,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  writeJson(KEYS.reports, [full, ...reports])
  return full
}

export function addRecentlyViewed(serviceId: string): void {
  const items = loadRecentlyViewed().filter((r) => r.serviceId !== serviceId)
  items.unshift({ serviceId, viewedAt: new Date().toISOString() })
  writeJson(KEYS.recentlyViewed, items.slice(0, 10))
}

export function loadRecentlyViewed(): RecentlyViewed[] {
  return readJson<RecentlyViewed[]>(KEYS.recentlyViewed, [])
}

export function getUserSubmissions(): Service[] {
  return loadServices().filter((s) => s.submittedByCurrentUser || s.source === 'community')
}

export function clearDemoData(): void {
  const community = loadServices().filter((s) => s.source === 'community')
  writeJson(KEYS.services, community)
}

export function resetApp(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  initializeStorage()
}

// Supabase-ready interface — swap implementation later
export const dataService = {
  initializeStorage,
  loadServices,
  saveService,
  deleteService,
  duplicateService,
  loadFavourites,
  toggleFavourite,
  isFavourite,
  loadPreferences,
  savePreferences,
  loadLocation,
  saveLocation,
  loadReports,
  saveReport,
  addRecentlyViewed,
  loadRecentlyViewed,
  getUserSubmissions,
  clearDemoData,
  resetApp,
}
