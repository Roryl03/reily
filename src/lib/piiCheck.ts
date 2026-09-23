const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_RE = /(\+44|0)\s*\d[\d\s()-]{8,}\d/
const POSTCODE_RE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i

export interface PiiWarning {
  type: 'email' | 'phone' | 'postcode'
  message: string
}

export function detectPiiWarnings(text: string): PiiWarning[] {
  const warnings: PiiWarning[] = []
  if (EMAIL_RE.test(text)) {
    warnings.push({
      type: 'email',
      message: 'Your review may contain an email address. Please remove personal contact details.',
    })
  }
  if (PHONE_RE.test(text)) {
    warnings.push({
      type: 'phone',
      message: 'Your review may contain a phone number. Please remove personal contact details.',
    })
  }
  if (POSTCODE_RE.test(text)) {
    warnings.push({
      type: 'postcode',
      message: 'Consider removing specific addresses or postcodes that could identify someone.',
    })
  }
  return warnings
}
