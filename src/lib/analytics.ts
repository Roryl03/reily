import { coarseGeoFromLocation } from '@/lib/geoContext'
import { getSessionId, getStoredAudience, getVisitorId } from '@/lib/visitor'
import type {
  AnalyticsEventPayload,
  AnalyticsEventType,
  AnalyticsIngestEvent,
} from '@/types/analytics'
import type { UserLocation } from '@/types/service'

const QUEUE_KEY = 'reily_analytics_queue'
const FLUSH_INTERVAL_MS = 8000
const MAX_QUEUE = 40

let locationRef: UserLocation | null = null
let flushTimer: ReturnType<typeof setInterval> | null = null
let sessionStarted = false

function readQueue(): AnalyticsIngestEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as AnalyticsIngestEvent[]) : []
  } catch {
    return []
  }
}

function writeQueue(events: AnalyticsIngestEvent[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-MAX_QUEUE)))
  } catch {
    /* ignore */
  }
}

function enqueue(event: AnalyticsIngestEvent): void {
  writeQueue([...readQueue(), event])
}

async function flushQueue(): Promise<void> {
  const queue = readQueue()
  if (queue.length === 0) return

  try {
    const res = await fetch('/api/analytics/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: queue }),
      keepalive: true,
    })
    if (res.ok) {
      writeQueue([])
    }
  } catch {
    /* retry later */
  }
}

export function setAnalyticsLocation(location: UserLocation | null): void {
  locationRef = location
}

export function initAnalytics(): void {
  if (typeof window === 'undefined') return
  if (flushTimer) return

  flushTimer = setInterval(() => {
    void flushQueue()
  }, FLUSH_INTERVAL_MS)

  window.addEventListener('beforeunload', () => {
    void flushQueue()
  })

  if (!sessionStarted) {
    sessionStarted = true
    track('SESSION_STARTED')
  }
}

export function track(
  eventType: AnalyticsEventType,
  properties?: AnalyticsEventPayload['properties'],
): void {
  if (typeof window === 'undefined') return

  const geo = coarseGeoFromLocation(locationRef)
  const event: AnalyticsIngestEvent = {
    event_type: eventType,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    audience_type: getStoredAudience(),
    county: geo.county,
    town: geo.town,
    properties: properties ?? {},
    created_at: new Date().toISOString(),
  }

  enqueue(event)
  void flushQueue()
}
