import { useEffect, useState } from 'react'
import { resolveServiceImageSrc } from '@/lib/serviceImages'
import { cn, getPlaceholderImage } from '@/lib/utils'

export function ServiceImage({
  src,
  category,
  alt = '',
  className,
}: {
  src?: string
  category: string
  alt?: string
  className?: string
}) {
  const [resolved, setResolved] = useState(
    () => src ?? getPlaceholderImage(category),
  )

  useEffect(() => {
    let cancelled = false
    void resolveServiceImageSrc(src, category).then((url) => {
      if (!cancelled) setResolved(url)
    })
    return () => {
      cancelled = true
    }
  }, [src, category])

  return (
    <img
      src={resolved}
      alt={alt}
      className={cn(className)}
      loading="lazy"
      onError={() => setResolved(getPlaceholderImage(category))}
    />
  )
}
