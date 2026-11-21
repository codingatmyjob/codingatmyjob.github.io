import { describe, expect, it } from 'vitest'
import { packTagOrder } from '../src/scripts/tag-packing.js'

describe('card tag packing', () => {
  it('pairs wide tags with narrow tags without moving the first tag', () => {
    expect(packTagOrder([58, 55, 36, 33], 100, 6)).toEqual([0, 2, 1, 3])
  })

  it('preserves the original order if rearranging cannot save a row', () => {
    expect(packTagOrder([70, 40, 50, 35], 100, 6)).toEqual([0, 1, 2, 3])
    expect(packTagOrder([70, 40, 50, 35], 220, 6)).toEqual([0, 1, 2, 3])
  })
})
