import type { Service } from '@/types/service'
import { isLiveService } from '@/types/service'

export interface CountEntry {
  label: string
  count: number
}

export interface AdminStats {
  totalLive: number
  pendingRequests: number
  byCounty: CountEntry[]
  byCategory: CountEntry[]
}

function countBy(services: Service[], key: 'county' | 'category'): CountEntry[] {
  const counts = new Map<string, number>()

  for (const service of services) {
    const raw = service[key]?.trim()
    const label = raw || 'Not specified'
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function computeAdminStats(services: Service[]): AdminStats {
  const live = services.filter(isLiveService)
  const pending = services.filter((s) => s.verificationStatus === 'pending')

  return {
    totalLive: live.length,
    pendingRequests: pending.length,
    byCounty: countBy(live, 'county'),
    byCategory: countBy(live, 'category'),
  }
}
