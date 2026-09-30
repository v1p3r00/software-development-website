import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPages } from './scripts/seo.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPages()],
})
