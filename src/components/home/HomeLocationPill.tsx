import { Link } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { useApp } from '@/context/AppContext'

export function HomeLocationPill() {
  const { location } = useApp()

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-hunter/15 bg-white/80 px-4 py-3 shadow-sm">
      <ReilyIcon name="location" size="sm" variant="sage" label="" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-hunter">Showing places near</p>
        <p className="truncate text-sm font-medium text-sage-800">
          {location?.label ?? 'Set your location'}
        </p>
      </div>
      <Link
        to="/profile"
        className="shrink-0 text-sm font-medium text-blue-muted hover:text-hunter focus-ring rounded px-1"
      >
        Change
      </Link>
    </div>
  )
}
