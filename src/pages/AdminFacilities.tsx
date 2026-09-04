import { Check, Plus, Trash2, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { ServiceImage } from '@/components/services/ServiceImage'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { isSupabaseEnabled } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { isPublicService } from '@/types/service'
import type { Service } from '@/types/service'

type AdminTab = 'facilities' | 'requests'

export function AdminFacilitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') === 'requests' ? 'requests' : 'facilities') as AdminTab
  const {
    services,
    servicesLoading,
    deleteService,
    acceptServiceRequest,
    declineServiceRequest,
  } = useApp()

  const facilities = (isSupabaseEnabled
    ? services.filter(isPublicService)
    : services.filter(
        (s) =>
          isPublicService(s) &&
          (s.submittedByCurrentUser || s.source === 'community'),
      )
  ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const requests = services
    .filter((s) => s.verificationStatus === 'pending')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const setTab = (next: AdminTab) => {
    if (next === 'facilities') {
      searchParams.delete('tab')
    } else {
      searchParams.set('tab', next)
    }
    setSearchParams(searchParams, { replace: true })
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Manage facilities</h1>
          <p className="text-sage-600 mt-1">Add, edit, review or remove listings on Reilly.</p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link to="/add-service/new">
            <Plus className="h-4 w-4" aria-hidden />
            Add facility
          </Link>
        </Button>
      </header>

      <div
        className="flex gap-1 rounded-xl bg-sage-100 p-1"
        role="tablist"
        aria-label="Admin sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'facilities'}
          className={cn(
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-ring',
            tab === 'facilities'
              ? 'bg-white text-sage-900 shadow-sm'
              : 'text-sage-600 hover:text-sage-800',
          )}
          onClick={() => setTab('facilities')}
        >
          Facilities
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'requests'}
          className={cn(
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-ring',
            tab === 'requests'
              ? 'bg-white text-sage-900 shadow-sm'
              : 'text-sage-600 hover:text-sage-800',
          )}
          onClick={() => setTab('requests')}
        >
          Requests
          {requests.length > 0 && (
            <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-hunter px-1.5 py-0.5 text-xs text-white">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {servicesLoading ? (
        <p className="text-center text-sage-600 py-12">Loading…</p>
      ) : tab === 'requests' ? (
        requests.length === 0 ? (
          <div className="ios-card p-8 text-center">
            <p className="text-sage-600">No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((s) => (
              <RequestCard
                key={s.id}
                service={s}
                onAccept={() => void acceptServiceRequest(s.id)}
                onDecline={() => {
                  if (
                    confirm(
                      `Decline "${s.name}"? This will permanently remove the request.`,
                    )
                  ) {
                    void declineServiceRequest(s.id)
                  }
                }}
              />
            ))}
          </div>
        )
      ) : facilities.length === 0 ? (
        <div className="ios-card p-8 text-center space-y-4">
          <p className="text-sage-600">No facilities yet.</p>
          <Button asChild>
            <Link to="/add-service/new">Add your first facility</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {facilities.map((s) => (
            <div
              key={s.id}
              className="ios-card overflow-hidden flex flex-col sm:flex-row sm:items-stretch"
            >
              <ServiceImage
                src={s.images[0]}
                category={s.category}
                className="h-28 w-full sm:h-auto sm:w-32 object-cover shrink-0"
              />
              <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-sage-900">{s.name}</p>
                  <p className="text-sm text-sage-600">
                    {s.town} · {s.category}
                    {s.source === 'demo' && (
                      <span className="ml-2 text-sage-400">(demo)</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/service/${s.id}`}>Preview</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/add-service/edit/${s.id}`}>Edit</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (
                        confirm(
                          `Delete "${s.name}"? This cannot be undone.`,
                        )
                      ) {
                        void deleteService(s.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({
  service: s,
  onAccept,
  onDecline,
}: {
  service: Service
  onAccept: () => void
  onDecline: () => void
}) {
  return (
    <div className="ios-card overflow-hidden flex flex-col sm:flex-row sm:items-stretch">
      <ServiceImage
        src={s.images[0]}
        category={s.category}
        className="h-28 w-full sm:h-auto sm:w-32 object-cover shrink-0"
      />
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div>
          <p className="font-semibold text-sage-900">{s.name}</p>
          <p className="text-sm text-sage-600">
            {s.town} · {s.category}
          </p>
          {s.email && (
            <p className="text-sm text-sage-500 mt-1">{s.email}</p>
          )}
          <p className="text-xs text-sage-400 mt-1">
            Submitted {new Date(s.createdAt).toLocaleDateString('en-GB')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link to={`/add-service/edit/${s.id}`}>Review details</Link>
          </Button>
          <Button size="sm" className="gap-1.5" onClick={onAccept}>
            <Check className="h-4 w-4" aria-hidden />
            Accept
          </Button>
          <Button size="sm" variant="destructive" className="gap-1.5" onClick={onDecline}>
            <X className="h-4 w-4" aria-hidden />
            Decline
          </Button>
        </div>
      </div>
    </div>
  )
}
