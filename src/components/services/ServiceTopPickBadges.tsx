import { useEffect, useState } from 'react'
import { TopPickBadge } from './TopPickBadge'

interface BadgeData {
  year: number
  month: number
  scope: 'near' | 'across'
  rank: number
}

export function ServiceTopPickBadges({ serviceId }: { serviceId: string }) {
  const [badges, setBadges] = useState<BadgeData[]>([])

  useEffect(() => {
    void fetch(`/api/top-picks/badges?service_id=${encodeURIComponent(serviceId)}`)
      .then((res) => (res.ok ? res.json() : { badges: [] }))
      .then((data: { badges?: BadgeData[] }) => setBadges(data.badges ?? []))
      .catch(() => setBadges([]))
  }, [serviceId])

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {badges.slice(0, 3).map((badge) => (
        <TopPickBadge
          key={`${badge.year}-${badge.month}-${badge.scope}`}
          rank={badge.rank}
          year={badge.year}
          month={badge.month}
          scope={badge.scope}
        />
      ))}
    </div>
  )
}
