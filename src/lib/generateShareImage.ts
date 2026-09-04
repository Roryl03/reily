import { toPng } from 'html-to-image'

export async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return url
  }
}

export async function generateShareImage(element: HTMLElement): Promise<string> {
  await document.fonts.ready
  await new Promise((resolve) => setTimeout(resolve, 150))

  return toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#FAF9F5',
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
