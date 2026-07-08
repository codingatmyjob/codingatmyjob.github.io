export const SITE_ORIGIN = 'https://codingatmyjob.github.io'

function normalizeBasePath(basePath) {
  if (typeof basePath !== 'string' || !basePath.trim()) return '/'
  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export function getBasePath() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) {
    return normalizeBasePath(import.meta.env.BASE_URL)
  }

  return '/'
}

export function getSiteUrl(path = '') {
  const normalizedPath = String(path || '').replace(/^\/+/, '')
  const baseUrl = new URL(getBasePath(), `${SITE_ORIGIN}/`).href
  return new URL(normalizedPath, baseUrl).href
}