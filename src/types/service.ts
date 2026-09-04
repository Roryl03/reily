export const CATEGORIES = [
  'Activities',
  'Food and drink',
  'Parks and outdoors',
  'Support services',
  'Shopping',
  'Cinema',
  'Soft play',
  'Accommodation',
  'Education',
  'Healthcare',
  'Haircuts',
  'Community groups',
] as const

export type Category = (typeof CATEGORIES)[number]

export type VerificationStatus = 'demo' | 'community' | 'verified' | 'unverified' | 'pending'
export type ServiceSource = 'demo' | 'community' | 'imported'

export type NoiseLevel = 'quiet' | 'moderate' | 'lively' | 'variable'
export type LightingLevel = 'dim' | 'moderate' | 'bright' | 'variable'
export type QueueLevel = 'none' | 'short' | 'moderate' | 'long' | 'variable'

export interface DayHours {
  open: string
  close: string
  closed?: boolean
}

export type WeekOpeningHours = Record<
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  DayHours
>

export interface QuietHour {
  day: keyof WeekOpeningHours
  start: string
  end: string
  label?: string
}

export interface SenSession {
  day: keyof WeekOpeningHours
  start: string
  end: string
  label: string
  description?: string
}

export interface ServiceEvent {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  description?: string
}

export interface AccessibilityFeatures {
  autismFriendly?: boolean
  senSpecific?: boolean
  quietHour?: boolean
  sensoryFriendly?: boolean
  wheelchairAccessible?: boolean
  accessibleToilet?: boolean
  changingPlaces?: boolean
  sensoryRoom?: boolean
  earDefendersAvailable?: boolean
  visualGuideAvailable?: boolean
  trainedStaff?: boolean
  assistanceDogsWelcome?: boolean
  stepFreeAccess?: boolean
  disabledParking?: boolean
  freeParking?: boolean
  publicTransportNearby?: boolean
  indoor?: boolean
  outdoor?: boolean
  freeEntry?: boolean
  bookingRequired?: boolean
}

export interface SensoryInformation {
  noiseLevel?: NoiseLevel
  lightingLevel?: LightingLevel
  queueLevel?: QueueLevel
  quietSpaceAvailable?: boolean
  busyPeriods?: string
  additionalNotes?: string
}

export interface GoodToKnow {
  noiseLevels?: string
  lighting?: string
  queues?: string
  busyPeriods?: string
  quietRetreat?: string
}

export interface Service {
  id: string
  name: string
  category: Category
  shortDescription: string
  fullDescription: string
  address: string
  town: string
  county: string
  postcode: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  website?: string
  images: string[]
  openingHours?: WeekOpeningHours
  accessibilityFeatures: AccessibilityFeatures
  sensoryInformation: SensoryInformation
  goodToKnow?: GoodToKnow
  ageRange?: string
  pricing?: string
  bookingRequired?: boolean
  bookingUrl?: string
  quietHours?: QuietHour[]
  senSessions?: SenSession[]
  events?: ServiceEvent[]
  parkingInformation?: string
  publicTransportInformation?: string
  verificationStatus: VerificationStatus
  source: ServiceSource
  createdAt: string
  updatedAt: string
  lastCheckedAt?: string
  submittedByCurrentUser?: boolean
}

export type OpenStatus = 'open' | 'closed' | 'opens_soon' | 'unknown'

export interface ServiceWithMeta extends Service {
  distanceMiles?: number
  openStatus: OpenStatus
  hasQuietHourToday: boolean
  hasSenSessionToday: boolean
}

export interface ServiceReport {
  id: string
  serviceId: string
  serviceName: string
  issueType: string
  details: string
  createdAt: string
}

export interface RecentlyViewed {
  serviceId: string
  viewedAt: string
}

export type SortOption =
  | 'recommended'
  | 'nearest'
  | 'open_now'
  | 'recently_added'
  | 'alphabetical'

export type RadiusOption = 5 | 10 | 20 | 30 | 50 | 'anywhere'

export interface ServiceFilters {
  search: string
  category?: Category
  openNow?: boolean
  ageSuitability?: string
  wheelchairAccess?: boolean
  accessibleToilet?: boolean
  changingPlaces?: boolean
  quietHour?: boolean
  senSession?: boolean
  autismFriendly?: boolean
  sensoryFriendly?: boolean
  indoor?: boolean
  outdoor?: boolean
  bookingRequired?: boolean
  freeActivities?: boolean
  parkingAvailable?: boolean
  radius: RadiusOption
}

export const DEFAULT_FILTERS: ServiceFilters = {
  search: '',
  radius: 20,
}

export interface UserLocation {
  latitude: number
  longitude: number
  label: string
  isDemo?: boolean
  isApproximate?: boolean
}

export interface UserPreferences {
  searchRadius: RadiusOption
  preferredCategories: Category[]
  accessibilityPreferences: Partial<AccessibilityFeatures>
  ageRange?: string
  onboardingComplete: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  searchRadius: 20,
  preferredCategories: [],
  accessibilityPreferences: {},
  onboardingComplete: false,
}

export const DEMO_LOCATION: UserLocation = {
  latitude: 54.5656,
  longitude: -6.3234,
  label: 'Randalstown, Northern Ireland (demo)',
  isDemo: true,
  isApproximate: true,
}

export const NI_TOWNS: Record<string, { lat: number; lng: number; label: string }> = {
  randalstown: { lat: 54.5656, lng: -6.3234, label: 'Randalstown' },
  antrim: { lat: 54.7186, lng: -6.2177, label: 'Antrim' },
  ballymena: { lat: 54.8645, lng: -6.2769, label: 'Ballymena' },
  belfast: { lat: 54.5973, lng: -5.9301, label: 'Belfast' },
  coleraine: { lat: 55.1316, lng: -6.6646, label: 'Coleraine' },
  limavady: { lat: 55.0497, lng: -6.9502, label: 'Limavady' },
  derry: { lat: 54.9966, lng: -7.3086, label: 'Derry/Londonderry' },
  'bt41 3ab': { lat: 54.5656, lng: -6.3234, label: 'Randalstown area' },
  'bt41': { lat: 54.5656, lng: -6.3234, label: 'BT41 area' },
  'bt1': { lat: 54.5973, lng: -5.9301, label: 'Belfast city centre' },
  'bt52': { lat: 55.1316, lng: -6.6646, label: 'Coleraine area' },
}

/** Live listings shown in explore, map, home, etc. */
export function isPublicService(service: Service): boolean {
  return service.verificationStatus !== 'pending'
}

/** Real listings only — excludes demo seed data (used when Supabase is the source of truth). */
export function isLiveService(service: Service): boolean {
  return service.source !== 'demo' && isPublicService(service)
}
