import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatDistance, getCategoryColor } from '@/lib/utils'
import type { ServiceWithMeta, UserLocation } from '@/types/service'

function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="background:#5a8fa8;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(90,143,168,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
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
    map.setView(center, zoom)
  }, [map, center, zoom])
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
  onSelect,
  interactive = true,
  height = '400px',
  showPopups = true,
}: MapViewProps) {
  const center: [number, number] = location
    ? [location.latitude, location.longitude]
    : [54.5656, -6.3234]

  const markers = useMemo(
    () =>
      services.map((s) => ({
        ...s,
        icon: createIcon(getCategoryColor(s.category)),
      })),
    [services],
  )

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-sage-100">
      <MapContainer
        center={center}
        zoom={location ? 11 : 8}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        className="h-full w-full"
        aria-label="Map showing nearby services"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={location ? 11 : 8} />

        {location && (
          <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
            {showPopups && (
              <Popup>
                <p className="text-sm font-medium">Your approximate area</p>
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
            eventHandlers={{
              click: () => onSelect?.(s.id),
            }}
          >
            {showPopups && (
              <Popup>
                <div className="space-y-2 min-w-[180px]">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-sage-600">{s.category}</p>
                  {s.distanceMiles !== undefined && (
                    <p className="text-xs">{formatDistance(s.distanceMiles)} away</p>
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
  onMove,
  height = '200px',
}: {
  lat: number
  lng: number
  onMove?: (lat: number, lng: number) => void
  height?: string
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-sage-200">
      <MapContainer center={[lat, lng]} zoom={15} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController center={[lat, lng]} zoom={15} />
        <DraggableMarker lat={lat} lng={lng} onMove={onMove} />
      </MapContainer>
    </div>
  )
}

function DraggableMarker({
  lat,
  lng,
  onMove,
}: {
  lat: number
  lng: number
  onMove?: (lat: number, lng: number) => void
}) {
  const icon = createIcon('#355E3B')
  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      draggable={!!onMove}
      eventHandlers={{
        dragend: (e) => {
          const pos = e.target.getLatLng()
          onMove?.(pos.lat, pos.lng)
        },
      }}
    />
  )
}

export function MapPreviewCard({
  service,
}: {
  service: ServiceWithMeta
}) {
  return (
    <div className="rounded-2xl border border-sage-100 bg-white p-4 shadow-lg">
      <h3 className="font-semibold text-sage-900">{service.name}</h3>
      <p className="text-sm text-sage-600">{service.category}</p>
      {service.distanceMiles !== undefined && (
        <p className="text-sm text-sage-500 mt-1">{formatDistance(service.distanceMiles)} away</p>
      )}
      <Button asChild size="sm" className="mt-3 w-full">
        <Link to={`/service/${service.id}`}>View details</Link>
      </Button>
    </div>
  )
}
