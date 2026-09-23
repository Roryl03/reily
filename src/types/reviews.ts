export type ReviewStatus = 'pending' | 'approved' | 'hidden' | 'removed'

export type ReviewSort = 'helpful' | 'newest' | 'highest' | 'lowest'

export const REVIEW_REPORT_REASONS = [
  'Inappropriate',
  'Spam',
  'Personal information',
  'Abusive',
  'Potentially false/misleading',
  'Other',
] as const

export type ReviewReportReason = (typeof REVIEW_REPORT_REASONS)[number]

export const REVIEW_MIN_FOR_AVG_DISPLAY = 3

export interface PublicReview {
  id: string
  rating: number
  wouldRecommend: boolean
  visitMonth: number | null
  visitYear: number | null
  reviewText: string
  displayName: string
  helpfulCount: number
  createdAt: string
  userFoundHelpful: boolean
}

export interface ReviewSummary {
  averageRating: number | null
  reviewCount: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
  percentRecommend: number | null
  recommendationTotal: number
}

export interface ReviewSubmitPayload {
  serviceId: string
  rating: number
  wouldRecommend: boolean
  visitMonth: number
  visitYear: number
  reviewText: string
  isAnonymous: boolean
  displayName?: string
}

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const
