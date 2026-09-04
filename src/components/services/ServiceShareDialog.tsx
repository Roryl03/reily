import { Download, ImageIcon, Loader2, Smartphone } from 'lucide-react'
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
import {
  canSaveToCameraRoll,
  downloadDataUrl,
  generateShareImage,
  saveImageToCameraRoll,
  shareImageFilename,
  urlToDataUrl,
  waitForImages,
} from '@/lib/generateShareImage'
import { resolveServiceImageSrc } from '@/lib/serviceImages'
import { getPlaceholderImage } from '@/lib/utils'
import type { Service } from '@/types/service'

interface ServiceShareDialogProps {
  service: Service
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SaveAction = 'download' | 'camera-roll'

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
  const exportRef = useRef<HTMLDivElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportReady, setExportReady] = useState(false)
  const [savingAction, setSavingAction] = useState<SaveAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraRollAvailable, setCameraRollAvailable] = useState(false)

  useEffect(() => {
    setCameraRollAvailable(canSaveToCameraRoll())
  }, [])

  useEffect(() => {
    if (!open) {
      setImageSrc(null)
      setExportReady(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setExportReady(false)
    setError(null)

    void (async () => {
      try {
        const resolved = await resolveServiceImageSrc(service.images[0], service.category)
        let dataUrl = await urlToDataUrl(resolved)
        if (!dataUrl.startsWith('data:')) {
          dataUrl = await urlToDataUrl(getPlaceholderImage(service.category))
        }
        if (!cancelled) setImageSrc(dataUrl)
      } catch {
        if (!cancelled) {
          try {
            const fallback = await urlToDataUrl(getPlaceholderImage(service.category))
            setImageSrc(fallback)
          } catch {
            setError('Could not load the service image.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, service.images, service.category])

  useEffect(() => {
    if (!imageSrc || !exportRef.current) {
      setExportReady(false)
      return
    }

    let cancelled = false
    void waitForImages(exportRef.current).then(() => {
      if (!cancelled) setExportReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [imageSrc])

  const generatePng = useCallback(async () => {
    if (!exportRef.current) throw new Error('Share card not ready')
    await waitForImages(exportRef.current)
    return generateShareImage(exportRef.current)
  }, [])

  const handleDownload = useCallback(async () => {
    setSavingAction('download')
    setError(null)
    try {
      const dataUrl = await generatePng()
      downloadDataUrl(dataUrl, shareImageFilename(service.name, service.id))
    } catch {
      setError('Could not generate the image. Please try again.')
    } finally {
      setSavingAction(null)
    }
  }, [generatePng, service.id, service.name])

  const handleSaveToCameraRoll = useCallback(async () => {
    setSavingAction('camera-roll')
    setError(null)
    try {
      const dataUrl = await generatePng()
      await saveImageToCameraRoll(dataUrl, shareImageFilename(service.name, service.id))
    } catch {
      setError('Could not save to camera roll. Try Download PNG instead.')
    } finally {
      setSavingAction(null)
    }
  }, [generatePng, service.id, service.name])

  const busy = savingAction !== null
  const canSave = Boolean(imageSrc && exportReady && !loading && !busy)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share card</DialogTitle>
          <DialogDescription>
            Preview the promotional image for {service.name}, then save or download it to share.
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
          <>
            <div className="flex justify-center rounded-xl bg-sage-100 p-4">
              <ServiceShareCard service={service} imageSrc={imageSrc} />
            </div>
            {/* Off-screen card used only for export — avoids dialog borders in the PNG */}
            <div
              aria-hidden
              className="pointer-events-none fixed left-[-9999px] top-0 opacity-0"
            >
              <ServiceShareCard ref={exportRef} service={service} imageSrc={imageSrc} />
            </div>
          </>
        ) : null}

        {error && imageSrc && <p className="text-sm text-error">{error}</p>}

        {cameraRollAvailable && imageSrc && !loading && (
          <p className="text-xs text-sage-500">
            Tap Add to camera roll, then choose Save Image on iPhone or Save to Photos on Android.
          </p>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {cameraRollAvailable && (
            <Button
              className="gap-1.5"
              disabled={!canSave}
              onClick={() => void handleSaveToCameraRoll()}
            >
              {savingAction === 'camera-roll' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Smartphone className="h-4 w-4" aria-hidden />
              )}
              Add to camera roll
            </Button>
          )}
          <Button
            variant={cameraRollAvailable ? 'secondary' : 'default'}
            className="gap-1.5"
            disabled={!canSave}
            onClick={() => void handleDownload()}
          >
            {savingAction === 'download' ? (
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
