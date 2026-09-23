export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) return null
  return { url, key }
}

export function supabaseHeaders(key: string, prefer?: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  }
}

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function checkAdminKey(headers?: Record<string, string | undefined>): boolean {
  const adminKey = process.env.ADMIN_KEY ?? process.env.VITE_ADMIN_KEY ?? ''
  const authHeader = headers?.['x-admin-key'] ?? headers?.['X-Admin-Key']
  return Boolean(adminKey && authHeader === adminKey)
}
