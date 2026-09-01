import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SupportCategoryGrid } from '@/components/support/SupportCategoryGrid'
import { SupportHero } from '@/components/support/SupportHero'
import { SupportQuickHelp } from '@/components/support/SupportQuickHelp'
import { SupportResourceCard } from '@/components/support/SupportResourceCard'
import { ReilyIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  filterSupportResources,
  groupBySection,
  loadSupportResources,
} from '@/lib/supportStorage'
import {
  DEFAULT_SUPPORT_FILTERS,
  SUPPORT_SECTIONS,
  SUPPORT_TOPICS,
  type SupportFilters,
  type SupportSection,
} from '@/types/supportResource'

const SECTION_INTROS: Partial<Record<SupportSection, string>> = {
  'education-sen':
    'Help with statements, assessments, educational psychology and specialist tuition.',
  'health-therapy':
    'Therapy teams, mental health support and practical health resources for children.',
  'social-care':
    'Family support, respite, autism organisations and charities that walk alongside you.',
  'legal-rights':
    'Free advice on children\'s rights, SEN law and representation when you need it.',
  'financial-practical':
    'Benefits, grants, transport help and everyday support that can ease the load.',
  'community-inclusion':
    'Inclusive activities, baby banks, libraries and community resources near you.',
  'local-clubs':
    'Parent groups, youth clubs and local networks — often the most reassuring first step.',
  'accessible-sensory':
    'Quieter sessions, sensory spaces, adapted activities and autism-aware services.',
  'accessible-transport':
    'Getting around Northern Ireland with confidence and the right assistance.',
  helplines: 'A listening ear when things feel heavy. You don\'t have to hold it all alone.',
}

export function SupportPage() {
  const [filters, setFilters] = useState<SupportFilters>(DEFAULT_SUPPORT_FILTERS)
  const [activeSection, setActiveSection] = useState<SupportSection | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const resources = useMemo(() => loadSupportResources(), [])

  const filtered = useMemo(
    () => filterSupportResources(resources, filters),
    [resources, filters],
  )

  const grouped = useMemo(() => groupBySection(resources), [resources])
  const sectionCounts = useMemo(() => {
    const counts = new Map<SupportSection, number>()
    for (const section of SUPPORT_SECTIONS) {
      counts.set(section.id, grouped.get(section.id)?.length ?? 0)
    }
    return counts
  }, [grouped])

  const featured = resources.filter((r) => r.featured).slice(0, 4)

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.section) ||
    Boolean(filters.topic) ||
    Boolean(filters.coverage) ||
    filters.helplinesOnly

  const isBrowsingSection = activeSection !== null && !hasActiveFilters
  const isSearchMode = hasActiveFilters && !isBrowsingSection

  function clearAll() {
    setFilters(DEFAULT_SUPPORT_FILTERS)
    setActiveSection(null)
    setFiltersOpen(false)
  }

  function openSection(section: SupportSection) {
    setActiveSection(section)
    setFilters(DEFAULT_SUPPORT_FILTERS)
    setFiltersOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openHelplines() {
    openSection('helplines')
  }

  const sectionItems = activeSection ? grouped.get(activeSection) ?? [] : []
  const activeSectionMeta = activeSection
    ? SUPPORT_SECTIONS.find((s) => s.id === activeSection)
    : null

  return (
    <div className="space-y-6 pb-4">
      {!isBrowsingSection && !isSearchMode && <SupportHero />}

      {!isBrowsingSection && !isSearchMode && (
        <SupportQuickHelp resources={resources} onViewHelplines={openHelplines} />
      )}

      {isBrowsingSection && activeSectionMeta && (
        <header className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-auto px-2 py-1 text-sage-600"
            onClick={() => setActiveSection(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all categories
          </Button>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-sage-900">{activeSectionMeta.label}</h1>
            {SECTION_INTROS[activeSection] && (
              <p className="text-sage-600 leading-relaxed max-w-2xl">
                {SECTION_INTROS[activeSection]}
              </p>
            )}
            <p className="text-sm text-sage-500">{sectionItems.length} services in this category</p>
          </div>
        </header>
      )}

      {isSearchMode && (
        <header className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-auto px-2 py-1 text-sage-600"
            onClick={clearAll}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to categories
          </Button>
          <h1 className="text-xl font-semibold text-sage-900">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            {filters.search && (
              <span className="font-normal text-sage-600"> for &ldquo;{filters.search}&rdquo;</span>
            )}
          </h1>
        </header>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-500"
            aria-hidden
          />
          <Input
            variant="search"
            value={filters.search}
            onChange={(e) => {
              setActiveSection(null)
              setFilters({ ...filters, search: e.target.value })
            }}
            placeholder="Search support"
            className="pl-10"
            aria-label="Search support services"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-sage-500 hover:text-sage-800 focus-ring"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isBrowsingSection && (
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="ios-group flex w-full items-center justify-between px-4 py-3.5 text-[17px] text-sage-900 touch-scale focus-ring min-h-[50px]"
          >
            <span>
              {hasActiveFilters && !filters.search
                ? 'Filters applied'
                : 'More filters'}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-sage-500 transition ${filtersOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        )}

        {filtersOpen && !isBrowsingSection && (
          <div className="ios-group p-4 space-y-3">
            <Select
              value={filters.topic ?? 'all'}
              onValueChange={(v) => {
                setActiveSection(null)
                setFilters({
                  ...filters,
                  topic: v === 'all' ? undefined : (v as SupportFilters['topic']),
                })
              }}
            >
              <SelectTrigger aria-label="Filter by topic">
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {SUPPORT_TOPICS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={filters.helplinesOnly ? 'default' : 'secondary'}
                className="flex-1 min-h-11"
                onClick={() => {
                  setActiveSection(null)
                  setFilters({ ...filters, helplinesOnly: !filters.helplinesOnly })
                }}
              >
                Helplines only
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" className="min-h-11" onClick={clearAll}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {isBrowsingSection && (
        <section className="space-y-3">
          {sectionItems.map((r) => (
            <SupportResourceCard key={r.id} resource={r} compact showSection={false} />
          ))}
        </section>
      )}

      {isSearchMode && (
        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center space-y-3 border border-sage-100">
              <p className="text-sage-700">Nothing matched that search.</p>
              <p className="text-sm text-sage-500">
                Try a different word, or browse by category instead.
              </p>
              <Button variant="secondary" onClick={clearAll}>
                Browse categories
              </Button>
            </div>
          ) : (
            filtered.map((r) => (
              <SupportResourceCard
                key={r.id}
                resource={r}
                compact
                showSection={!filters.section}
              />
            ))
          )}
        </section>
      )}

      {!isBrowsingSection && !isSearchMode && (
        <>
          {featured.length > 0 && (
            <section aria-labelledby="featured-support-heading" className="space-y-3">
              <div>
                <h2 id="featured-support-heading" className="text-lg font-medium text-sage-900">
                  Good places to start
                </h2>
                <p className="text-sm text-sage-600 mt-0.5">
                  Trusted organisations many parents reach out to first.
                </p>
              </div>
              <div className="space-y-3">
                {featured.map((r) => (
                  <SupportResourceCard key={r.id} resource={r} compact showSection />
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="browse-categories-heading" className="space-y-4">
            <div>
              <h2 id="browse-categories-heading" className="text-lg font-medium text-sage-900">
                Browse by category
              </h2>
              <p className="text-sm text-sage-600 mt-0.5">
                Choose one area to explore — no need to take it all in at once.
              </p>
            </div>
            <SupportCategoryGrid counts={sectionCounts} onSelect={openSection} />
          </section>
        </>
      )}

      {!isBrowsingSection && (
        <Card className="bg-sage-50/80 border-sage-100">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <ReilyIcon name="map" size="sm" variant="sage" />
              <div>
                <p className="font-medium text-sage-900">Local groups and venues</p>
                <p className="text-sm text-sage-600">
                  Support groups and activities near you on the map.
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link to="/explore?category=Support%20services">View on map</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
