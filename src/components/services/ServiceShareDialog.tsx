import { Download, ImageIcon, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ServiceShareCard } from '@/components/services/ServiceShareCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { downloadDataUrl, generateShareImage, urlToDataUrl } from '@/lib/generateShareImage'
import { resolveServiceImageSrc } from '@/lib/serviceImages'
import type { Service } from '@/types/service'

interface ServiceShareDialogProps {
  service: Service
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServiceShareButton({ service }: { service: Service }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setOpen(true)}>
        <ImageIcon className="h-4 w-4" aria-hidden />
        Share image
      </Button>
      <ServiceShareDialog service={service} open={open} onOpenChange={setOpen} />
    </>
  )
}

export function ServiceShareDialog({ service, open, onOpenChange }: ServiceShareDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setImageSrc(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const resolved = await resolveServiceImageSrc(service.images[0], service.category)
        const dataUrl = await urlToDataUrl(resolved)
        if (!cancelled) setImageSrc(dataUrl)
      } catch {
        if (!cancelled) setError('Could not load the service image.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, service.images, service.category])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    setGenerating(true)
    setError(null)
    try {
      const dataUrl = await generateShareImage(cardRef.current)
      const slug = service.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      downloadDataUrl(dataUrl, `ask-reilly-${slug || service.id}.png`)
    } catch {
      setError('Could not generate the image. Please try again.')
    } finally {
      setGenerating(false)
    }
  }, [service.id, service.name])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share card</DialogTitle>
          <DialogDescription>
            Preview the promotional image for {service.name}, then download it to share.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sage-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Preparing preview…
          </div>
        ) : error && !imageSrc ? (
          <p className="py-8 text-center text-error">{error}</p>
        ) : imageSrc ? (
          <div className="max-h-[55vh] overflow-auto rounded-xl border border-border bg-sage-100">
            <div className="flex justify-center p-4">
              <ServiceShareCard ref={cardRef} service={service} imageSrc={imageSrc} />
            </div>
          </div>
        ) : null}

        {error && imageSrc && <p className="text-sm text-error">{error}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="gap-1.5"
            disabled={!imageSrc || loading || generating}
            onClick={() => void handleDownload()}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
