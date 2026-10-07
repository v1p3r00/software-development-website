import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { articleMeta } from './scripts/articleMeta.ts'

// server build of the app, used only by scripts/prerender.mjs at build time
export default defineConfig({
  plugins: [articleMeta(), react()],
  publicDir: false,
  build: { ssr: 'src/entry-server.tsx', outDir: 'node_modules/.prerender', emptyOutDir: true, copyPublicDir: false },
  ssr: { noExternal: true },
})
