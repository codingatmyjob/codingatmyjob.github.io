import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'

export function getHtmlPages(directory) {
  return readdirSync(directory)
    .filter((file) => file.toLowerCase().endsWith('.html'))
    .map((file) => basename(file, '.html'))
    .sort()
}

export function readHtmlPage(directory, page) {
  return readFileSync(join(directory, `${page}.html`), 'utf8')
}

export function extractMainHtml(html) {
  return html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0] || ''
}

export function extractHeadStyles(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || ''
  return Array.from(head.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi), (match) => match[1])
}

export function extractJsonLd(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || ''
  return Array.from(head.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi), (match) => match[1])
}

export function extractBodyScripts(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || ''
  return Array.from(body.matchAll(/<script\b([^>]*)>[\s\S]*?<\/script\s*>/gi), (match) => match[0])
}

export function removeScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
}

export function addBaseToRootPaths(html, basePath) {
  if (basePath === '/') return html
  return html.replace(/((?:href|src|poster)=["'])\/(?!\/)/gi, `$1${basePath}`)
}
