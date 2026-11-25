import { describe, expect, it } from 'vitest'
import { getUpdatedDate } from '../src/data/articleDates.js'

describe('article update dates', () => {
  it('formats an update date later than publication', () => {
    expect(getUpdatedDate({ publishedAt: '2026-11-20', updatedAt: '2026-11-24' })).toBe('November 24, 2026')
  })

  it('omits update dates that are equal to or earlier than publication', () => {
    expect(getUpdatedDate({ publishedAt: '2026-11-20', updatedAt: '2026-11-20' })).toBeNull()
    expect(getUpdatedDate({ publishedAt: '2026-11-20', updatedAt: '2026-11-19' })).toBeNull()
  })

  it('omits invalid or incomplete date pairs', () => {
    expect(getUpdatedDate({ publishedAt: 'not-a-date', updatedAt: '2026-11-24' })).toBeNull()
    expect(getUpdatedDate({ publishedAt: '2026-11-20' })).toBeNull()
  })
})
