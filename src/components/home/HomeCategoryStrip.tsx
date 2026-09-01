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
    <section aria-labelledby="home-categories-heading" className="space-y-4">
      <div className="home-section-header">
        <ReilyIcon name="explore" size="sm" variant="gold" label="" />
        <div>
          <h2 id="home-categories-heading" className="text-lg font-semibold text-sage-900">
            What are you looking for?
          </h2>
          <p className="text-sm text-sage-600">Tap a category — each opens places with that focus</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x -mx-1 px-1">
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
              className="flex min-w-[108px] snap-start flex-col items-center gap-2 rounded-2xl border border-sage-100 bg-white p-4 shadow-sm transition hover:border-hunter/25 hover:shadow-md focus-ring"
              aria-label={cat}
            >
              <ReilyIcon name={icon.name} variant={icon.variant} size="md" label="" />
              <span className="text-center text-xs font-medium text-sage-700 leading-tight">
                {cat}
              </span>
            </Link>
          )
        })}
      </div>

      <Button asChild variant="outline" className="w-full border-hunter/20 text-hunter hover:bg-hunter-light">
        <Link to="/explore">Browse all {CATEGORIES.length} categories</Link>
      </Button>
    </section>
  )
}
