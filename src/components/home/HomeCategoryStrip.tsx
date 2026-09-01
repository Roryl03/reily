import { Link } from 'react-router-dom'
import { getCategoryIcon, ReilyIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/types/service'

const FEATURED_CATEGORIES = [
  'Support services',
  'Parks and outdoors',
  'Soft play',
  'Activities',
  'Community groups',
  'Healthcare',
] as const

export function HomeCategoryStrip() {
  return (
    <section aria-labelledby="home-categories-heading" className="space-y-3">
      <div className="home-section-header px-1">
        <div>
          <h2 id="home-categories-heading">What are you looking for?</h2>
          <p className="text-[15px] text-sage-500 mt-0.5">Swipe to browse</p>
        </div>
      </div>

      <div className="mobile-scroll-x flex gap-3 pb-1">
        {FEATURED_CATEGORIES.map((cat) => {
          const icon = getCategoryIcon(cat)
          const href =
            cat === 'Support services'
              ? '/support'
              : `/explore?category=${encodeURIComponent(cat)}`
          return (
            <Link
              key={cat}
              to={href}
              className="ios-card flex min-w-[112px] snap-start flex-col items-center gap-2.5 p-4 touch-scale"
              aria-label={cat}
            >
              <ReilyIcon name={icon.name} variant={icon.variant} size="md" label="" />
              <span className="text-center text-[13px] font-medium text-sage-700 leading-tight">
                {cat}
              </span>
            </Link>
          )
        })}
      </div>

      <Button asChild variant="secondary" size="lg">
        <Link to="/explore">All {CATEGORIES.length} categories</Link>
      </Button>
    </section>
  )
}
