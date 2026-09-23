/**
 * Ask Reilly Top Picks Score — transparent, deterministic ranking.
 *
 * Primary signal: Wilson score lower bound (95% confidence) on recommendation rate,
 * multiplied by log volume of positive recommendations this month.
 *
 * Small boost from community star ratings when review volume exists.
 *
 * A service with 180/190 positive recommendations outranks 2/2 positive.
 */

export const TOP_PICKS_MIN_RECOMMENDATIONS = 3

export interface TopPicksInputs {
  positiveRecommendations: number
  negativeRecommendations: number
  averageRating: number | null
  reviewCount: number
}

export function wilsonLowerBound(positive: number, total: number, z = 1.96): number {
  if (total <= 0 || positive < 0) return 0
  const phat = positive / total
  const z2 = z * z
  const numerator =
    phat +
    z2 / (2 * total) -
    z * Math.sqrt((phat * (1 - phat) + z2 / (4 * total)) / total)
  const denominator = 1 + z2 / total
  return Math.max(0, numerator / denominator)
}

export function computeTopPicksScore(input: TopPicksInputs): number {
  const total = input.positiveRecommendations + input.negativeRecommendations
  if (total < TOP_PICKS_MIN_RECOMMENDATIONS) return 0

  const confidence = wilsonLowerBound(input.positiveRecommendations, total)
  const volumeFactor = Math.log1p(input.positiveRecommendations)
  let score = confidence * volumeFactor

  if (input.averageRating != null && input.reviewCount > 0) {
    score += (input.averageRating / 5) * Math.log1p(input.reviewCount) * 0.12
  }

  return Math.round(score * 1000) / 1000
}

export function recommendPercent(positive: number, total: number, minSample = 5): number | null {
  if (total < minSample) return null
  return Math.round((positive / total) * 100)
}
