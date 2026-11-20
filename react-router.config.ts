import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const getHtmlPages = (directory) => readdirSync(resolve(directory))
  .filter((file) => file.endsWith('.html'))
  .map((file) => file.slice(0, -5))
  .sort()

const viteBasePath = process.env.VITE_BASE_PATH || '/'
const basename = viteBasePath.replace(/\/+$/, '') || '/'

export default {
  appDirectory: 'src',
  buildDirectory: 'dist',
  basename,
  ssr: false,
  prerender: [
    '/',
    ...getHtmlPages('public/articles').map((slug) => `/articles/${slug}`),
    ...getHtmlPages('public/sidebar').map((page) => `/sidebar/${page}`)
  ]
}
