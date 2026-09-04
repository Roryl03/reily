import { useEffect } from 'react'

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? ''

    if (meta) {
      meta.setAttribute('content', description)
    }

    return () => {
      document.title = previousTitle
      if (meta) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [title, description])
}
