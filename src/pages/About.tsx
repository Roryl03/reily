import { useState } from 'react'
import { MobilePageHeader } from '@/components/layout/MobilePageHeader'
import { usePageMeta } from '@/hooks/usePageMeta'
import { cn } from '@/lib/utils'

/** Place Bronagh's family photograph at public/about/bronagh-family.jpg */
export const ABOUT_FAMILY_PHOTO_SRC = '/about/bronagh-family.jpg'

const FAMILY_PHOTO_ALT =
  'Bronagh O\'Reilly with her husband and three sons, smiling together outdoors in a family photograph.'

export function AboutPage() {
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [photoError, setPhotoError] = useState(false)

  usePageMeta(
    'About Us | Ask Reilly',
    'Meet Bronagh O\'Reilly and learn why Reilly was built to help families find inclusive places, support and trusted resources in one accessible place.',
  )

  return (
    <article className="pb-10">
      <MobilePageHeader title="About Us" subtitle="Built from lived experience" />

      <header className="mb-8 hidden lg:block">
        <h1 className="font-display text-3xl text-sage-900">About Us</h1>
        <p className="mt-1 text-sage-600">Built from lived experience. Made for every family.</p>
      </header>

      {/* Hero */}
      <header className="relative -mx-4 overflow-hidden bg-hunter px-6 py-12 text-white sm:mx-0 sm:rounded-2xl sm:px-10 sm:py-14 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            background:
              'radial-gradient(circle at 85% 15%, #8A9B79 0%, transparent 45%), radial-gradient(circle at 10% 90%, #DFA138 0%, transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-decorative text-2xl text-hunter-light sm:text-3xl">
            Ask Reilly. Help make their world bigger.
          </p>
          <h1 className="about-display-on-hunter mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
            About Reilly
          </h1>
          <p className="mt-4 text-base leading-relaxed text-hunter-light sm:text-lg">
            Built from lived experience. Made for every family.
          </p>
        </div>
      </header>

      {/* Founder intro + family photo */}
      <section
        aria-labelledby="founder-heading"
        className="mt-8 lg:mt-12"
      >
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <figure className="ios-card overflow-hidden p-2 lg:sticky lg:top-24">
            {!photoError ? (
              <img
                src={ABOUT_FAMILY_PHOTO_SRC}
                alt={FAMILY_PHOTO_ALT}
                className={cn(
                  'mx-auto block w-full rounded-xl object-contain object-center',
                  photoLoaded ? 'opacity-100' : 'opacity-0',
                )}
                style={{ maxHeight: 'min(70vh, 520px)' }}
                onLoad={() => setPhotoLoaded(true)}
                onError={() => setPhotoError(true)}
              />
            ) : null}
            {(!photoLoaded || photoError) && (
              <div
                className={cn(
                  'flex min-h-[280px] flex-col items-center justify-center rounded-xl bg-hunter-light px-6 py-10 text-center',
                  photoLoaded && !photoError && 'hidden',
                )}
                role={photoError ? 'img' : undefined}
                aria-label={photoError ? FAMILY_PHOTO_ALT : undefined}
              >
                <p className="font-display text-xl text-sage-900">Bronagh and family</p>
                <p className="mt-2 max-w-xs text-sm text-sage-600">
                  {photoError
                    ? 'Add the family photograph to public/about/bronagh-family.jpg to display it here.'
                    : 'Loading family photograph…'}
                </p>
              </div>
            )}
            <figcaption className="sr-only">{FAMILY_PHOTO_ALT}</figcaption>
          </figure>

          <div className="space-y-5 text-[15px] leading-relaxed text-sage-700 sm:text-base max-w-prose lg:max-w-none">
            <h2 id="founder-heading" className="font-display text-2xl text-sage-900 sm:text-3xl">
              Hi, I&apos;m Bronagh O&apos;Reilly
            </h2>
            <p>
              Founder of Reilly and, most importantly, mum to three boys, two of whom are autistic.
            </p>
            <p>
              Reilly started with something very simple: I wanted to make life a little easier for
              families like mine.
            </p>
            <p>
              As a parent of children with additional needs, I know how much thought can go into
              things that other families might never have to consider.
            </p>
          </div>
        </div>
      </section>

      {/* Questions parents ask */}
      <section
        aria-labelledby="questions-heading"
        className="mt-10 rounded-2xl bg-hunter-light p-6 sm:p-8"
      >
        <h2 id="questions-heading" className="font-display text-2xl text-sage-900">
          The questions we ask
        </h2>
        <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-sage-700 sm:text-base">
          {[
            'Where can we go?',
            'Will they be comfortable there?',
            'Will they be understood?',
            'What facilities are available?',
            'Is there somewhere quiet if things become overwhelming?',
            'Is the activity truly inclusive?',
            'What support is available, and why is it so difficult to find?',
          ].map((question) => (
            <li key={question} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-accent" aria-hidden />
              <span>{question}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[15px] leading-relaxed text-sage-700 sm:text-base">
          Much of the information families need already exists, but it is scattered across websites,
          social media pages, organisations, businesses and recommendations from other parents.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-sage-700 sm:text-base">
          Sometimes, when you cannot find the answers, it feels easier simply not to go.
        </p>
        <p className="mt-4 font-medium text-sage-900">
          That is the part I want Reilly to help change.
        </p>
      </section>

      {/* Mission */}
      <section aria-labelledby="mission-heading" className="mt-10 space-y-5">
        <h2 id="mission-heading" className="font-display text-2xl text-sage-900 sm:text-3xl">
          Help make their world bigger
        </h2>
        <p className="max-w-prose text-[15px] leading-relaxed text-sage-700 sm:text-base">
          Having additional needs should not mean having a smaller world.
        </p>
        <p className="max-w-prose text-[15px] leading-relaxed text-sage-700 sm:text-base">
          Our children deserve opportunities to explore, play, learn, travel, make memories and
          experience new things. Families should not have to constantly worry about whether their
          children will fit in or be understood when they arrive.
        </p>
        <p className="max-w-prose text-[15px] leading-relaxed text-sage-700 sm:text-base">
          I created Reilly to bring the information that can make those experiences possible into
          one accessible place.
        </p>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { accent: 'bg-sage-accent', text: 'A place to discover inclusive venues and activities.' },
            { accent: 'bg-coral', text: 'A place to find support and useful resources.' },
            { accent: 'bg-gold', text: 'A place to understand what facilities are available before you arrive.' },
          ].map(({ accent, text }) => (
            <li
              key={text}
              className="ios-card flex gap-3 p-4 text-sm leading-relaxed text-sage-700 sm:text-[15px]"
            >
              <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', accent)} aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <p className="max-w-prose font-display text-xl text-hunter sm:text-2xl">
          And, ultimately, a place where you can simply Ask Reilly.
        </p>
      </section>

      {/* Inclusive for all */}
      <section
        aria-labelledby="every-family-heading"
        className="mt-10 ios-card space-y-5 p-6 sm:p-8"
      >
        <h2 id="every-family-heading" className="font-display text-2xl text-sage-900">
          For every family
        </h2>
        <p className="max-w-prose text-[15px] leading-relaxed text-sage-700 sm:text-base">
          Reilly began with my experience as a mum to three boys, two of whom are autistic, but it
          is not only about autism.
        </p>
        <p className="max-w-prose text-[15px] leading-relaxed text-sage-700 sm:text-base">
          Every child is different. Additional needs come in many forms, both visible and invisible,
          and every family&apos;s experience is their own.
        </p>
        <p className="max-w-prose text-[15px] leading-relaxed text-sage-700 sm:text-base">
          My goal is for Reilly to become an accessible and useful resource for every parent and
          carer who needs it.
        </p>
        <p className="max-w-prose text-[15px] leading-relaxed text-sage-700 sm:text-base">
          I also want Reilly to celebrate the businesses, organisations and people already making an
          effort to include our children, and to encourage even more to do the same.
        </p>
      </section>

      {/* Quote */}
      <blockquote className="relative mt-10 overflow-hidden rounded-2xl bg-hunter px-6 py-10 text-white sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold/20 blur-2xl"
          aria-hidden
        />
        <p className="about-display-on-hunter text-xl leading-snug sm:text-2xl lg:text-[1.65rem] lg:leading-snug">
          Because inclusion does not just mean being allowed through the door.
        </p>
        <p className="mt-4 font-decorative text-2xl text-hunter-light sm:text-3xl">
          It means feeling like you were considered before you arrived.
        </p>
      </blockquote>

      {/* Closing */}
      <section aria-labelledby="closing-heading" className="mt-10 space-y-5 max-w-prose">
        <h2 id="closing-heading" className="sr-only">
          Our hope for Reilly
        </h2>
        <p className="text-[15px] leading-relaxed text-sage-700 sm:text-base">
          If Reilly can remove even a little uncertainty, help a parent discover support they did
          not know existed, or give a family the confidence to try somewhere new, then it is doing
          what I created it to do.
        </p>
        <p className="text-[15px] leading-relaxed text-sage-700 sm:text-base">
          Our children&apos;s lives should not become smaller because their needs are different.
        </p>
        <p className="font-display text-xl text-sage-900 sm:text-2xl">
          Together, we can help make their world bigger.
        </p>
      </section>

      {/* Sign-off */}
      <footer className="mt-12 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="font-display text-2xl text-sage-900">Bronagh O&apos;Reilly</p>
        <p className="mt-1 text-sm font-medium text-sage-500">Founder of Reilly</p>
      </footer>
    </article>
  )
}
