import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { URL } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../workers/votes/index.js'

const origin = 'https://codingatmyjob.github.io'
const slug = 'using-prismjs-to-style-code'
const voter = '454ea1bc-f613-4cc4-8651-635b240a3f26'
const migration = readFileSync(new URL('../workers/votes/migrations/0001_helpful_votes.sql', import.meta.url), 'utf8')

describe('Helpful votes', () => {
  let database
  let env
  const call = (method, { article = slug, from = origin, id = voter } = {}) =>
    worker.fetch(new globalThis.Request(`https://votes.example/votes?slug=${article}`, {
      method,
      headers: { Origin: from, ...(method === 'POST' && { 'X-Voter-Id': id }) }
    }), env)

  beforeEach(() => {
    database = new DatabaseSync(':memory:')
    database.exec(migration)
    env = {
      ALLOWED_ORIGIN: origin,
      READ_LIMIT: { limit: vi.fn(async () => ({ success: true })) },
      WRITE_LIMIT: { limit: vi.fn(async () => ({ success: true })) },
      DB: {
        prepare: (sql) => ({
          all: () => ({ results: database.prepare(sql).all() }),
          bind: (...args) => {
            const statement = database.prepare(sql)
            return { first: () => statement.get(...args), all: () => ({ results: statement.all(...args) }) }
          }
        }),
        batch: (statements) => statements.map((statement) => statement.all())
      }
    }
  })

  afterEach(() => database.close())

  it('counts a retry once and allows independent votes on other articles', async () => {
    expect(await (await call('GET')).json()).toEqual({ count: 0 })
    expect(await (await call('POST')).json()).toEqual({ count: 1 })
    expect(await (await call('POST')).json()).toEqual({ count: 1 })
    expect(await (await call('POST', { article: 'how-fit-am-i' })).json()).toEqual({ count: 1 })
    expect(await (await call('GET')).json()).toEqual({ count: 1 })
  })

  it('allows the site preflight but rejects other origins and invalid vote inputs', async () => {
    const preflight = await call('OPTIONS')
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('Access-Control-Allow-Origin')).toBe(origin)
    const forbidden = await call('POST', { from: 'https://other.example' })
    expect(forbidden.status).toBe(403)
    expect(forbidden.headers.has('Access-Control-Allow-Origin')).toBe(false)
    expect((await call('POST', { article: 'not-an-article' })).status).toBe(404)
    expect((await call('POST', { id: 'invalid' })).status).toBe(400)
    expect(env.WRITE_LIMIT.limit).not.toHaveBeenCalled()
  })

  it('returns totals for published article tiles, including zeros, without individual vote records', async () => {
    await call('POST')
    database.prepare('INSERT INTO helpful_votes VALUES (?, ?)').run('removed-article', voter)
    const request = new globalThis.Request('https://votes.example/votes', { headers: { Origin: origin } })
    const response = await worker.fetch(request, env)
    expect(response.status).toBe(200)
    const { counts } = await response.json()
    expect(counts[slug]).toBe(1)
    expect(counts['how-fit-am-i']).toBe(0)
    expect(counts).not.toHaveProperty('removed-article')
    expect(JSON.stringify(counts)).not.toContain(voter)
  })

  it('does not record a rate-limited vote', async () => {
    env.WRITE_LIMIT.limit.mockResolvedValue({ success: false })
    expect((await call('POST')).status).toBe(429)
    expect(await (await call('GET')).json()).toEqual({ count: 0 })
  })

  it('moves old votes without duplicating them and rejects the retired slug', async () => {
    const oldSlug = 'cloudflare-worker-sql-article-upvotes'
    const newSlug = 'how-i-built-an-article-upvote-system'
    const secondVoter = '6bdf7265-57ef-430a-9b99-33925e2eb27a'
    const insert = database.prepare('INSERT INTO helpful_votes VALUES (?, ?)')
    insert.run(oldSlug, voter)
    insert.run(oldSlug, secondVoter)
    insert.run(newSlug, voter)
    database.exec(readFileSync(new URL('../workers/votes/migrations/0002_rename_article_upvote_system.sql', import.meta.url), 'utf8'))

    expect((await call('POST', { article: oldSlug })).status).toBe(404)
    expect(await (await call('POST', { article: newSlug })).json()).toEqual({ count: 2 })
    expect(await (await call('GET', { article: newSlug })).json()).toEqual({ count: 2 })
    expect(database.prepare('SELECT DISTINCT slug FROM helpful_votes').all()).toEqual([{ slug: newSlug }])
    const response = await worker.fetch(new globalThis.Request('https://votes.example/votes'), env)
    const { counts } = await response.json()
    expect(counts).not.toHaveProperty(oldSlug)
    expect(counts[newSlug]).toBe(2)
  })
})
