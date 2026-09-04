import { cn } from '@/lib/utils'

const HUNTER = '#355E3B'
const CREAM = '#F5F0E8'
const GOLD = '#B8954F'
const BLUE = '#5A8FA8'

type LogoVariant = 'default' | 'onDark'

/** Shamrock - three soft leaves, Irish community */
function Shamrock({ fill }: { fill: string }) {
  return (
    <g opacity={0.85}>
      <ellipse cx="24" cy="37.8" rx="2.2" ry="2.8" fill={fill} transform="rotate(0 24 37.8)" />
      <ellipse cx="21" cy="39.5" rx="2" ry="2.6" fill={fill} transform="rotate(-28 21 39.5)" />
      <ellipse cx="27" cy="39.5" rx="2" ry="2.6" fill={fill} transform="rotate(28 27 39.5)" />
      <path d="M24 39.5v3.2" stroke={fill} strokeWidth="1.25" strokeLinecap="round" />
    </g>
  )
}

/**
 * Reilly mark - pin (places), heart (SEN families), infinity (autism/neurodiversity),
 * shamrock (Irish community).
 */
export function ReilyLogoMark({
  className,
  showInfinity = true,
  showShamrock = true,
  variant = 'default',
}: {
  className?: string
  showInfinity?: boolean
  showShamrock?: boolean
  variant?: LogoVariant
}) {
  const onDark = variant === 'onDark'
  const pinFill = onDark ? CREAM : HUNTER
  const heartFill = onDark ? HUNTER : CREAM
  const infinityStroke = onDark ? GOLD : GOLD
  const infinityStroke2 = onDark ? CREAM : BLUE
  const shamrockFill = onDark ? HUNTER : GOLD

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      {showInfinity && (
        <>
          {/* Neurodiversity infinity loop */}
          <path
            d="M14.5 20.5c0-4.2 3.6-7 7.5-5.8 1.8 0.6 3.1 2 3.7 3.6 0.6-1.6 1.9-3 3.7-3.6 3.9-1.2 7.5 1.6 7.5 5.8s-3.6 7-7.5 5.8c-1.8-0.6-3.1-2-3.7-3.6-0.6 1.6-1.9 3-3.7 3.6-3.9 1.2-7.5-1.6-7.5-5.8Z"
            stroke={infinityStroke2}
            strokeWidth="1.75"
            strokeLinecap="round"
            opacity={0.55}
          />
          <path
            d="M15 20.5c0-3.6 3-6 6.3-5 1.5 0.5 2.6 1.7 3.1 3.1 0.5-1.4 1.6-2.6 3.1-3.1 3.3-1 6.3 1.4 6.3 5 0 3.6-3 6-6.3 5-1.5-0.5-2.6-1.7-3.1-3.1-0.5 1.4-1.6 2.6-3.1 3.1-3.3 1-6.3-1.4-6.3-5Z"
            stroke={infinityStroke}
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Location pin */}
      <path
        d="M24 8c-5 0-9 4-9 9 0 6.5 9 15.5 9 15.5s9-9 9-15.5c0-5-4-9-9-9Z"
        fill={pinFill}
      />

      {/* Heart - care & SEN support */}
      <path
        d="M24 20.8c-1.9-2.3-4.7-3.8-4.7-6.5a2.75 2.75 0 0 1 5-1.5 2.75 2.75 0 0 1 5 1.5c0 2.7-2.8 4.2-4.7 6.5Z"
        fill={heartFill}
      />

      {showShamrock && <Shamrock fill={shamrockFill} />}
    </svg>
  )
}
