import { ChevronRight } from 'lucide-react'
import { ReilyIcon, type ReilyColorVariant, type ReilyIconName } from '@/components/icons'
import { SUPPORT_SECTIONS, sectionLabel, type SupportSection } from '@/types/supportResource'

const SECTION_META: Record<
  SupportSection,
  { icon: ReilyIconName; variant: ReilyColorVariant; hint: string }
> = {
  'education-sen': {
    icon: 'education',
    variant: 'blue',
    hint: 'Assessments, advice and tuition',
  },
  'health-therapy': {
    icon: 'healthcare',
    variant: 'blue',
    hint: 'Therapy, CAMHS and continence support',
  },
  'social-care': {
    icon: 'community-groups',
    variant: 'terracotta',
    hint: 'Respite, family hubs and autism support',
  },
  'legal-rights': {
    icon: 'support-services',
    variant: 'sage',
    hint: 'Rights, advocacy and free legal advice',
  },
  'financial-practical': {
    icon: 'shopping',
    variant: 'gold',
    hint: 'Benefits, grants and practical help',
  },
  'community-inclusion': {
    icon: 'community-groups',
    variant: 'sage',
    hint: 'Community groups and inclusive activities',
  },
  'local-clubs': {
    icon: 'activities',
    variant: 'terracotta',
    hint: 'Clubs, groups and parent networks',
  },
  'accessible-sensory': {
    icon: 'sensory-friendly',
    variant: 'lavender',
    hint: 'Quiet hours, sensory spaces and access',
  },
  'accessible-transport': {
    icon: 'location',
    variant: 'blue',
    hint: 'Buses, ferries and community transport',
  },
  helplines: {
    icon: 'support-services',
    variant: 'terracotta',
    hint: 'Someone to talk to, day or night',
  },
}

export function SupportCategoryGrid({
  counts,
  onSelect,
}: {
  counts: Map<SupportSection, number>
  onSelect: (section: SupportSection) => void
}) {
  return (
    <div className="space-y-2">
      {SUPPORT_SECTIONS.map((section) => {
        const count = counts.get(section.id) ?? 0
        if (count === 0) return null
        const meta = SECTION_META[section.id]

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className="ios-card group flex w-full items-center gap-3 p-4 text-left touch-scale focus-ring min-h-[60px] sm:min-h-[5.5rem]"
          >
            <ReilyIcon name={meta.icon} size="md" variant={meta.variant} />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-medium text-sage-900 leading-snug">{sectionLabel(section.id)}</p>
              <p className="mt-0.5 text-[15px] text-sage-600 line-clamp-2">{meta.hint}</p>
              <p className="mt-1 text-[13px] text-sage-500">{count} services</p>
            </div>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-sage-300"
              aria-hidden
            />
          </button>
        )
      })}
    </div>
  )
}
