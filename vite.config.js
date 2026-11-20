import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [reactRouter()]
})
