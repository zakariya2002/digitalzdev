import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  root: process.cwd(),
  plugins: [react()],
  build: { ssr: 'ssrtest/app.tsx', outDir: 'ssrtest/out', rollupOptions: { output: { format: 'es' } } },
})
