import { Flag, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatVisitDate, hasLocalHelpfulVote, markReviewHelpful, reportReview } from '@/lib/reviews'
import type { PublicReview } from '@/types/reviews'
import { REVIEW_REPORT_REASONS } from '@/types/reviews'
import { StarRating } from './StarRating'

export function ReviewCard({
  review,
  onHelpfulChange,
}: {
  review: PublicReview
  onHelpfulChange?: (reviewId: string, count: number) => void
}) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount)
  const [foundHelpful, setFoundHelpful] = useState(
    review.userFoundHelpful || hasLocalHelpfulVote(review.id),
  )
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportDone, setReportDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const visitLabel = formatVisitDate(review.visitMonth, review.visitYear)

  const markHelpful = async () => {
    if (foundHelpful || submitting) return
    setSubmitting(true)
    const result = await markReviewHelpful(review.id)
    setSubmitting(false)
    if (result.ok) {
      setFoundHelpful(true)
      const next = helpfulCount + 1
      setHelpfulCount(next)
      onHelpfulChange?.(review.id, next)
    }
  }

  const submitReport = async () => {
    if (!reportReason) return
    setSubmitting(true)
    await reportReview(review.id, reportReason, reportDetails || undefined)
    setSubmitting(false)
    setReportDone(true)
    setReportOpen(false)
  }

  return (
    <article className="ios-card space-y-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <StarRating value={review.rating} readOnly size="sm" />
          <p className="font-semibold text-sage-900">{review.displayName}</p>
          {visitLabel && (
            <p className="text-sm text-sage-500">Visited {visitLabel}</p>
          )}
        </div>
        {review.wouldRecommend ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-hunter">
            <ThumbsUp className="h-4 w-4" aria-hidden />
            Recommended
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm text-sage-600">
            <ThumbsDown className="h-4 w-4" aria-hidden />
            Wouldn&apos;t recommend
          </span>
        )}
      </div>

      <p className="text-sage-800 leading-relaxed">&ldquo;{review.reviewText}&rdquo;</p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={foundHelpful || submitting}
          onClick={() => void markHelpful()}
          aria-pressed={foundHelpful}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-sage-700 hover:bg-sage-50 focus-ring disabled:opacity-60"
        >
          Was this helpful?
          <span className="inline-flex items-center gap-1 text-hunter">
            <ThumbsUp className="h-4 w-4" aria-hidden />
            {helpfulCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-sage-500 hover:text-sage-700 focus-ring"
        >
          <Flag className="h-4 w-4" aria-hidden />
          Report review
        </button>
      </div>

      {reportDone && (
        <p className="text-sm text-sage-600" role="status">
          Thank you — we&apos;ll review your report.
        </p>
      )}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report review</DialogTitle>
            <DialogDescription>
              Tell us why this review should be reviewed by our team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-details">Additional details (optional)</Label>
              <Textarea
                id="report-details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!reportReason || submitting} onClick={() => void submitReport()}>
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}
