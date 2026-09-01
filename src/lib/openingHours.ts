import type { OpenStatus, QuietHour, SenSession, Service, WeekOpeningHours } from '@/types/service'

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

type DayKey = (typeof DAY_KEYS)[number]

function getTodayKey(): DayKey {
  return DAY_KEYS[new Date().getDay()]
}

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function isTimeInRange(now: number, start: number, end: number): boolean {
  if (start <= end) return now >= start && now < end
  return now >= start || now < end
}

export function getOpenStatus(openingHours?: WeekOpeningHours): OpenStatus {
  if (!openingHours) return 'unknown'
  const today = getTodayKey()
  const hours = openingHours[today]
  if (!hours || hours.closed) return 'closed'

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = parseTime(hours.open)
  const closeMinutes = parseTime(hours.close)

  if (isTimeInRange(nowMinutes, openMinutes, closeMinutes)) return 'open'

  const minutesUntilOpen = openMinutes - nowMinutes
  if (minutesUntilOpen > 0 && minutesUntilOpen <= 60) return 'opens_soon'

  return 'closed'
}

export function formatOpenStatus(status: OpenStatus): string {
  switch (status) {
    case 'open':
      return 'Open now'
    case 'closed':
      return 'Closed'
    case 'opens_soon':
      return 'Opens soon'
    default:
      return 'Opening times not provided'
  }
}

export function hasQuietHourToday(quietHours?: QuietHour[]): boolean {
  if (!quietHours?.length) return false
  const today = getTodayKey()
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return quietHours.some((qh) => {
    if (qh.day !== today) return false
    return isTimeInRange(nowMinutes, parseTime(qh.start), parseTime(qh.end))
  })
}

export function hasSenSessionToday(senSessions?: SenSession[]): boolean {
  if (!senSessions?.length) return false
  const today = getTodayKey()
  return senSessions.some((s) => s.day === today)
}

export function formatDayHours(hours?: WeekOpeningHours): string[] {
  if (!hours) return ['Opening times not provided']
  const labels: Record<DayKey, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }
  return (Object.keys(labels) as DayKey[]).map((day) => {
    const d = hours[day]
    if (!d || d.closed) return `${labels[day]}: Closed`
    return `${labels[day]}: ${d.open} – ${d.close}`
  })
}

export function isOpenNow(service: Service): boolean {
  return getOpenStatus(service.openingHours) === 'open'
}

export function isQuietToday(service: Service): boolean {
  const { sensoryInformation, accessibilityFeatures } = service
  return (
    sensoryInformation.noiseLevel === 'quiet' ||
    accessibilityFeatures.quietHour === true ||
    hasQuietHourToday(service.quietHours)
  )
}
