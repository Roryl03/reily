import { Link } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'

export function HomeSupportSpotlight() {
  return (
    <section className="ios-card overflow-hidden p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <ReilyIcon name="support-services" size="md" variant="blue" label="" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-hunter/80">
            Start here
          </p>
          <h2 className="text-[17px] font-semibold text-sage-900 leading-snug">
            New to SEN? You&apos;re not alone.
          </h2>
          <p className="text-[15px] text-sage-600 leading-relaxed">
            Trusted helplines and advice across Northern Ireland.
          </p>
        </div>
      </div>
      <Button asChild className="mt-4 w-full" size="lg">
        <Link to="/support">Open support directory</Link>
      </Button>
    </section>
  )
}
