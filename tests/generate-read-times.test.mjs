import { describe, expect, it } from 'vitest'
import readTimesModule from '../scripts/generate-read-times.cjs'

const { extractArticleHtml, calculateReadTime, stripHtml } = readTimesModule

describe('generate-read-times', () => {
  it('extracts only article inner HTML when article exists', () => {
    const html = '<section>ignore</section><article><h1>Title</h1><p>Hello world</p></article>'
    expect(extractArticleHtml(html)).toContain('<h1>Title</h1>')
  })

  it('returns null when article tag is missing', () => {
    expect(extractArticleHtml('<div>no article</div>')).toBeNull()
  })

  it('strips tags and decodes common entities', () => {
    const cleaned = stripHtml('<p>One &amp; two &lt;three&gt;</p>')
    expect(cleaned).toContain('One & two <three>')
  })

  it('returns null for very short content', () => {
    const shortArticle = '<p>tiny words only here</p>'
    expect(calculateReadTime(shortArticle)).toBeNull()
  })

  it('adds code block penalty to read time', () => {
    const repeatedWords = 'word '.repeat(200)
    const articleWithoutCode = `<p>${repeatedWords}</p>`
    const articleWithCode = `<p>${repeatedWords}</p><pre>const x = 1</pre>`

    expect(calculateReadTime(articleWithoutCode)).toBe('1 min')
    expect(calculateReadTime(articleWithCode)).toBe('2 min')
  })
})
