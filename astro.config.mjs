import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://codingatmyjob.github.io',
  base: process.env.VITE_BASE_PATH || '/',
  outDir: './dist/client',
  output: 'static',
  trailingSlash: 'always'
})
