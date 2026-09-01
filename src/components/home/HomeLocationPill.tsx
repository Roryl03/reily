import { Link } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { useApp } from '@/context/AppContext'

export function HomeLocationPill() {
  const { location } = useApp()

  return (
    <div className="ios-group">
      <div className="ios-row !min-h-[52px]">
        <ReilyIcon name="location" size="sm" variant="sage" label="" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-sage-500">Near</p>
          <p className="truncate text-[17px] font-medium text-sage-900">
            {location?.label ?? 'Set your location'}
          </p>
        </div>
        <Link
          to="/profile"
          className="shrink-0 rounded-full bg-hunter-light px-3 py-1.5 text-[15px] font-semibold text-hunter touch-scale"
        >
          Change
        </Link>
      </div>
    </div>
  )
}
