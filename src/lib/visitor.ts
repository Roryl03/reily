import type { AudienceType } from '@/types/analytics'

const VISITOR_KEY = 'reily_visitor_id'
const SESSION_KEY = 'reily_session_id'
const SESSION_STARTED_KEY = 'reily_session_started_at'
const AUDIENCE_KEY = 'reily_audience_type'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

function readId(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeId(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private browsing */
  }
}

function newId(): string {
  return crypto.randomUUID()
}

/** Persistent anonymous visitor — not linked to identity. */
export function getVisitorId(): string {
  let id = readId(VISITOR_KEY)
  if (!id) {
    id = newId()
    writeId(VISITOR_KEY, id)
  }
  return id
}

/** Session resets after 30 minutes of inactivity. */
export function getSessionId(): string {
  const now = Date.now()
  const sessionId = readId(SESSION_KEY)
  const startedRaw = readId(SESSION_STARTED_KEY)
  const started = startedRaw ? Number(startedRaw) : 0

  if (sessionId && started && now - started < SESSION_TIMEOUT_MS) {
    writeId(SESSION_STARTED_KEY, String(now))
    return sessionId
  }

  const next = newId()
  writeId(SESSION_KEY, next)
  writeId(SESSION_STARTED_KEY, String(now))
  return next
}

export function getStoredAudience(): AudienceType | null {
  const raw = readId(AUDIENCE_KEY)
  return raw as AudienceType | null
}

export function setStoredAudience(audience: AudienceType | null): void {
  if (audience) {
    writeId(AUDIENCE_KEY, audience)
  } else {
    try {
      localStorage.removeItem(AUDIENCE_KEY)
    } catch {
      /* ignore */
    }
  }
}
