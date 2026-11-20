import { cpSync, copyFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const clientDirectory = resolve('dist/client')
copyFileSync(
  resolve(clientDirectory, '__spa-fallback.html'),
  resolve(clientDirectory, '404.html')
)
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

const publicBase = basePath ? `/${basePath}/` : '/'
for (const directory of ['articles', 'sidebar']) {
  const outputDirectory = resolve(clientDirectory, directory)
  for (const file of readdirSync(outputDirectory).filter((entry) => entry.endsWith('.html'))) {
    const page = file.slice(0, -5)
    const destination = `${publicBase}${directory}/${page}/`
    writeFileSync(resolve(outputDirectory, file), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${destination}">
  <link rel="canonical" href="${destination}">
  <title>Redirecting</title>
</head>
<body>
  <p><a href="${destination}">Continue to the page</a></p>
  <script>window.location.replace(${JSON.stringify(destination)} + window.location.search + window.location.hash)</script>
</body>
</html>`)
  }
}
