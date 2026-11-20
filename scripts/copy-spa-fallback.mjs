import { cpSync, copyFileSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const clientDirectory = resolve('dist/client')
copyFileSync(
  resolve(clientDirectory, '__spa-fallback.html'),
  resolve(clientDirectory, '404.html')
)
copyFileSync(resolve('style.css'), resolve(clientDirectory, 'style.css'))

const basePath = (process.env.VITE_BASE_PATH || '/').replace(/^\/+|\/+$/g, '')
if (basePath) {
  const nestedDirectory = resolve(clientDirectory, basePath)
  for (const entry of readdirSync(nestedDirectory)) {
    cpSync(
      resolve(nestedDirectory, entry),
      resolve(clientDirectory, entry),
      { recursive: true, force: true }
    )
  }
  rmSync(nestedDirectory, { recursive: true })
}
