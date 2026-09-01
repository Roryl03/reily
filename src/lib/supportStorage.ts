import {
  supportResources as seedSupportResources,
  SUPPORT_DATA_VERSION,
} from '@/data/supportResources'
import type { SupportFilters, SupportResource } from '@/types/supportResource'
import { sectionSortOrder } from '@/types/supportResource'

const KEY = 'reily_support_resources'
const VERSION_KEY = 'reily_support_version'

function readJson<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(value: SupportResource[]): void {
  localStorage.setItem(KEY, JSON.stringify(value))
}

export function initializeSupportStorage(): void {
  if (localStorage.getItem(VERSION_KEY) !== SUPPORT_DATA_VERSION) {
    writeJson(seedSupportResources)
    localStorage.setItem(VERSION_KEY, SUPPORT_DATA_VERSION)
  }
}

export function loadSupportResources(): SupportResource[] {
  return readJson(seedSupportResources)
}

export function saveSupportResources(resources: SupportResource[]): void {
  writeJson(resources)
}

export function getSupportResourceById(id: string): SupportResource | undefined {
  return loadSupportResources().find((r) => r.id === id)
}

export function filterSupportResources(
  resources: SupportResource[],
  filters: SupportFilters,
): SupportResource[] {
  const q = filters.search.trim().toLowerCase()

  return resources
    .filter((r) => {
      if (q) {
        const haystack = [
          r.name,
          r.shortDescription,
          r.fullDescription,
          r.town,
          r.provider,
          r.notes,
          r.topics.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.section && r.section !== filters.section) return false
      if (filters.topic && !r.topics.includes(filters.topic)) return false
      if (filters.coverage && !r.coverage.includes(filters.coverage)) return false
      if (filters.helplinesOnly && !r.isHelpline) return false
      if (filters.freeOnly && !r.isFree) return false
      return true
    })
    .sort((a, b) => {
      const sectionDiff = sectionSortOrder(a.section) - sectionSortOrder(b.section)
      if (sectionDiff !== 0) return sectionDiff
      return (a.sortOrder ?? 100) - (b.sortOrder ?? 100)
    })
}

export function groupBySection(resources: SupportResource[]): Map<string, SupportResource[]> {
  const map = new Map<string, SupportResource[]>()
  for (const r of resources) {
    const list = map.get(r.section) ?? []
    list.push(r)
    map.set(r.section, list)
  }
  return map
}

export const supportService = {
  initializeSupportStorage,
  loadSupportResources,
  saveSupportResources,
  getSupportResourceById,
  filterSupportResources,
  groupBySection,
}
