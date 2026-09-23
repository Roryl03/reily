/** Concise audience groups — one tap, no overlap. */
export const AUDIENCE_OPTIONS = [
  { id: 'parent_carer', label: 'Parent / Carer' },
  { id: 'family_member', label: 'Family Member' },
  { id: 'healthcare_professional', label: 'Healthcare Professional' },
  { id: 'social_worker', label: 'Social Worker' },
  { id: 'education_professional', label: 'Education Professional' },
  { id: 'charity_community', label: 'Charity / Community Professional' },
  { id: 'business_provider', label: 'Business / Service Provider' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

export type AudienceType = (typeof AUDIENCE_OPTIONS)[number]['id']

export const PROFESSIONAL_AUDIENCE_TYPES: AudienceType[] = [
  'healthcare_professional',
  'social_worker',
  'education_professional',
  'charity_community',
]

export const ANALYTICS_EVENT_TYPES = [
  'SESSION_STARTED',
  'LOCATION_ONBOARDING_COMPLETED',
  'AUDIENCE_SELECTED',
  'AUDIENCE_SKIPPED',
  'SEARCH_PERFORMED',
  'CATEGORY_VIEWED',
  'SERVICE_VIEWED',
  'MAP_INTERACTION',
  'SERVICE_WEBSITE_CLICKED',
  'SERVICE_PHONE_CLICKED',
  'SERVICE_DIRECTIONS_CLICKED',
  'SERVICE_SHARED',
  'FAVOURITE_ADDED',
  'RECOMMENDATION_SUBMITTED',
  'REVIEW_SUBMITTED',
  'TOP_PICKS_VIEWED',
] as const

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number]

/** Privacy-safe event payload — never include PII or exact coordinates. */
export interface AnalyticsEventPayload {
  event_type: AnalyticsEventType
  properties?: Record<string, string | number | boolean | null>
  county?: string
  town?: string
}

export interface AnalyticsIngestEvent extends AnalyticsEventPayload {
  visitor_id: string
  session_id: string
  audience_type?: AudienceType | null
  created_at?: string
}
