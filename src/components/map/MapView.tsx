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
import { getCategoryPinTileMarkup, PIN_HEAD_CENTER_Y_RATIO } from '@/lib/mapPinIcons'
import { formatDistance, getCategoryColor } from '@/lib/utils'
import type { ServiceWithMeta, UserLocation } from '@/types/service'

function createPinIcon(
  category: string,
  color: string,
  selected = false,
  count = 1,
) {
  const width = selected ? 36 : 32
  const height = selected ? 44 : 38
  const headY = Math.round(height * PIN_HEAD_CENTER_Y_RATIO)
  const tileMarkup = getCategoryPinTileMarkup(category, selected)
  const badge =
    count > 1
      ? `<span class="reily-map-pin-badge">${count}</span>`
      : ''
  return L.divIcon({
    className: 'reily-map-pin',
    html: `<div class="reily-map-pin-wrap" style="width:${width}px;height:${height}px">
      ${badge}
      <svg class="reily-map-pin-shape" width="${width}" height="${height}" viewBox="0 0 30 36" aria-hidden="true">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 21 15 21s15-9.75 15-21C30 6.716 23.284 0 15 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      </svg>
      <div class="reily-map-pin-tile" style="left:50%;top:${headY}px">
        ${tileMarkup}
      </div>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 6],
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

  const markerGroups = useMemo(() => {
    const mappable = services.filter(
      (s) =>
        !s.noFixedLocation &&
        Number.isFinite(s.latitude) &&
        Number.isFinite(s.longitude) &&
        (s.latitude !== 0 || s.longitude !== 0),
    )

    const groups = new Map<string, ServiceWithMeta[]>()
    for (const service of mappable) {
      const key = `${service.latitude.toFixed(5)},${service.longitude.toFixed(5)}`
      const list = groups.get(key) ?? []
      list.push(service)
      groups.set(key, list)
    }

    return [...groups.entries()].map(([key, items]) => {
      const [lat, lng] = key.split(',').map(Number)
      const primary =
        items.find((s) => s.id === selectedId) ??
        items[0]
      return {
        key,
        lat,
        lng,
        items,
        icon: createPinIcon(
          primary.category,
          getCategoryColor(primary.category),
          items.some((s) => s.id === selectedId),
          items.length,
        ),
      }
    })
  }, [services, selectedId])

  const markerPoints = useMemo(
    () => markerGroups.map((g) => [g.lat, g.lng] as [number, number]),
    [markerGroups],
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
          {...(MAP_TILES.subdomains ? { subdomains: MAP_TILES.subdomains } : {})}
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

        {markerGroups.map((group) => (
          <Marker
            key={group.key}
            position={[group.lat, group.lng]}
            icon={group.icon}
            zIndexOffset={group.items.some((s) => s.id === selectedId) ? 1000 : 0}
            eventHandlers={{
              click: () => onSelect?.(group.items[0]?.id ?? null),
            }}
          >
            {showPopups && (
              <Popup className="reily-map-popup">
                <div className="min-w-[200px] space-y-3">
                  {group.items.map((s) => (
                    <div key={s.id} className="space-y-2 border-b border-sage-100 pb-3 last:border-0 last:pb-0">
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
                  ))}
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
  const icon = createPinIcon('Activities', '#0B3D2E')

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
          {...(MAP_TILES.subdomains ? { subdomains: MAP_TILES.subdomains } : {})}
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
