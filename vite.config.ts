import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GEOCODE_USER_AGENT =
  'AskReillyNI/1.0 (https://askreillyni.com; contact@askreillyni.com)'

function geocodeDevApi(): Plugin {
  return {
    name: 'geocode-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/geocode', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        const url = new URL(req.url ?? '', 'http://localhost')
        const q = url.searchParams.get('q')?.trim()
        if (!q) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing query parameter q' }))
          return
        }

        try {
          const nominatim = new URL('https://nominatim.openstreetmap.org/search')
          nominatim.searchParams.set('format', 'json')
          nominatim.searchParams.set('limit', '1')
          nominatim.searchParams.set('countrycodes', 'gb,ie')
          nominatim.searchParams.set('q', q)

          const upstream = await fetch(nominatim.toString(), {
            headers: { 'User-Agent': GEOCODE_USER_AGENT, Accept: 'application/json' },
          })

          if (!upstream.ok) {
            res.statusCode = upstream.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Geocoding failed' }))
            return
          }

          const results = (await upstream.json()) as Array<{
            lat?: string
            lon?: string
            display_name?: string
          }>
          const hit = results[0]
          if (!hit?.lat || !hit?.lon) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Address not found' }))
            return
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              lat: Number(hit.lat),
              lng: Number(hit.lon),
              displayName: hit.display_name,
            }),
          )
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Geocoding service unavailable' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), geocodeDevApi()],
  // Vercel Marketplace syncs SUPABASE_* - expose those alongside VITE_*
  envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_SUPABASE_', 'CARTO_', 'ADMIN_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
