import { articlesData } from '../../src/data/articles.js'

const slugs = new Set(articlesData.map(({ path }) => path.replace(/^articles\//, '').replace(/\.html$/, '')))
const voterIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const headers = new Headers({
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
      'X-Content-Type-Options': 'nosniff'
    })
    const json = (body, status = 200) => Response.json(body, { status, headers })

    if (origin && origin === env.ALLOWED_ORIGIN) headers.set('Access-Control-Allow-Origin', origin)
    else if (origin !== null || request.method !== 'GET') return json({ error: 'Origin not allowed.' }, 403)

    if (url.pathname !== '/votes') return json({ error: 'Not found.' }, 404)
    if (request.method === 'OPTIONS') {
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'X-Voter-Id')
      headers.set('Access-Control-Max-Age', '600')
      return new Response(null, { status: 204, headers })
    }
    if (request.method !== 'GET' && request.method !== 'POST') {
      headers.set('Allow', 'GET, POST, OPTIONS')
      return json({ error: 'Method not allowed.' }, 405)
    }

    const slug = url.searchParams.get('slug')
    const bulkRead = request.method === 'GET' && slug === null
    if (!bulkRead && !slugs.has(slug)) return json({ error: 'Unknown article.' }, 404)
    const voterId = request.headers.get('X-Voter-Id')
    if (request.method === 'POST' && !voterIdPattern.test(voterId ?? '')) {
      return json({ error: 'Invalid voter ID.' }, 400)
    }

    try {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
      const limiter = request.method === 'POST' ? env.WRITE_LIMIT : env.READ_LIMIT
      const { success } = await limiter.limit({ key: ip })
      if (!success) return json({ error: 'Too many requests. Try again in a minute.' }, 429)

      if (bulkRead) {
        const { results } = await env.DB.prepare('SELECT slug, COUNT(*) AS count FROM helpful_votes GROUP BY slug').all()
        const totals = new Map(results.map(({ slug, count }) => [slug, count]))
        return json({ counts: Object.fromEntries([...slugs].map((slug) => [slug, totals.get(slug) ?? 0])) })
      }

      const count = env.DB.prepare('SELECT COUNT(*) AS count FROM helpful_votes WHERE slug = ?').bind(slug)
      if (request.method === 'GET') return json(await count.first())

      const insert = env.DB.prepare(
        'INSERT INTO helpful_votes (slug, voter_id) VALUES (?, ?) ON CONFLICT (slug, voter_id) DO NOTHING'
      ).bind(slug, voterId)
      const [, tally] = await env.DB.batch([insert, count])
      return json({ count: tally.results[0].count })
    } catch (error) {
      console.error('Helpful vote service failed:', error)
      return json({ error: 'Voting service temporarily unavailable.' }, 503)
    }
  }
}
