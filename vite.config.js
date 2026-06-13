import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  base: '/',
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
      ]
    }
  }
})
