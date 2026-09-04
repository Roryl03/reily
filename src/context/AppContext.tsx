import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { filterServices, sortServices } from '@/lib/filters'
import { dataService } from '@/lib/storage'
import { fetchServices, removeService, upsertService } from '@/lib/serviceRepository'
import { isSupabaseEnabled } from '@/lib/supabase'
import { initializeSupportStorage } from '@/lib/supportStorage'
import { generateId } from '@/lib/utils'
import type {
  Service,
  ServiceFilters,
  ServiceReport,
  ServiceWithMeta,
  SortOption,
  UserLocation,
  UserPreferences,
} from '@/types/service'
import { DEFAULT_FILTERS, DEFAULT_PREFERENCES, DEMO_LOCATION, isLiveService, NI_TOWNS } from '@/types/service'

interface AppContextValue {
  services: Service[]
  servicesLoading: boolean
  servicesError: string | null
  preferences: UserPreferences
  location: UserLocation | null
  favourites: string[]
  filters: ServiceFilters
  sort: SortOption
  filteredServices: ServiceWithMeta[]
  locationLoading: boolean
  locationError: string | null
  setFilters: (filters: ServiceFilters | ((prev: ServiceFilters) => ServiceFilters)) => void
  setSort: (sort: SortOption) => void
  setLocation: (location: UserLocation) => void
  requestCurrentLocation: () => Promise<void>
  searchByTownOrPostcode: (query: string) => boolean
  completeOnboarding: () => void
  saveService: (service: Service) => Promise<Service>
  deleteService: (id: string) => Promise<void>
  acceptServiceRequest: (id: string) => Promise<void>
  declineServiceRequest: (id: string) => Promise<void>
  duplicateService: (id: string) => Promise<Service | null>
  toggleFavourite: (id: string) => boolean
  isFavourite: (id: string) => boolean
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  saveReport: (report: Omit<ServiceReport, 'id' | 'createdAt'>) => void
  reports: ServiceReport[]
  refreshServices: () => Promise<void>
  clearDemoData: () => Promise<void>
  resetApp: () => void
  getServiceById: (id: string) => Service | undefined
  addRecentlyViewed: (id: string) => void
  recentlyViewedIds: string[]
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(isSupabaseEnabled)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [location, setLocationState] = useState<UserLocation | null>(null)
  const [favourites, setFavourites] = useState<string[]>([])
  const [filters, setFilters] = useState<ServiceFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>('recommended')
  const [reports, setReports] = useState<ServiceReport[]>([])
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const loadServicesFromStore = useCallback(async () => {
    if (isSupabaseEnabled) {
      setServicesLoading(true)
      setServicesError(null)
      try {
        const list = await fetchServices()
        setServices(list)
      } catch (err) {
        setServicesError(err instanceof Error ? err.message : 'Failed to load services')
        setServices([])
      } finally {
        setServicesLoading(false)
      }
    } else {
      setServices(dataService.loadServices())
    }
  }, [])

  const refreshServices = useCallback(async () => {
    await loadServicesFromStore()
    setFavourites(dataService.loadFavourites())
    setReports(dataService.loadReports())
    setRecentlyViewedIds(dataService.loadRecentlyViewed().map((r) => r.serviceId))
  }, [loadServicesFromStore])

  useEffect(() => {
    if (!isSupabaseEnabled) {
      dataService.initializeStorage()
    }
    initializeSupportStorage()
    void refreshServices()
    setPreferences(dataService.loadPreferences())
    setLocationState(dataService.loadLocation())
    setFilters((f) => ({
      ...f,
      radius: dataService.loadPreferences().searchRadius,
    }))
  }, [refreshServices])

  const setLocation = useCallback((loc: UserLocation) => {
    setLocationState(loc)
    dataService.saveLocation(loc)
    setLocationError(null)
  }, [])

  const requestCurrentLocation = useCallback(async () => {
    setLocationLoading(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocation({ ...DEMO_LOCATION, label: 'Randalstown area (geolocation unavailable)' })
      setLocationLoading(false)
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: 'Near your current location',
        isApproximate: true,
      })
    } catch {
      setLocationError(
        "We couldn't access your location. You can still search using a town or postcode.",
      )
    } finally {
      setLocationLoading(false)
    }
  }, [setLocation])

  const searchByTownOrPostcode = useCallback(
    (query: string): boolean => {
      const normalized = query.trim().toLowerCase()
      if (!normalized) return false

      const match = Object.entries(NI_TOWNS).find(([key, val]) => {
        return (
          key.includes(normalized) ||
          normalized.includes(key) ||
          val.label.toLowerCase().includes(normalized)
        )
      })

      if (match) {
        const [, coords] = match
        setLocation({
          latitude: coords.lat,
          longitude: coords.lng,
          label: `${coords.label}, Northern Ireland`,
          isApproximate: true,
        })
        setLocationError(null)
        return true
      }
      return false
    },
    [setLocation],
  )

  const completeOnboarding = useCallback(() => {
    const updated = { ...preferences, onboardingComplete: true }
    setPreferences(updated)
    dataService.savePreferences(updated)
  }, [preferences])

  const saveService = useCallback(
    async (service: Service) => {
      if (isSupabaseEnabled) {
        const saved = await upsertService(service)
        await refreshServices()
        return saved
      }
      const saved = dataService.saveService(service)
      await refreshServices()
      return saved
    },
    [refreshServices],
  )

  const deleteService = useCallback(
    async (id: string) => {
      if (isSupabaseEnabled) {
        await removeService(id)
      } else {
        dataService.deleteService(id)
      }
      await refreshServices()
    },
    [refreshServices],
  )

  const acceptServiceRequest = useCallback(
    async (id: string) => {
      const request = services.find((s) => s.id === id)
      if (!request || request.verificationStatus !== 'pending') return

      const now = new Date().toISOString()
      await saveService({
        ...request,
        verificationStatus: 'community',
        updatedAt: now,
        lastCheckedAt: now.split('T')[0],
      })
    },
    [services, saveService],
  )

  const declineServiceRequest = useCallback(
    async (id: string) => {
      await deleteService(id)
    },
    [deleteService],
  )

  const duplicateService = useCallback(
    async (id: string) => {
      const original = services.find((s) => s.id === id)
      if (!original) return null

      const now = new Date().toISOString()
      const copy: Service = {
        ...original,
        id: isSupabaseEnabled ? crypto.randomUUID() : generateId(),
        name: `${original.name} (copy)`,
        source: 'community',
        verificationStatus: 'community',
        submittedByCurrentUser: true,
        createdAt: now,
        updatedAt: now,
      }

      if (isSupabaseEnabled) {
        const saved = await upsertService(copy)
        await refreshServices()
        return saved
      }

      const saved = dataService.saveService(copy)
      await refreshServices()
      return saved
    },
    [services, refreshServices],
  )

  const toggleFavourite = useCallback((id: string) => {
    const result = dataService.toggleFavourite(id)
    setFavourites(dataService.loadFavourites())
    return result
  }, [])

  const isFavourite = useCallback((id: string) => favourites.includes(id), [favourites])

  const updatePreferences = useCallback(
    (partial: Partial<UserPreferences>) => {
      const updated = { ...preferences, ...partial }
      setPreferences(updated)
      dataService.savePreferences(updated)
      if (partial.searchRadius !== undefined) {
        setFilters((f) => ({ ...f, radius: partial.searchRadius! }))
      }
    },
    [preferences],
  )

  const saveReport = useCallback((report: Omit<ServiceReport, 'id' | 'createdAt'>) => {
    dataService.saveReport(report)
    setReports(dataService.loadReports())
  }, [])

  const clearDemoData = useCallback(async () => {
    if (isSupabaseEnabled) {
      const demos = services.filter((s) => s.source === 'demo')
      await Promise.all(demos.map((s) => removeService(s.id)))
    } else {
      dataService.clearDemoData()
    }
    await refreshServices()
  }, [services, refreshServices])

  const resetApp = useCallback(() => {
    dataService.resetApp()
    setPreferences(DEFAULT_PREFERENCES)
    setLocationState(null)
    setFilters(DEFAULT_FILTERS)
    void refreshServices()
  }, [refreshServices])

  const getServiceById = useCallback(
    (id: string) => services.find((s) => s.id === id),
    [services],
  )

  const addRecentlyViewed = useCallback((id: string) => {
    dataService.addRecentlyViewed(id)
    setRecentlyViewedIds(dataService.loadRecentlyViewed().map((r) => r.serviceId))
  }, [])

  const filteredServices = useMemo(() => {
    const visible = services.filter(isLiveService)
    const filtered = filterServices(visible, filters, location)
    return sortServices(filtered, sort)
  }, [services, filters, location, sort])

  const value: AppContextValue = {
    services,
    servicesLoading,
    servicesError,
    preferences,
    location,
    favourites,
    filters,
    sort,
    filteredServices,
    locationLoading,
    locationError,
    setFilters,
    setSort,
    setLocation,
    requestCurrentLocation,
    searchByTownOrPostcode,
    completeOnboarding,
    saveService,
    deleteService,
    acceptServiceRequest,
    declineServiceRequest,
    duplicateService,
    toggleFavourite,
    isFavourite,
    updatePreferences,
    saveReport,
    reports,
    refreshServices,
    clearDemoData,
    resetApp,
    getServiceById,
    addRecentlyViewed,
    recentlyViewedIds,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
