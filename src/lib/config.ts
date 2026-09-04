/** Public facility submission form */
export const LIST_FACILITY_PATH = '/list-facility'

/** Production site URL */
export const SITE_URL = 'https://askreillyni.com'

/** Admin hub and CRUD routes */
export const ADMIN_PATH_PREFIX = '/add-service'

export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH_PREFIX || pathname.startsWith(`${ADMIN_PATH_PREFIX}/`)
}

/** Routes that should work before onboarding (direct links, bookmarks, email CTAs) */
export function bypassesOnboarding(pathname: string): boolean {
  return isAdminPath(pathname) || pathname === LIST_FACILITY_PATH
}

/** @deprecated Use LIST_FACILITY_PATH - kept for backwards compatibility */
export const LIST_YOUR_FACILITY_URL = LIST_FACILITY_PATH

/** Type this in Explore search to reveal the admin add-facility button */
export const SECRET_ADD_SEARCH = 'reilly-add'

export function isSecretAddSearch(query: string): boolean {
  return query.trim().toLowerCase() === SECRET_ADD_SEARCH
}

/** Emails allowed to manage services (app gate only - not server auth) */
export const ALLOWED_ADMIN_EMAILS = [
  'roryloughran11@gmail.com',
  'hello@askreillyni.com',
] as const

export function isAllowedAdminEmail(email: string): boolean {
  return (ALLOWED_ADMIN_EMAILS as readonly string[]).includes(email.trim().toLowerCase())
}

export const ADMIN_EMAIL_SESSION_KEY = 'reilly_admin_email'

/** Legacy ?key= unlock - optional via VITE_ADMIN_KEY */
export const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY ?? ''
export const ADMIN_SESSION_KEY = 'reilly_admin'

export function hasAdminAccess(): boolean {
  try {
    const email = sessionStorage.getItem(ADMIN_EMAIL_SESSION_KEY)
    if (email && isAllowedAdminEmail(email)) return true
    if (ADMIN_KEY && sessionStorage.getItem(ADMIN_SESSION_KEY) === ADMIN_KEY) {
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}

export function grantAdminEmailAccess(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  if (!isAllowedAdminEmail(normalized)) return false
  try {
    sessionStorage.setItem(ADMIN_EMAIL_SESSION_KEY, normalized)
  } catch {
    return false
  }
  return true
}

export function grantAdminAccess(key: string): boolean {
  if (!ADMIN_KEY || key === ADMIN_KEY) {
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, ADMIN_KEY || 'dev')
    } catch {
      /* ignore */
    }
    return true
  }
  return false
}

export function clearAdminAccess(): void {
  try {
    sessionStorage.removeItem(ADMIN_EMAIL_SESSION_KEY)
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  } catch {
    /* ignore */
  }
}
