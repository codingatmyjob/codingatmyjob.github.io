/*
 * Generate static read-time metadata for article HTML files.
 *
 * Output:
 *   public/data/read-times.json
 *   src/data/readTimes.js
 *
 * Key format:
 *   "articles/<slug>" -> "<n> min"
 */

const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const ARTICLES_DIR = path.join(ROOT, 'public', 'articles')
const OUTPUT_FILE = path.join(ROOT, 'public', 'data', 'read-times.json')
const OUTPUT_JS_FILE = path.join(ROOT, 'src', 'data', 'readTimes.js')

const AVERAGE_WPM = 200
const CODE_BLOCK_MINUTES = 0.25
const MIN_WORD_THRESHOLD = 10

function extractArticleHtml(fullHtml) {
  const match = fullHtml.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)
  return match ? match[1] : null
}

function stripHtml(htmlFragment) {
  return htmlFragment
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
}

function calculateReadTime(articleHtml) {
  const text = stripHtml(articleHtml)
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words < MIN_WORD_THRESHOLD) return null

  const codeBlocks = (articleHtml.match(/<(?:code|pre)\b/gi) || []).length
  const minutes = Math.ceil((words / AVERAGE_WPM) + (codeBlocks * CODE_BLOCK_MINUTES))
  return minutes < 1 ? '< 1 min' : `${minutes} min`
}

function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error(`Articles directory not found: ${ARTICLES_DIR}`)
    process.exit(1)
  }

  const readTimes = {}
  const files = fs.readdirSync(ARTICLES_DIR).filter(name => name.toLowerCase().endsWith('.html')).sort()

  for (const fileName of files) {
    const filePath = path.join(ARTICLES_DIR, fileName)
    const fullHtml = fs.readFileSync(filePath, 'utf8')
    const articleHtml = extractArticleHtml(fullHtml)
    const slug = path.parse(fileName).name
    const key = `articles/${slug}`
    readTimes[key] = articleHtml ? calculateReadTime(articleHtml) : null
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(readTimes, null, 2) + '\n', 'utf8')

  const jsModule = `export const readTimesByPath = ${JSON.stringify(readTimes, null, 2)}\n`
  fs.mkdirSync(path.dirname(OUTPUT_JS_FILE), { recursive: true })
  fs.writeFileSync(OUTPUT_JS_FILE, jsModule, 'utf8')

  const total = Object.keys(readTimes).length
  const resolved = Object.values(readTimes).filter(Boolean).length
  console.log(`Generated ${OUTPUT_FILE} and ${OUTPUT_JS_FILE} (${resolved}/${total} resolved)`)
}

main()
