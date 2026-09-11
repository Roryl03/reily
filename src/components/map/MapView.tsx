import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  MAP_TILES,
  NI_MAP_CENTER,
  NI_MAP_ZOOM,
  PREVIEW_MAP_ZOOM,
  SERVICE_MAP_ZOOM,
} from '@/lib/mapConfig'
import { formatDistance, getCategoryColor } from '@/lib/utils'
import type { ServiceWithMeta, UserLocation } from '@/types/service'

function createPinIcon(color: string, selected = false) {
  const size = selected ? 36 : 30
  const height = selected ? 44 : 36
  return L.divIcon({
    className: 'reily-map-pin',
    html: `<svg width="${size}" height="${height}" viewBox="0 0 30 36" aria-hidden="true" style="display:block;filter:drop-shadow(0 2px 4px rgba(11,61,46,0.25))">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 21 15 21s15-9.75 15-21C30 6.716 23.284 0 15 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="15" cy="14" r="5" fill="#ffffff" opacity="0.95"/>
    </svg>`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 4],
  })
}

const userIcon = L.divIcon({
  className: 'reily-map-user',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#5a8fa8;border:3px solid #fff;box-shadow:0 0 0 4px rgba(90,143,168,0.28)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function MapController({
  center,
  zoom,
}: {
  center: [number, number]
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: false })
  }, [map, center, zoom])
  return null
}

function FitServiceBounds({
  points,
  userPoint,
}: {
  points: [number, number][]
  userPoint?: [number, number]
}) {
  const map = useMap()

  useEffect(() => {
    const all = userPoint ? [...points, userPoint] : points
    if (all.length === 0) {
      map.setView(NI_MAP_CENTER, NI_MAP_ZOOM, { animate: false })
      return
    }
    if (all.length === 1) {
      map.setView(all[0], SERVICE_MAP_ZOOM, { animate: false })
      return
    }
    map.fitBounds(L.latLngBounds(all), {
      padding: [48, 48],
      maxZoom: 14,
      animate: false,
    })
  }, [map, points, userPoint])

  return null
}

interface MapViewProps {
  location: UserLocation | null
  services: ServiceWithMeta[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  interactive?: boolean
  height?: string
  showPopups?: boolean
}

export function MapView({
  location,
  services,
  selectedId,
  onSelect,
  interactive = true,
  height = '400px',
  showPopups = true,
}: MapViewProps) {
  const center: [number, number] = location
    ? [location.latitude, location.longitude]
    : NI_MAP_CENTER

  const markers = useMemo(
    () =>
      services
        .filter(
          (s) =>
            !s.noFixedLocation &&
            Number.isFinite(s.latitude) &&
            Number.isFinite(s.longitude) &&
            (s.latitude !== 0 || s.longitude !== 0),
        )
        .map((s) => ({
          ...s,
          icon: createPinIcon(getCategoryColor(s.category), s.id === selectedId),
        })),
    [services, selectedId],
  )

  const markerPoints = useMemo(
    () => markers.map((s) => [s.latitude, s.longitude] as [number, number]),
    [markers],
  )

  const userPoint = location
    ? ([location.latitude, location.longitude] as [number, number])
    : undefined

  return (
    <div style={{ height }} className="reily-map-shell overflow-hidden rounded-2xl border border-sage-100">
      <MapContainer
        center={center}
        zoom={location ? SERVICE_MAP_ZOOM : NI_MAP_ZOOM}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        className="h-full w-full"
        aria-label="Map showing nearby services"
      >
        <TileLayer
          attribution={MAP_TILES.attribution}
          url={MAP_TILES.url}
          subdomains={MAP_TILES.subdomains}
          maxZoom={MAP_TILES.maxZoom}
        />
        <FitServiceBounds points={markerPoints} userPoint={userPoint} />

        {location && (
          <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
            {showPopups && (
              <Popup className="reily-map-popup">
                <p className="text-sm font-medium text-sage-900">Your area</p>
                <p className="text-xs text-sage-600">{location.label}</p>
              </Popup>
            )}
          </Marker>
        )}

        {markers.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={s.icon}
            zIndexOffset={s.id === selectedId ? 1000 : 0}
            eventHandlers={{
              click: () => onSelect?.(s.id),
            }}
          >
            {showPopups && (
              <Popup className="reily-map-popup">
                <div className="min-w-[200px] space-y-2">
                  <p className="text-sm font-semibold text-sage-900">{s.name}</p>
                  <p className="text-xs text-sage-600">{s.category}</p>
                  <p className="text-xs leading-relaxed text-sage-700">
                    {s.address}, {s.town}, {s.postcode}
                  </p>
                  {s.distanceMiles !== undefined && (
                    <p className="text-xs text-sage-500">{formatDistance(s.distanceMiles)} away</p>
                  )}
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/service/${s.id}`}>View details</Link>
                  </Button>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export function MapPreview({
  lat,
  lng,
  height = '200px',
}: {
  lat: number
  lng: number
  onMove?: (lat: number, lng: number) => void
  height?: string
}) {
  const icon = createPinIcon('#0B3D2E')

  return (
    <div style={{ height }} className="reily-map-shell overflow-hidden rounded-xl border border-sage-200">
      <MapContainer
        center={[lat, lng]}
        zoom={PREVIEW_MAP_ZOOM}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution={MAP_TILES.attribution}
          url={MAP_TILES.url}
          subdomains={MAP_TILES.subdomains}
          maxZoom={MAP_TILES.maxZoom}
        />
        <MapController center={[lat, lng]} zoom={PREVIEW_MAP_ZOOM} />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  )
}

export function MapPreviewCard({
  service,
}: {
  service: ServiceWithMeta
}) {
  return (
    <div className="rounded-2xl border border-sage-100 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
      <h3 className="font-semibold text-sage-900">{service.name}</h3>
      <p className="text-sm text-sage-600">{service.category}</p>
      <p className="mt-1 text-xs leading-relaxed text-sage-700">
        {service.address}, {service.town}, {service.postcode}
      </p>
      {service.distanceMiles !== undefined && (
        <p className="mt-1 text-sm text-sage-500">{formatDistance(service.distanceMiles)} away</p>
      )}
      <Button asChild size="sm" className="mt-3 w-full">
        <Link to={`/service/${service.id}`}>View details</Link>
      </Button>
    </div>
  )
}
