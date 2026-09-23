import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GEOCODE_USER_AGENT =
  'AskReillyNI/1.0 (https://askreillyni.com; contact@askreillyni.com)'

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown>)
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function communityDevApi(env: Record<string, string>): Plugin {
  const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ??
    env.SUPABASE_PUBLISHABLE_KEY ??
    env.VITE_SUPABASE_ANON_KEY

  function dbHeaders(prefer?: string) {
    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    }
  }

  return {
    name: 'community-dev-api',
    configureServer(server) {
      if (!url || !key) {
        console.warn('[community-dev-api] Supabase env missing — community APIs disabled locally')
        return
      }

      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? ''
        const query = new URL(req.url ?? '', 'http://localhost').searchParams

        if (pathname === '/api/recommendations/stats' && req.method === 'GET') {
          const serviceId = query.get('service_id') ?? ''
          const statsRes = await fetch(
            `${url}/rest/v1/service_recommendations?service_id=eq.${encodeURIComponent(serviceId)}&ranking_eligible=eq.true&select=would_recommend`,
            { headers: dbHeaders() },
          )
          const rows = statsRes.ok
            ? ((await statsRes.json()) as Array<{ would_recommend: boolean }>)
            : []
          const positive = rows.filter((r) => r.would_recommend).length
          sendJson(res, 200, { positive, negative: rows.length - positive })
          return
        }

        if (pathname === '/api/recommendations/vote' && req.method === 'POST') {
          const body = await readBody(req)
          const upsertRes = await fetch(
            `${url}/rest/v1/service_recommendations?on_conflict=service_id,visitor_id`,
            {
              method: 'POST',
              headers: dbHeaders('resolution=merge-duplicates,return=minimal'),
              body: JSON.stringify({
                service_id: body.service_id,
                visitor_id: body.visitor_id,
                would_recommend: body.would_recommend,
                audience_type: body.audience_type ?? null,
                county: body.county ?? null,
                town: body.town ?? null,
                ranking_eligible: true,
                updated_at: new Date().toISOString(),
              }),
            },
          )
          sendJson(res, upsertRes.ok ? 200 : 500, upsertRes.ok ? { ok: true } : { error: 'Failed' })
          return
        }

        if (pathname === '/api/reviews/summary' && req.method === 'GET') {
          const serviceId = query.get('service_id') ?? ''
          const [reviewsRes, recsRes] = await Promise.all([
            fetch(
              `${url}/rest/v1/service_reviews?service_id=eq.${serviceId}&status=eq.approved&select=rating`,
              { headers: dbHeaders() },
            ),
            fetch(
              `${url}/rest/v1/service_recommendations?service_id=eq.${serviceId}&ranking_eligible=eq.true&select=would_recommend`,
              { headers: dbHeaders() },
            ),
          ])
          const reviews = reviewsRes.ok
            ? ((await reviewsRes.json()) as Array<{ rating: number }>)
            : []
          const recs = recsRes.ok
            ? ((await recsRes.json()) as Array<{ would_recommend: boolean }>)
            : []
          const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
          let sum = 0
          for (const r of reviews) {
            const rating = Math.min(5, Math.max(1, r.rating))
            distribution[rating] += 1
            sum += r.rating
          }
          const total = recs.length
          const positive = recs.filter((r) => r.would_recommend).length
          sendJson(res, 200, {
            averageRating: reviews.length >= 3 ? Math.round((sum / reviews.length) * 10) / 10 : null,
            reviewCount: reviews.length,
            distribution,
            percentRecommend: total >= 5 ? Math.round((positive / total) * 100) : null,
            recommendationTotal: total,
          })
          return
        }

        if (pathname === '/api/reviews/list' && req.method === 'GET') {
          const serviceId = query.get('service_id') ?? ''
          const listRes = await fetch(
            `${url}/rest/v1/service_reviews?service_id=eq.${serviceId}&status=eq.approved&select=id,rating,would_recommend,visit_month,visit_year,review_text,display_name,is_anonymous,helpful_count,created_at&order=helpful_count.desc&limit=100`,
            { headers: dbHeaders() },
          )
          const rows = listRes.ok ? ((await listRes.json()) as Array<Record<string, unknown>>) : []
          sendJson(res, 200, {
            reviews: rows.map((row) => ({
              id: row.id,
              rating: row.rating,
              wouldRecommend: row.would_recommend,
              visitMonth: row.visit_month,
              visitYear: row.visit_year,
              reviewText: row.review_text,
              displayName: row.is_anonymous
                ? 'Anonymous Ask Reilly user'
                : row.display_name ?? 'Ask Reilly user',
              helpfulCount: row.helpful_count,
              createdAt: row.created_at,
              userFoundHelpful: false,
            })),
          })
          return
        }

        next()
      })
    },
  }
}

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, ['', 'VITE_', 'SUPABASE_', 'ADMIN_'])
  return {
    plugins: [react(), tailwindcss(), geocodeDevApi(), communityDevApi(env)],
    envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_SUPABASE_', 'CARTO_', 'ADMIN_'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
