import type { UserLocation } from '@/types/service'

export interface TopPickItem {
  rank: number
  score: number
  movement?: 'up' | 'down' | 'same' | 'new'
  previousRank?: number | null
  positiveRecommendations: number
  negativeRecommendations: number
  totalRecommendations: number
  recommendPercent: number | null
  averageRating: number | null
  reviewCount: number
  service: {
    id: string
    name: string
    category: string
    town: string
    county: string
    image: string | null
  } | null
}

export interface TopPicksResponse {
  scope: 'near' | 'across'
  year: number
  month: number
  methodology: string
  items: TopPickItem[]
  source: 'live' | 'archive'
}

export interface TopPicksArchivePeriod {
  year: number
  month: number
  finalizedAt: string | null
}

const MONTH_NAMES = [
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
]

export function formatTopPicksMonth(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

export async function fetchTopPicks(options: {
  scope: 'near' | 'across'
  location?: UserLocation | null
  year?: number
  month?: number
  archive?: boolean
}): Promise<TopPicksResponse> {
  const params = new URLSearchParams({ scope: options.scope })
  if (options.location && options.scope === 'near') {
    params.set('lat', String(options.location.latitude))
    params.set('lng', String(options.location.longitude))
  }
  if (options.year) params.set('year', String(options.year))
  if (options.month) params.set('month', String(options.month))
  if (options.archive) params.set('archive', '1')

  const res = await fetch(`/api/top-picks?${params.toString()}`)
  if (!res.ok) {
    throw new Error('Could not load Top Picks')
  }
  return res.json() as Promise<TopPicksResponse>
}

export async function fetchTopPicksArchive(
  scope: 'near' | 'across' = 'across',
): Promise<TopPicksArchivePeriod[]> {
  const res = await fetch(`/api/top-picks/archive?scope=${scope}`)
  if (!res.ok) return []
  const data = (await res.json()) as { periods?: TopPicksArchivePeriod[] }
  return data.periods ?? []
}
