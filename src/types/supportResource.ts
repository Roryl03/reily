export const SUPPORT_SECTIONS = [
  { id: 'education-sen', label: 'Education and SEN support', sortOrder: 1 },
  { id: 'health-therapy', label: 'Health and therapy services', sortOrder: 2 },
  { id: 'social-care', label: 'Social care, respite and family support', sortOrder: 3 },
  { id: 'legal-rights', label: 'Legal, rights and advice', sortOrder: 4 },
  { id: 'financial-practical', label: 'Financial and practical support', sortOrder: 5 },
  { id: 'community-inclusion', label: 'Community and inclusion support', sortOrder: 6 },
  { id: 'local-clubs', label: 'Local clubs, groups and social support', sortOrder: 7 },
  { id: 'accessible-sensory', label: 'Accessible and sensory-friendly services', sortOrder: 8 },
  { id: 'accessible-transport', label: 'Accessible transport', sortOrder: 9 },
  { id: 'helplines', label: 'Useful helplines', sortOrder: 10 },
] as const

export type SupportSection = (typeof SUPPORT_SECTIONS)[number]['id']

export const SUPPORT_TOPICS = [
  { id: 'sen-advice', label: 'SEN advice' },
  { id: 'ehcp-education', label: 'EHCP & education' },
  { id: 'autism', label: 'Autism support' },
  { id: 'adhd', label: 'ADHD support' },
  { id: 'legal-advocacy', label: 'Legal & advocacy' },
  { id: 'emotional-support', label: 'Emotional support' },
  { id: 'early-years', label: 'Early years' },
  { id: 'financial-practical', label: 'Financial & practical' },
  { id: 'respite-carers', label: 'Respite & carers' },
  { id: 'health-therapy', label: 'Health & therapy' },
  { id: 'community', label: 'Community & groups' },
  { id: 'transport', label: 'Transport' },
  { id: 'general', label: 'General guidance' },
] as const

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]['id']

export const SUPPORT_COVERAGE = [
  { id: 'ni-wide', label: 'All Northern Ireland' },
  { id: 'northern-trust', label: 'Northern Trust area' },
  { id: 'mid-east-antrim', label: 'Mid and East Antrim' },
  { id: 'east-antrim', label: 'East Antrim' },
  { id: 'carrickfergus', label: 'Carrickfergus' },
  { id: 'larne', label: 'Larne' },
  { id: 'newtownabbey', label: 'Newtownabbey' },
  { id: 'belfast', label: 'Belfast area' },
  { id: 'online', label: 'Online / phone' },
] as const

export type SupportCoverage = (typeof SUPPORT_COVERAGE)[number]['id']

export type SupportVerificationStatus = 'verified' | 'pending' | 'demo'

export interface SupportResource {
  id: string
  name: string
  section: SupportSection
  shortDescription: string
  fullDescription: string
  topics: SupportTopic[]
  coverage: SupportCoverage[]
  phone?: string
  phoneLabel?: string
  secondaryPhone?: string
  mobile?: string
  email?: string
  website?: string
  textService?: string
  hours?: string
  address?: string
  town?: string
  county?: string
  provider?: string
  isHelpline: boolean
  isFree: boolean
  isUrgent?: boolean
  ageFocus?: string
  verificationStatus: SupportVerificationStatus
  source: 'official' | 'leaflet' | 'manual' | 'demo'
  lastCheckedAt?: string
  featured?: boolean
  sortOrder?: number
  notes?: string
}

export interface SupportFilters {
  search: string
  section?: SupportSection
  topic?: SupportTopic
  coverage?: SupportCoverage
  helplinesOnly?: boolean
  freeOnly?: boolean
}

export const DEFAULT_SUPPORT_FILTERS: SupportFilters = {
  search: '',
}

export function sectionLabel(id: SupportSection): string {
  return SUPPORT_SECTIONS.find((s) => s.id === id)?.label ?? id
}

export function sectionSortOrder(id: SupportSection): number {
  return SUPPORT_SECTIONS.find((s) => s.id === id)?.sortOrder ?? 99
}
