/** CARTO Voyager — clean basemap. Free key: https://carto.com/basemaps/apikey */
const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY?.trim()

export interface MapTileConfig {
  url: string
  attribution: string
  subdomains?: string
  maxZoom: number
}

function cartoTiles(): MapTileConfig {
  const keyParam = CARTO_API_KEY ? `?key=${CARTO_API_KEY}` : ''
  return {
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keyParam}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }
}

/** OpenStreetMap fallback when no CARTO key is configured. */
function osmTiles(): MapTileConfig {
  return {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }
}

/** Prefer CARTO with API key; fall back to OSM so the map never shows a watermark. */
export const MAP_TILES: MapTileConfig = CARTO_API_KEY ? cartoTiles() : osmTiles()

export const MAP_USES_CARTO = Boolean(CARTO_API_KEY)

/** Default centre — Northern Ireland */
export const NI_MAP_CENTER: [number, number] = [54.65, -6.8]
export const NI_MAP_ZOOM = 8
export const SERVICE_MAP_ZOOM = 12
export const PREVIEW_MAP_ZOOM = 16
