import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'
import type { ReilyIconName } from './types'

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 2.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
}

function Svg({ children, className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      aria-hidden
      {...stroke}
      {...props}
    >
      {children}
    </svg>
  )
}

export function ReilyIconGlyph({
  name,
  className,
}: {
  name: ReilyIconName
  className?: string
}) {
  switch (name) {
    case 'activities':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
        </Svg>
      )
    case 'food-drink':
      return (
        <Svg className={className}>
          <path d="M6 8v11M6 8c0-2 1.5-3 3-3s3 1 3 3v11M12 8h5a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4h-3" />
          <path d="M8 5v3" />
        </Svg>
      )
    case 'parks-outdoors':
      return (
        <Svg className={className}>
          <path d="M12 4c-3 4-6 6-6 10a6 6 0 0 0 12 0c0-4-3-6-6-10Z" />
          <path d="M12 20v-2" />
        </Svg>
      )
    case 'support-services':
      return (
        <Svg className={className}>
          <path d="M12 21c-3.5-2.5-6-5.5-6-9a6 6 0 1 1 12 0c0 3.5-2.5 6.5-6 9Z" />
          <circle cx="12" cy="11" r="2.5" />
        </Svg>
      )
    case 'shopping':
      return (
        <Svg className={className}>
          <path d="M7 9V7a5 5 0 0 1 10 0v2" />
          <path d="M5 9h14l-1.2 10.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.5L5 9Z" />
        </Svg>
      )
    case 'cinema':
      return (
        <Svg className={className}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M8 10v4M12 10v4M16 10v4" />
        </Svg>
      )
    case 'soft-play':
      return (
        <Svg className={className}>
          <rect x="5" y="13" width="6" height="6" rx="1.5" />
          <rect x="13" y="9" width="6" height="6" rx="1.5" />
          <rect x="9" y="5" width="6" height="6" rx="1.5" />
        </Svg>
      )
    case 'accommodation':
      return (
        <Svg className={className}>
          <path d="M4 19V9l8-5 8 5v10" />
          <path d="M4 19h16M9 19v-5h6v5" />
        </Svg>
      )
    case 'education':
      return (
        <Svg className={className}>
          <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
          <path d="M8 10.5V16a4 4 0 0 0 8 0v-5.5" />
        </Svg>
      )
    case 'healthcare':
      return (
        <Svg className={className}>
          <path d="M12 21c-4-3-7-6-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4-3 7-7 10Z" />
        </Svg>
      )
    case 'haircuts':
      return (
        <Svg className={className}>
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </Svg>
      )
    case 'community-groups':
      return (
        <Svg className={className}>
          <circle cx="9" cy="9" r="2.5" />
          <circle cx="15" cy="9" r="2.5" />
          <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M15 14c2.2 0 4 1.5 4.5 3.5" />
        </Svg>
      )
    case 'home':
      return (
        <Svg className={className}>
          <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1v-7.5Z" />
        </Svg>
      )
    case 'explore':
      return (
        <Svg className={className}>
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16l4 4" />
        </Svg>
      )
    case 'map':
      return (
        <Svg className={className}>
          <path d="M9 5 4 7v13l5-2 6 2 5-2V5l-5 2-6-2Z" />
          <path d="M9 5v13M15 7v13" />
        </Svg>
      )
    case 'favourites':
      return (
        <Svg className={className}>
          <path d="M12 20.5S5 15.5 5 10a3.5 3.5 0 0 1 6.2-2.2A3.5 3.5 0 0 1 19 10c0 5.5-7 10.5-7 10.5Z" />
        </Svg>
      )
    case 'profile':
      return (
        <Svg className={className}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
        </Svg>
      )
    case 'add-service':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </Svg>
      )
    case 'search':
      return (
        <Svg className={className}>
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16l4 4" />
        </Svg>
      )
    case 'location':
      return (
        <Svg className={className}>
          <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
          <circle cx="12" cy="11" r="2.5" />
        </Svg>
      )
    case 'accessibility':
      return (
        <Svg className={className}>
          <circle cx="12" cy="5" r="2" />
          <path d="M7 9h10M12 7v8M9 21l3-6 3 6" />
        </Svg>
      )
    case 'quiet-hour':
      return (
        <Svg className={className}>
          <path d="M12 4a6 6 0 1 0 0 12" />
          <path d="M8 4h8M6 8H4M8 12H5M8 16H6" />
        </Svg>
      )
    case 'sensory-friendly':
      return (
        <Svg className={className}>
          <path d="M12 3c2 3 5 5 5 8a5 5 0 1 1-10 0c0-3 3-5 5-8Z" />
          <path d="M9 14h6" />
        </Svg>
      )
    case 'sen-session':
      return (
        <Svg className={className}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M8 10h8M8 14h5" />
        </Svg>
      )
    case 'wheelchair':
      return (
        <Svg className={className}>
          <circle cx="9" cy="18" r="2.5" />
          <circle cx="17" cy="18" r="2.5" />
          <path d="M9 18V11h4l2 3h3M9 11V8h3" />
        </Svg>
      )
    case 'accessible-toilet':
      return (
        <Svg className={className}>
          <circle cx="12" cy="6" r="2" />
          <path d="M8 10h8v2a4 4 0 0 1-4 4v4" />
          <path d="M10 20h4" />
        </Svg>
      )
    case 'changing-places':
      return (
        <Svg className={className}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </Svg>
      )
    case 'parking':
      return (
        <Svg className={className}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M10 8h3a2.5 2.5 0 0 1 0 5H10V8Z" />
        </Svg>
      )
    case 'booking-required':
      return (
        <Svg className={className}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4v3M15 4v3M5 10h14M9 14h2M13 14h2" />
        </Svg>
      )
    case 'indoor':
      return (
        <Svg className={className}>
          <path d="M5 19V9l7-4 7 4v10" />
          <path d="M9 19v-4h6v4" />
        </Svg>
      )
    case 'outdoor':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2" />
        </Svg>
      )
    case 'compass':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5 10 14l4.5-4.5Z" />
          <path d="M9.5 14.5 14 10" />
        </Svg>
      )
    case 'open-now':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2" />
        </Svg>
      )
    case 'weather':
      return (
        <Svg className={className}>
          <path d="M8 18h8a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5A3.5 3.5 0 0 0 8 18Z" />
          <circle cx="16" cy="8" r="2" />
        </Svg>
      )
    default:
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="8" />
        </Svg>
      )
  }
}
