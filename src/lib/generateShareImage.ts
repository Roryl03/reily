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

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
