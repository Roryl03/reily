/** Minimum responses before showing a percentage prominently */
export const RECOMMENDATION_MIN_FOR_PERCENT = 5

export interface RecommendationStats {
  positive: number
  negative: number
  total: number
  /** null when total < RECOMMENDATION_MIN_FOR_PERCENT */
  percentRecommend: number | null
}

export type VisitorRecommendation = boolean | null
