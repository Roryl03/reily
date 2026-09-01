import { haversineDistanceMiles, isWithinRadius } from '@/lib/distance'
import { getOpenStatus, hasQuietHourToday, hasSenSessionToday } from '@/lib/openingHours'
import type {
  Service,
  ServiceFilters,
  ServiceWithMeta,
  SortOption,
  UserLocation,
} from '@/types/service'

export function enrichService(
  service: Service,
  location?: UserLocation | null,
): ServiceWithMeta {
  const distanceMiles = location
    ? haversineDistanceMiles(
        location.latitude,
        location.longitude,
        service.latitude,
        service.longitude,
      )
    : undefined

  return {
    ...service,
    distanceMiles,
    openStatus: getOpenStatus(service.openingHours),
    hasQuietHourToday: hasQuietHourToday(service.quietHours),
    hasSenSessionToday: hasSenSessionToday(service.senSessions),
  }
}

export function filterServices(
  services: Service[],
  filters: ServiceFilters,
  location?: UserLocation | null,
): ServiceWithMeta[] {
  const enriched = services.map((s) => enrichService(s, location))
  const search = filters.search.trim().toLowerCase()

  return enriched.filter((service) => {
    if (search) {
      const haystack = [
        service.name,
        service.shortDescription,
        service.town,
        service.category,
        service.fullDescription,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    if (filters.category && service.category !== filters.category) return false
    if (filters.openNow && service.openStatus !== 'open') return false
    if (filters.wheelchairAccess && !service.accessibilityFeatures.wheelchairAccessible)
      return false
    if (filters.accessibleToilet && !service.accessibilityFeatures.accessibleToilet)
      return false
    if (filters.changingPlaces && !service.accessibilityFeatures.changingPlaces) return false
    if (filters.quietHour && !service.hasQuietHourToday && !service.accessibilityFeatures.quietHour)
      return false
    if (filters.senSession && !service.hasSenSessionToday && !service.accessibilityFeatures.senSpecific)
      return false
    if (filters.autismFriendly && !service.accessibilityFeatures.autismFriendly) return false
    if (filters.sensoryFriendly && !service.accessibilityFeatures.sensoryFriendly) return false
    if (filters.indoor && !service.accessibilityFeatures.indoor) return false
    if (filters.outdoor && !service.accessibilityFeatures.outdoor) return false
    if (filters.bookingRequired && !service.bookingRequired) return false
    if (filters.freeActivities && !service.accessibilityFeatures.freeEntry) return false
    if (
      filters.parkingAvailable &&
      !service.accessibilityFeatures.disabledParking &&
      !service.accessibilityFeatures.freeParking
    )
      return false

    if (filters.ageSuitability && service.ageRange) {
      if (!service.ageRange.toLowerCase().includes(filters.ageSuitability.toLowerCase()))
        return false
    }

    if (!isWithinRadius(service.distanceMiles, filters.radius)) return false

    return true
  })
}

export function sortServices(services: ServiceWithMeta[], sort: SortOption): ServiceWithMeta[] {
  const copy = [...services]
  switch (sort) {
    case 'nearest':
      return copy.sort((a, b) => (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999))
    case 'open_now':
      return copy.sort((a, b) => {
        const aOpen = a.openStatus === 'open' ? 0 : 1
        const bOpen = b.openStatus === 'open' ? 0 : 1
        if (aOpen !== bOpen) return aOpen - bOpen
        return (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999)
      })
    case 'recently_added':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    case 'alphabetical':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'recommended':
    default:
      return copy.sort((a, b) => {
        const score = (s: ServiceWithMeta) => {
          let pts = 0
          if (s.openStatus === 'open') pts += 3
          if (s.verificationStatus === 'verified') pts += 2
          if (s.accessibilityFeatures.autismFriendly) pts += 1
          if (s.distanceMiles !== undefined) pts += Math.max(0, 10 - s.distanceMiles)
          return pts
        }
        return score(b) - score(a)
      })
  }
}

export function getActiveFilterCount(filters: ServiceFilters): number {
  let count = 0
  if (filters.category) count++
  if (filters.openNow) count++
  if (filters.ageSuitability) count++
  if (filters.wheelchairAccess) count++
  if (filters.accessibleToilet) count++
  if (filters.changingPlaces) count++
  if (filters.quietHour) count++
  if (filters.senSession) count++
  if (filters.autismFriendly) count++
  if (filters.sensoryFriendly) count++
  if (filters.indoor) count++
  if (filters.outdoor) count++
  if (filters.bookingRequired) count++
  if (filters.freeActivities) count++
  if (filters.parkingAvailable) count++
  return count
}

export function clearFilters(filters: ServiceFilters): ServiceFilters {
  return { ...filters, search: filters.search, radius: filters.radius }
}
