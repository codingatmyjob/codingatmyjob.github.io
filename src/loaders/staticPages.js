import { readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'

function readStaticHtml(directory, page) {
  const root = resolve('public', directory)
  const filePath = resolve(root, `${page || ''}.html`)
  const relativePath = relative(root, filePath)

  if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    return ''
  }

  try {
    return readFileSync(filePath, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return ''
    throw error
  }
}

export function articleLoader({ params }) {
  return { rawHtml: readStaticHtml('articles', params.slug) }
}

export function sidebarLoader({ params }) {
  return { rawHtml: readStaticHtml('sidebar', params.page) }
}
