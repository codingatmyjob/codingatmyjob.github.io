import { describe, expect, it } from 'vitest'
import relatedModule from '../scripts/generate-related-articles.cjs'

const {
  normalizeText,
  tokenize,
  jaccard,
  pickK,
  cosine,
  l2Normalize,
  scorePair,
  frequency,
  mergeWeightedFrequency,
} = relatedModule

describe('generate-related-articles', () => {
  it('normalizes punctuation and diacritics', () => {
    const normalized = normalizeText('Caf\u00e9, SOC 2!').trim().replace(/\s+/g, ' ')
    expect(normalized).toBe('cafe soc 2')
  })

  it('tokenizes and removes short/common stopwords', () => {
    const tokens = tokenize('This is a practical guide to SOC reports and audits')
    expect(tokens).toContain('practical')
    expect(tokens).toContain('guide')
    expect(tokens).not.toContain('this')
    expect(tokens).not.toContain('is')
  })

  it('computes jaccard similarity for tags', () => {
    expect(jaccard(['AI', 'Security'], ['security', 'network'])).toBeCloseTo(1 / 3)
  })

  it('chooses a bounded cluster count', () => {
    expect(pickK(1)).toBe(1)
    expect(pickK(3)).toBe(3)
    expect(pickK(100)).toBeLessThanOrEqual(8)
  })

  it('scores higher for matching vectors and tags', () => {
    const a = { vector: l2Normalize(new Map([['ai', 3], ['security', 2]])), tags: ['AI', 'Security'] }
    const b = { vector: l2Normalize(new Map([['ai', 3], ['security', 2]])), tags: ['Security'] }
    const c = { vector: l2Normalize(new Map([['gardening', 5]])), tags: ['gardening'] }

    expect(cosine(a.vector, b.vector)).toBeCloseTo(1)
    expect(scorePair(a, b)).toBeGreaterThan(scorePair(a, c))
  })

  it('merges weighted term frequencies correctly', () => {
    const base = new Map()
    mergeWeightedFrequency(base, frequency(['ai', 'ai', 'security']), 1.5)
    mergeWeightedFrequency(base, frequency(['security']), 2)

    expect(base.get('ai')).toBe(3)
    expect(base.get('security')).toBe(3.5)
  })
})
