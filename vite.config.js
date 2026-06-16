import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    includedRoutes() {
      const articleSlugs = fs.existsSync('public/articles')
        ? fs.readdirSync('public/articles').filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''))
        : []
      return [
        '/',
        ...articleSlugs.map(s => `/articles/${s}`),
        '/sidebar/About',
        '/sidebar/tag-guide',
        '/sidebar/status-hub',
      ]
    }
  }
})
