/*
 * =============================================================================
 * Related Articles Generator
 * =============================================================================
 *
 * Purpose
 * -------
 * This script builds a lightweight recommendation index for a static site.
 * It reads article HTML files from `public/articles`, computes similarity scores
 * between articles, and writes a compact lookup map to:
 *
 *   public/data/related-articles.json
 *
 * Runtime consumers (your article page UI) can fetch that JSON and render
 * recommendations instantly, with zero heavy NLP in the browser.
 *
 * Why this approach
 * -----------------
 * - Static websites benefit from doing expensive work at build time.
 * - Recommendations remain deterministic and cacheable.
 * - Browser runtime only does O(1) lookup by article slug.
 *
 * Method (High Level)
 * -------------------
 * 1) Parse each article's title, tags, and body text.
 * 2) Tokenize and normalize text (lowercase, remove punctuation/diacritics,
 *    remove stopwords).
 * 3) Build weighted TF-IDF vectors per article:
 *      - title tokens weighted 1.5x
 *      - tag tokens weighted 2x
 *      - body tokens weighted 1x
 * 4) Cluster vectors with cosine-based k-means (for thematic grouping).
 * 5) Prefer candidate neighbors from the same k-means cluster, then rank by:
 *      score = cosine(vectorA, vectorB) + 0.2 * jaccard(tagsA, tagsB)
 * 6) Keep top N neighbors above a minimum floor.
 * 7) Emit JSON metadata including max observed score for display normalization.
 *
 * Score semantics
 * ---------------
 * - Cosine component range: 0-1
 * - Tag boost range:        0-0.2
 * - Theoretical max score:  1.2
 * - Practical scores in real content are usually much lower.
 *
 * Maintenance notes
 * -----------------
 * When to run
 * -----------
 * - Automatic: runs during `npm run build` via the `prebuild` hook.
 * - Manual: run `npm run generate:related` after changing article content,
 *   article metadata, tags, or recommendation/scoring logic.
 *
 * Commands
 * --------
 * - `npm run generate:related`   Regenerate only related-articles JSON.
 * - `npm run build`              Regenerate related JSON, then build site.
 *
 * - Keep this file dependency-light for portability.
 * - If extracted into a standalone project, this file is intentionally
 *   documented as a single-source reference implementation.
 *
 * =============================================================================
 */

const fs = require('fs')
const path = require('path')

/** Absolute project root as resolved from current working directory. */
const ROOT = process.cwd()
/** Directory containing raw static HTML articles. */
const ARTICLES_DIR = path.join(ROOT, 'public', 'articles')
/** Output file consumed by the web app at runtime. */
const OUTPUT_FILE = path.join(ROOT, 'public', 'data', 'related-articles.json')

// Minimum relatedness score required for an article to be included in output.
// This score uses a custom scale from this file's formula (not a literal percent).
// Example: 0.08 means include only pairs with score >= 0.08.
const MIN_RELATED_SCORE = 0.1

/**
 * Basic stopword list to reduce noise.
 *
 * Notes:
 * - Kept intentionally compact and English-focused for this dataset.
 * - Extend per locale/domain if extracted to standalone package.
 */
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but', 'by', 'can', 'did', 'do', 'does',
  'for', 'from', 'had', 'has', 'have', 'he', 'her', 'here', 'hers', 'him', 'his', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'me', 'my', 'not', 'of', 'on', 'or', 'our', 'ours', 'out', 'she', 'so', 'that', 'the',
  'their', 'theirs', 'them', 'there', 'these', 'they', 'this', 'to', 'too', 'up', 'us', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with', 'you', 'your', 'yours'
])

/**
 * Remove tags and decode a handful of common HTML entities.
 *
 * @param {string} html - Raw HTML fragment or document.
 * @returns {string} Plain text approximation for tokenization.
 */
function stripHtml(html) {
  return html
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

  /**
   * Normalize text for token matching.
   *
   * Operations:
   * - lowercase
   * - Unicode NFD decomposition + diacritic removal
   * - keep only a-z, 0-9, and whitespace
   *
   * @param {string} value
   * @returns {string}
   */
function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
}

  /**
   * Tokenize normalized text and filter noisy tokens.
   *
   * Filtering rules:
   * - remove empty tokens
   * - token length must be > 2
   * - token not present in STOPWORDS
   *
   * @param {string} value
   * @returns {string[]}
   */
function tokenize(value) {
  const tokens = normalizeText(value)
    .split(/\s+/)
    .filter(Boolean)
    .filter(token => token.length > 2 && !STOPWORDS.has(token))
  return tokens
}

/**
 * Convert a token list into a frequency map (term frequency).
 *
 * @param {string[]} tokens
 * @returns {Map<string, number>}
 */
function frequency(tokens) {
  const map = new Map()
  for (const token of tokens) {
    map.set(token, (map.get(token) || 0) + 1)
  }
  return map
}

/**
 * Merge weighted token frequency maps into one sparse vector map.
 *
 * @param {Map<string, number>} target
 * @param {Map<string, number>} source
 * @param {number} weight
 */
function mergeWeightedFrequency(target, source, weight) {
  for (const [token, count] of source.entries()) {
    target.set(token, (target.get(token) || 0) + (count * weight))
  }
}

/**
 * Extract best-effort title from article HTML.
 *
 * Priority:
 * 1) first <h1>
 * 2) <title>
 *
 * @param {string} html
 * @returns {string}
 */
function getTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1) return stripHtml(h1[1]).trim()
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return title ? stripHtml(title[1]).trim() : ''
}

/**
 * Extract tag labels from <div class="tags"> ... <span class="tag">...
 *
 * @param {string} html
 * @returns {string[]}
 */
function getTags(html) {
  const tagsBlock = html.match(/<div[^>]*class=["'][^"']*tags[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
  if (!tagsBlock) return []
  const tagMatches = [...tagsBlock[1].matchAll(/<span[^>]*class=["'][^"']*tag[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)]
  return tagMatches.map(match => stripHtml(match[1]).trim()).filter(Boolean)
}

/**
 * Compute cosine similarity (dot product) between two L2-normalized vectors.
 *
 * Because vectors are normalized beforehand, the dot product equals cosine
 * similarity. If either vector is missing, similarity is treated as 0.
 *
 * @param {Map<string, number>} a
 * @param {Map<string, number>} b
 * @returns {number}
 */
function cosine(a, b) {
  if (!a || !b) return 0
  let dot = 0
  for (const [token, value] of a.entries()) {
    const other = b.get(token)
    if (other) dot += value * other
  }
  return dot
}

/**
 * L2-normalize a sparse vector map.
 *
 * @param {Map<string, number>} vec
 * @returns {Map<string, number>} A new normalized map (or original if zero norm).
 */
function l2Normalize(vec) {
  let normSq = 0
  for (const value of vec.values()) normSq += value * value
  const norm = Math.sqrt(normSq)
  if (!norm) return vec
  const out = new Map()
  for (const [token, value] of vec.entries()) out.set(token, value / norm)
  return out
}

/**
 * Compute centroid from an array of sparse vectors.
 *
 * Steps:
 * 1) sum component-wise
 * 2) divide by vector count
 * 3) L2-normalize centroid
 *
 * @param {Array<Map<string, number>>} vectors
 * @returns {Map<string, number>}
 */
function meanVector(vectors) {
  if (!vectors.length) return new Map()
  const sum = new Map()
  for (const vec of vectors) {
    for (const [token, value] of vec.entries()) {
      sum.set(token, (sum.get(token) || 0) + value)
    }
  }
  const divisor = vectors.length
  for (const [token, value] of sum.entries()) {
    sum.set(token, value / divisor)
  }
  return l2Normalize(sum)
}

/**
 * Jaccard similarity for tag arrays.
 *
 * J(A, B) = |A ∩ B| / |A ∪ B|
 *
 * @param {string[]} tagsA
 * @param {string[]} tagsB
 * @returns {number}
 */
function jaccard(tagsA, tagsB) {
  if (!tagsA.length && !tagsB.length) return 0
  const a = new Set(tagsA.map(v => v.toLowerCase()))
  const b = new Set(tagsB.map(v => v.toLowerCase()))
  let intersection = 0
  for (const value of a) if (b.has(value)) intersection += 1
  const union = new Set([...a, ...b]).size
  return union ? intersection / union : 0
}

/**
 * Choose k for k-means based on document count.
 *
 * Heuristic rationale:
 * - Too many clusters on small corpora creates brittle recommendations.
 * - Too few clusters dilutes topical grouping.
 *
 * Current heuristic: round(sqrt(count / 2)), bounded to [2, 8], with
 * small-corpus handling for <= 3 docs.
 *
 * @param {number} count
 * @returns {number}
 */
function pickK(count) {
  if (count <= 3) return Math.max(1, count)
  const k = Math.round(Math.sqrt(count / 2))
  return Math.max(2, Math.min(8, k))
}

/**
 * Initialize centroids deterministically by stepping through the vector list.
 *
 * Deterministic init is useful for stable output across builds.
 *
 * @param {Array<Map<string, number>>} vectors
 * @param {number} k
 * @returns {Array<Map<string, number>>}
 */
function initCentroids(vectors, k) {
  const centroids = []
  const step = Math.max(1, Math.floor(vectors.length / k))
  for (let i = 0; i < k; i += 1) {
    const idx = Math.min(i * step, vectors.length - 1)
    centroids.push(new Map(vectors[idx]))
  }
  return centroids
}

/**
 * Cosine-based k-means clustering on sparse vectors.
 *
 * Returns assignments for each input vector and grouped cluster indices.
 *
 * @param {Array<Map<string, number>>} vectors
 * @param {number} k
 * @param {number} [iterations=16]
 * @returns {{clusters:number[][], assignments:number[]}}
 */
function kmeans(vectors, k, iterations = 16) {
  if (!vectors.length) return { clusters: [], assignments: [] }
  if (k <= 1) return { clusters: [vectors.map((_, i) => i)], assignments: new Array(vectors.length).fill(0) }

  let centroids = initCentroids(vectors, k)
  let assignments = new Array(vectors.length).fill(0)

  for (let iter = 0; iter < iterations; iter += 1) {
    let changed = false

    for (let i = 0; i < vectors.length; i += 1) {
      let bestCluster = 0
      let bestScore = -Infinity
      for (let c = 0; c < centroids.length; c += 1) {
        const score = cosine(vectors[i], centroids[c])
        if (score > bestScore) {
          bestScore = score
          bestCluster = c
        }
      }
      if (assignments[i] !== bestCluster) {
        changed = true
        assignments[i] = bestCluster
      }
    }

    const grouped = Array.from({ length: k }, () => [])
    for (let i = 0; i < assignments.length; i += 1) {
      grouped[assignments[i]].push(vectors[i])
    }

    for (let c = 0; c < k; c += 1) {
      if (!grouped[c].length) continue
      centroids[c] = meanVector(grouped[c])
    }

    if (!changed) break
  }

  const clusters = Array.from({ length: k }, () => [])
  assignments.forEach((clusterId, index) => {
    clusters[clusterId].push(index)
  })

  return { clusters, assignments }
}

/**
 * Return top entries by numeric value from a map-like structure.
 *
 * @param {Map<string, number>} map
 * @param {number} limit
 * @returns {string[]}
 */
function topTerms(map, limit) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term)
}

/**
 * Build per-cluster summary metadata for JSON output.
 *
 * For each cluster we include:
 * - size: number of articles
 * - tags: most common explicit article tags
 *
 * @param {Array<{tags:string[], vector:Map<string, number>}>} docs
 * @param {number[]} assignments
 * @param {number} k
 * @returns {Array<{id:number, size:number, tags:string[]}>}
 */
function summarizeClusters(docs, assignments, k) {
  return Array.from({ length: k }, (_, clusterId) => {
    const clusterDocIndices = assignments
      .map((assignedId, index) => ({ assignedId, index }))
      .filter(entry => entry.assignedId === clusterId)
      .map(entry => entry.index)

    if (!clusterDocIndices.length) {
      return {
        id: clusterId,
        size: 0,
        tags: []
      }
    }

    const tagFreq = new Map()

    for (const index of clusterDocIndices) {
      for (const rawTag of docs[index].tags) {
        const tag = (rawTag || '').trim().toLowerCase()
        if (!tag) continue
        tagFreq.set(tag, (tagFreq.get(tag) || 0) + 1)
      }
    }

    return {
      id: clusterId,
      size: clusterDocIndices.length,
      tags: topTerms(tagFreq, 6)
    }
  })
}

/**
 * Compute final relatedness score between two documents.
 *
 * Formula:
 *   score = cosine(docA.vector, docB.vector) + 0.2 * jaccard(docA.tags, docB.tags)
 *
 * Rationale:
 * - Cosine captures semantic overlap from weighted TF-IDF content.
 * - Jaccard tag boost nudges explicitly co-tagged content upward.
 *
 * @param {{vector:Map<string,number>, tags:string[]}} a
 * @param {{vector:Map<string,number>, tags:string[]}} b
 * @returns {number}
 */
function scorePair(a, b) {
  // Final score is semantic cosine similarity of TF-IDF vectors plus a small
  // tag overlap boost: score = cosine(a, b) + 0.2 * jaccard(tagsA, tagsB).
  // Component ranges:
  // - cosine(a, b): 0..1
  // - 0.2 * jaccard(tagsA, tagsB): 0..0.2
  // Theoretical total range: 0..1.2
  // So MIN_RELATED_SCORE = 0.08 is a quality gate on this scale, where
  // lower-scoring candidates are filtered out as not similar enough.
  const semantic = cosine(a.vector, b.vector)
  const tagScore = jaccard(a.tags, b.tags)
  return semantic + (0.2 * tagScore)
}

/**
 * Ensure output directory exists before writing JSON.
 *
 * @param {string} filePath
 */
function ensureParentDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

/**
 * Main pipeline entrypoint.
 *
 * End-to-end steps:
 * 1) Load article HTML files
 * 2) Build weighted token frequencies
 * 3) Compute corpus document frequencies and TF-IDF vectors
 * 4) Cluster vectors with k-means
 * 5) Rank within-cluster first, then cross-cluster fallback
 * 6) Apply minimum score filter and top-N cap
 * 7) Emit machine-readable JSON map
 */
function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error('Articles directory not found:', ARTICLES_DIR)
    process.exit(1)
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(name => name.toLowerCase().endsWith('.html'))

  /**
   * Document representation used through ranking.
   *
   * @type {Array<{
   *   slug:string,
   *   title:string,
   *   tags:string[],
   *   tokenFreq:Map<string,number>,
   *   vector?:Map<string,number>
   * }>} 
   */
  const docs = files.map(fileName => {
    const fullPath = path.join(ARTICLES_DIR, fileName)
    const html = fs.readFileSync(fullPath, 'utf8')
    const slug = fileName.replace(/\.html$/i, '')
    const title = getTitle(html)
    const tags = getTags(html)
    const mainMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    const bodyText = stripHtml(mainMatch ? mainMatch[1] : html)

    const titleTokens = tokenize(title)
    const tagTokens = tokenize(tags.join(' '))
    const bodyTokens = tokenize(bodyText)

    // Weighted frequencies to improve recommendation quality.
    // - Title has strong intent signal -> 1.5x
    // - Tags are curated metadata -> 2x
    // - Body is broad context -> 1x
    const titleFreq = frequency(titleTokens)
    const tagFreq = frequency(tagTokens)
    const bodyFreq = frequency(bodyTokens)
    const weightedFreq = new Map()
    mergeWeightedFrequency(weightedFreq, titleFreq, 1.5)
    mergeWeightedFrequency(weightedFreq, tagFreq, 2)
    mergeWeightedFrequency(weightedFreq, bodyFreq, 1)

    return {
      slug,
      title,
      tags,
      tokenFreq: weightedFreq
    }
  })

  // Document frequency map for IDF.
  // tokenDocFreq[token] = number of docs containing token.
  const tokenDocFreq = new Map()
  for (const doc of docs) {
    const seen = new Set(doc.tokenFreq.keys())
    for (const token of seen) {
      tokenDocFreq.set(token, (tokenDocFreq.get(token) || 0) + 1)
    }
  }

  // Build TF-IDF vectors and normalize for cosine similarity.
  const totalDocs = docs.length
  docs.forEach(doc => {
    const vec = new Map()
    for (const [token, tf] of doc.tokenFreq.entries()) {
      const df = tokenDocFreq.get(token) || 1
      // Smoothed IDF:
      // idf = log((1 + N) / (1 + df)) + 1
      // +1 smoothing keeps values finite and stable on small corpora.
      const idf = Math.log((1 + totalDocs) / (1 + df)) + 1
      vec.set(token, tf * idf)
    }
    doc.vector = l2Normalize(vec)
  })

  const vectors = docs.map(doc => doc.vector)
  const k = pickK(docs.length)
  const { assignments } = kmeans(vectors, k)
  const clusters = summarizeClusters(docs, assignments, k)

  // Keep score list for output metadata used by UI normalization.
  const allScores = []
  const perArticle = {}
  for (let i = 0; i < docs.length; i += 1) {
    const current = docs[i]
    const currentCluster = assignments[i]

    const sameClusterCandidates = docs
      .map((doc, idx) => ({ doc, idx }))
      .filter(({ idx }) => idx !== i && assignments[idx] === currentCluster)

    const fallbackCandidates = docs
      .map((doc, idx) => ({ doc, idx }))
      .filter(({ idx }) => idx !== i && assignments[idx] !== currentCluster)

    const rankedPrimary = sameClusterCandidates
      .map(({ doc }) => ({
        slug: doc.slug,
        score: scorePair(current, doc)
      }))
      .sort((a, b) => b.score - a.score)

    const rankedFallback = fallbackCandidates
      .map(({ doc }) => ({
        slug: doc.slug,
        score: scorePair(current, doc)
      }))
      .sort((a, b) => b.score - a.score)

    // Ranking policy:
    // 1) Score in-cluster and cross-cluster candidates.
    // 2) Combine all candidates, then globally sort by score descending.
    // 3) Keep only score-qualified results.
    // 4) Cap to a small fixed list for UI simplicity.
    const related = [...rankedPrimary, ...rankedFallback]
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score >= MIN_RELATED_SCORE)
      .slice(0, 8)
      .map(item => ({
        slug: item.slug,
        score: Number(item.score.toFixed(6))
      }))

    perArticle[current.slug] = {
      cluster: currentCluster,
      related
    }
    related.forEach(r => allScores.push(r.score))
  }

  const maxScore = allScores.length ? Math.max(...allScores) : 1

  // Output contract consumed by article-page UI.
  // `maxObservedScore` is included to support UI-side percentage transforms
  // without requiring hard-coded constants in the frontend.
  const output = {
    version: 2,
    generatedAt: new Date().toISOString(),
    method: 'tfidf+kmeans+cosine',
    minRelatedScore: MIN_RELATED_SCORE,
    maxObservedScore: Number(maxScore.toFixed(6)),
    articleCount: docs.length,
    k,
    clusters,
    items: perArticle
  }

  ensureParentDir(OUTPUT_FILE)
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

  console.log(`Generated related article map for ${docs.length} articles at ${OUTPUT_FILE}`)
}

// Script entrypoint.
main()
