import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { track } from '@/lib/analytics'
import { detectPiiWarnings } from '@/lib/piiCheck'
import { submitReview } from '@/lib/reviews'
import { cn } from '@/lib/utils'
import { MONTH_LABELS } from '@/types/reviews'
import { useApp } from '@/context/AppContext'
import { StarRating } from './StarRating'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

export function ReviewForm({
  serviceId,
  onSubmitted,
}: {
  serviceId: string
  onSubmitted: () => void
}) {
  const { location } = useApp()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [visitMonth, setVisitMonth] = useState(String(new Date().getMonth() + 1))
  const [visitYear, setVisitYear] = useState(String(CURRENT_YEAR))
  const [reviewText, setReviewText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const piiWarnings = useMemo(() => detectPiiWarnings(reviewText), [reviewText])

  const handleSubmit = async () => {
    if (rating < 1 || wouldRecommend == null) {
      setError('Please add a star rating and recommendation.')
      return
    }
    if (reviewText.trim().length < 10) {
      setError('Please write at least a few sentences about your experience.')
      return
    }

    setSubmitting(true)
    setError('')
    const result = await submitReview(
      {
        serviceId,
        rating,
        wouldRecommend,
        visitMonth: Number(visitMonth),
        visitYear: Number(visitYear),
        reviewText: reviewText.trim(),
        isAnonymous,
        displayName: isAnonymous ? undefined : displayName.trim(),
      },
      location,
    )
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error ?? 'Something went wrong')
      return
    }

    track('REVIEW_SUBMITTED', { service_id: serviceId, rating })
    setSubmitted(true)
    onSubmitted()
  }

  if (submitted) {
    return (
      <Card className="border-hunter/20 bg-hunter-light/20">
        <CardContent className="p-5 space-y-2">
          <p className="font-semibold text-sage-900">Thank you for sharing your experience.</p>
          <p className="text-sm text-sage-600">
            Your review will appear once our team has checked it. This helps keep Ask Reilly safe
            for families.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        Write a review
      </Button>
    )
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div>
          <h3 className="font-semibold text-sage-900">Share your experience</h3>
          <p className="mt-1 text-sm text-sage-600">
            Reviews reflect individual experiences. They don&apos;t replace factual information about
            this service.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-sage-800">
          <strong>Please don&apos;t include children&apos;s names, personal information or anything
          that could identify another person.</strong>
        </div>

        <div className="space-y-2">
          <Label>Overall rating</Label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div className="space-y-2">
          <Label>Would you recommend this service?</Label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              aria-pressed={wouldRecommend === true}
              onClick={() => setWouldRecommend(true)}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium focus-ring',
                wouldRecommend === true
                  ? 'border-hunter bg-hunter text-white'
                  : 'border-sage-200 bg-white text-sage-800',
              )}
            >
              <ThumbsUp className="h-4 w-4" aria-hidden />
              Yes
            </button>
            <button
              type="button"
              aria-pressed={wouldRecommend === false}
              onClick={() => setWouldRecommend(false)}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium focus-ring',
                wouldRecommend === false
                  ? 'border-sage-600 bg-sage-700 text-white'
                  : 'border-sage-200 bg-white text-sage-800',
              )}
            >
              <ThumbsDown className="h-4 w-4" aria-hidden />
              No
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="visit-month">When did you visit?</Label>
            <Select value={visitMonth} onValueChange={setVisitMonth}>
              <SelectTrigger id="visit-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_LABELS.map((label, index) => (
                  <SelectItem key={label} value={String(index + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-year" className="sr-only">
              Year
            </Label>
            <Select value={visitYear} onValueChange={setVisitYear}>
              <SelectTrigger id="visit-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-text">Your experience</Label>
          <Textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell other families about your experience."
            rows={5}
          />
          {piiWarnings.map((warning) => (
            <p key={warning.type} className="text-sm text-amber-800" role="alert">
              {warning.message}
            </p>
          ))}
        </div>

        <div className="space-y-3">
          <Label>Display name</Label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              aria-pressed={isAnonymous}
              onClick={() => setIsAnonymous(true)}
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm font-medium focus-ring min-h-11',
                isAnonymous ? 'border-hunter bg-hunter-light text-hunter' : 'border-sage-200',
              )}
            >
              Post anonymously
            </button>
            <button
              type="button"
              aria-pressed={!isAnonymous}
              onClick={() => setIsAnonymous(false)}
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm font-medium focus-ring min-h-11',
                !isAnonymous ? 'border-hunter bg-hunter-light text-hunter' : 'border-sage-200',
              )}
            >
              Use my name
            </button>
          </div>
          {!isAnonymous && (
            <div className="space-y-1">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your public display name"
                maxLength={64}
              />
              <p className="text-xs text-sage-500">This name will be shown publicly on your review.</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button disabled={submitting} onClick={() => void handleSubmit()}>
            Submit review
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
