import { useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { AdminLogin } from '@/components/auth/AdminLogin'
import { grantAdminAccess, hasAdminAccess } from '@/lib/config'

/** Admin routes - allowed emails only (no Supabase auth) */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const key = searchParams.get('key')
  const [unlocked, setUnlocked] = useState(hasAdminAccess())

  if (key && grantAdminAccess(key)) {
    return <Navigate to={location.pathname} replace />
  }

  if (!unlocked && !hasAdminAccess()) {
    return <AdminLogin onSuccess={() => setUnlocked(true)} />
  }

  return <>{children}</>
}
