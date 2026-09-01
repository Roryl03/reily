import { Link } from 'react-router-dom'
import { ReilyIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function HomeSupportSpotlight() {
  return (
    <Card className="overflow-hidden border-hunter/15 bg-gradient-to-r from-hunter-light/80 via-white to-blue-muted-light/30">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:flex-1">
          <ReilyIcon name="support-services" size="lg" variant="blue" label="Parent support" />
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-hunter">
              A gentle place to start
            </p>
            <h2 className="text-lg font-semibold text-sage-900">New to SEN? You&apos;re not alone.</h2>
            <p className="text-sm text-sage-700 leading-relaxed">
              Trusted helplines, advice centres and organisations across Northern Ireland — browse
              one category at a time.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0 w-full sm:w-auto">
          <Link to="/support">Open support directory</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
