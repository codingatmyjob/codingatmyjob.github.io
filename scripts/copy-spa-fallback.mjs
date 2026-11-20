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
  <script>
    (function () {
      try {
        var saved = localStorage.getItem('theme')
        var systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.setAttribute('data-theme', saved || (systemPrefersDark ? 'dark' : 'light'))
      } catch (error) {
        document.documentElement.setAttribute('data-theme', 'light')
      }
    })()
  </script>
  <style>
    html, body { min-height: 100%; margin: 0; background: #090d14; color: #d8dde4; }
    body { font-family: 'Courier New', monospace; }
    [data-theme="light"] { background: #c9cbce; color: #2c3646; }
    [data-theme="light"] body {
      background: radial-gradient(120% 95% at 50% -25%, rgba(88, 104, 128, 0.12) 0%, rgba(88, 104, 128, 0) 60%), linear-gradient(180deg, #ced2d8 0%, #c9cbce 46%, #bcc1ca 100%);
    }
  </style>
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
