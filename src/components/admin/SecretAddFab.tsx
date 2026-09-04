import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isSecretAddSearch } from '@/lib/config'
import { useApp } from '@/context/AppContext'

/** Floating + - only visible when admin secret is typed in search */
export function SecretAddFab() {
  const { filters, location } = useApp()

  if (!isSecretAddSearch(filters.search)) return null

  const addUrl = location
    ? `/add-service/new?lat=${location.latitude}&lng=${location.longitude}`
    : '/add-service/new'

  return (
    <Link
      to={addUrl}
      className="fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-hunter text-white shadow-[0_4px_16px_rgba(53,94,59,0.35)] active:scale-95 transition-transform focus-ring lg:hidden bottom-[calc(49px+env(safe-area-inset-bottom,0px)+0.75rem)]"
      aria-label="Add facility"
    >
      <Plus className="h-6 w-6" strokeWidth={2} aria-hidden />
    </Link>
  )
}

/** Desktop sidebar add link when secret search is active */
export function SecretAddSidebarLink() {
  const { filters } = useApp()

  if (!isSecretAddSearch(filters.search)) return null

  return (
    <div className="border-t border-sage-100 p-4">
      <Link
        to="/add-service"
        className="flex items-center justify-center gap-2 rounded-xl bg-hunter px-4 py-3 text-sm font-medium text-white hover:bg-sage-600 focus-ring min-h-11"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add facility
      </Link>
    </div>
  )
}
