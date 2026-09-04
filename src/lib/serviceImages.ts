import { supabase } from '@/lib/supabase'
import { getPlaceholderImage } from '@/lib/utils'

/** Extract object path inside service-images bucket from any stored value */
export function normalizeStorageImagePath(raw: string): string | null {
  if (!raw || raw.startsWith('data:') || raw.includes('placehold.co')) return null
  const match = raw.match(/service-images\/(.+)$/)
  if (match) return match[1]
  if (!raw.includes('://') && !raw.startsWith('/')) return raw
  return null
}

export async function resolveServiceImageSrc(
  raw: string | undefined,
  fallbackCategory: string,
): Promise<string> {
  if (!raw) return getPlaceholderImage(fallbackCategory)
  if (raw.startsWith('data:') || raw.includes('placehold.co')) return raw

  const path = normalizeStorageImagePath(raw)
  if (!path || !supabase) return raw

  const { data, error } = await supabase.storage
    .from('service-images')
    .createSignedUrl(path, 60 * 60 * 24 * 7)

  if (error || !data?.signedUrl) return getPlaceholderImage(fallbackCategory)
  return data.signedUrl
}

export async function uploadServiceImage(file: File, serviceId: string): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured')

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${serviceId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('service-images').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (error) throw new Error(error.message)

  // Store path only - resolved to signed URL when displayed
  return path
}
