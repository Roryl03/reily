import { toPng } from 'html-to-image'
import { ASK_REILLY_LOGO_SRC } from '@/components/icons/AskReillyLogo'

/** Instagram feed post - 1:1 square at 1080px. */
export const SHARE_IMAGE_SIZE = 1080
export const SHARE_IMAGE_PREVIEW_SIZE = 540

let cachedLogoDataUrl: string | null = null

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** Load a remote image through an Image element + canvas (CORS permitting). */
function loadImageAsDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || 1
        canvas.height = img.naturalHeight || 1
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas unavailable')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not encode image'))
      }
    }
    img.onerror = () => reject(new Error('Image failed to load'))
    img.src = url.includes('?') ? `${url}&_share=${Date.now()}` : `${url}?_share=${Date.now()}`
  })
}

/** Always returns an inline data URL so html-to-image can embed photos reliably. */
export async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url

  try {
    const res = await fetch(url, { mode: 'cors', cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return blobToDataUrl(await res.blob())
  } catch {
    return loadImageAsDataUrl(url)
  }
}

export async function getAskReillyLogoDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl
  cachedLogoDataUrl = await urlToDataUrl(ASK_REILLY_LOGO_SRC)
  return cachedLogoDataUrl
}

export async function waitForImages(element: HTMLElement): Promise<void> {
  const images = [...element.querySelectorAll('img')]

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          const done = () => resolve()
          if (img.complete && img.naturalWidth > 0) {
            done()
            return
          }
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
        }),
    ),
  )
}

export async function generateShareImage(element: HTMLElement): Promise<string> {
  await document.fonts.ready
  await waitForImages(element)
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  return toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#FAF9F5',
    skipAutoScale: true,
  })
}

export function shareImageFilename(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `ask-reilly-${slug || id}.png`
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: 'image/png' })
}

export function canSaveToCameraRoll(): boolean {
  if (!navigator.share || !navigator.canShare) return false
  try {
    const probe = new File([''], 'probe.png', { type: 'image/png' })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

/** Opens the native share sheet so users can save to Photos / camera roll on mobile. */
export async function saveImageToCameraRoll(dataUrl: string, filename: string): Promise<void> {
  const file = await dataUrlToFile(dataUrl, filename)

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Ask Reilly share card' })
      return
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      throw err
    }
  }

  downloadDataUrl(dataUrl, filename)
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
