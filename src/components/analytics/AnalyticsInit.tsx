import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { initAnalytics, setAnalyticsLocation } from '@/lib/analytics'

export function AnalyticsInit() {
  const { location } = useApp()

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    setAnalyticsLocation(location)
  }, [location])

  return null
}
