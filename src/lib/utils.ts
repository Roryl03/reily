import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDistance(miles?: number): string {
  if (miles === undefined) return ''
  if (miles < 0.1) return '< 0.1 mi'
  if (miles < 10) return `${miles.toFixed(1)} mi`
  return `${Math.round(miles)} mi`
}

export function formatPhoneLink(phone?: string): string | undefined {
  if (!phone) return undefined
  return `tel:${phone.replace(/\s/g, '')}`
}

export function formatWebsiteUrl(url?: string): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http')) return url
  return `https://${url}`
}

export function getDirectionsUrl(lat: number, lng: number, _name?: string): string {
  return `https://www.openstreetmap.org/directions?to=${lat},${lng}#map=15/${lat}/${lng}`
}

export function shareService(name: string, url: string): void {
  if (navigator.share) {
    void navigator.share({ title: name, text: `Check out ${name} on Reily`, url })
  } else {
    void navigator.clipboard.writeText(url)
  }
}

export const MAX_IMAGE_SIZE_BYTES = 500_000

export async function fileToDataUrl(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      'Image is too large for local storage. Please use an image under 500KB or skip the image for now.',
    )
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Activities: '#6B8F71',
    'Food and drink': '#C4785A',
    'Parks and outdoors': '#5A8FA8',
    'Support services': '#8B7BA8',
    Shopping: '#A8926B',
    Cinema: '#6B7FA8',
    'Soft play': '#C4A05A',
    Accommodation: '#7A9E8B',
    Education: '#6B8FA8',
    Healthcare: '#8FA86B',
    Haircuts: '#A87B6B',
    'Community groups': '#7B8FA8',
  }
  return colors[category] ?? '#6B8F71'
}

export function getPlaceholderImage(category: string): string {
  const color = getCategoryColor(category).replace('#', '')
  return `https://placehold.co/800x400/${color}/F5F0E8?text=${encodeURIComponent(category)}`
}
