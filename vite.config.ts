import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPages } from './scripts/seo.ts'
import { articleMeta } from './scripts/articleMeta.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [articleMeta(), react(), seoPages()],
})
