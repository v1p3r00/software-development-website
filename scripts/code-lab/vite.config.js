import { defineConfig } from 'vite';
export default defineConfig({
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    lib: { entry: 'entry.js', name: 'CodeLab', formats: ['iife'], fileName: () => 'code-lab.js' },
    outDir: 'out', minify: true, emptyOutDir: true,
  },
});
