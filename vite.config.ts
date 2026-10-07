import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPages } from './scripts/seo.ts'
import { articleMeta } from './scripts/articleMeta.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [articleMeta(), react(), seoPages()],
  build: {
    // Vite's default CSS target lets the minifier rewrite (min-width: 640px) into
    // range syntax (width>=640px). Safari before 16.4 ignores that, so older
    // iPhones lose every responsive rule, and site checkers report "no media
    // queries". These targets keep the classic min-width/max-width form.
    cssTarget: ['chrome100', 'edge100', 'firefox100', 'safari15'],
  },
})
