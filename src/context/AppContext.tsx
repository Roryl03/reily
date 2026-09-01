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
import type {
  Service,
  ServiceFilters,
  ServiceReport,
  ServiceWithMeta,
  SortOption,
  UserLocation,
  UserPreferences,
} from '@/types/service'
import { DEFAULT_FILTERS, DEFAULT_PREFERENCES, DEMO_LOCATION, NI_TOWNS } from '@/types/service'

interface AppContextValue {
  services: Service[]
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
  saveService: (service: Service) => Service
  deleteService: (id: string) => void
  duplicateService: (id: string) => Service | null
  toggleFavourite: (id: string) => boolean
  isFavourite: (id: string) => boolean
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  saveReport: (report: Omit<ServiceReport, 'id' | 'createdAt'>) => void
  reports: ServiceReport[]
  refreshServices: () => void
  clearDemoData: () => void
  resetApp: () => void
  getServiceById: (id: string) => Service | undefined
  addRecentlyViewed: (id: string) => void
  recentlyViewedIds: string[]
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [location, setLocationState] = useState<UserLocation | null>(null)
  const [favourites, setFavourites] = useState<string[]>([])
  const [filters, setFilters] = useState<ServiceFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>('recommended')
  const [reports, setReports] = useState<ServiceReport[]>([])
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const refreshServices = useCallback(() => {
    setServices(dataService.loadServices())
    setFavourites(dataService.loadFavourites())
    setReports(dataService.loadReports())
    setRecentlyViewedIds(dataService.loadRecentlyViewed().map((r) => r.serviceId))
  }, [])

  useEffect(() => {
    dataService.initializeStorage()
    setServices(dataService.loadServices())
    setPreferences(dataService.loadPreferences())
    setLocationState(dataService.loadLocation())
    setFavourites(dataService.loadFavourites())
    setReports(dataService.loadReports())
    setRecentlyViewedIds(dataService.loadRecentlyViewed().map((r) => r.serviceId))
    setFilters((f) => ({
      ...f,
      radius: dataService.loadPreferences().searchRadius,
    }))
  }, [])

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
    (service: Service) => {
      const saved = dataService.saveService(service)
      refreshServices()
      return saved
    },
    [refreshServices],
  )

  const deleteService = useCallback(
    (id: string) => {
      dataService.deleteService(id)
      refreshServices()
    },
    [refreshServices],
  )

  const duplicateService = useCallback(
    (id: string) => {
      const copy = dataService.duplicateService(id)
      refreshServices()
      return copy
    },
    [refreshServices],
  )

  const toggleFavourite = useCallback(
    (id: string) => {
      const result = dataService.toggleFavourite(id)
      setFavourites(dataService.loadFavourites())
      return result
    },
    [],
  )

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

  const saveReport = useCallback(
    (report: Omit<ServiceReport, 'id' | 'createdAt'>) => {
      dataService.saveReport(report)
      setReports(dataService.loadReports())
    },
    [],
  )

  const clearDemoData = useCallback(() => {
    dataService.clearDemoData()
    refreshServices()
  }, [refreshServices])

  const resetApp = useCallback(() => {
    dataService.resetApp()
    setPreferences(DEFAULT_PREFERENCES)
    setLocationState(null)
    setFilters(DEFAULT_FILTERS)
    refreshServices()
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
    const filtered = filterServices(services, filters, location)
    return sortServices(filtered, sort)
  }, [services, filters, location, sort])

  const value: AppContextValue = {
    services,
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
