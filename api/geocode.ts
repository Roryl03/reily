const USER_AGENT = 'AskReillyNI/1.0 (https://askreillyni.com; contact@askreillyni.com)'

export default async function handler(
  req: { query: Record<string, string | string[] | undefined> },
  res: {
    status: (code: number) => { json: (body: unknown) => void }
  },
) {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter q' })
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycodes', 'gb,ie')
    url.searchParams.set('q', q)

    const upstream = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    })

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Geocoding failed' })
    }

    const results = (await upstream.json()) as Array<{
      lat?: string
      lon?: string
      display_name?: string
    }>

    const hit = results[0]
    if (!hit?.lat || !hit?.lon) {
      return res.status(404).json({ error: 'Address not found' })
    }

    return res.status(200).json({
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      displayName: hit.display_name,
    })
  } catch {
    return res.status(500).json({ error: 'Geocoding service unavailable' })
  }
}
