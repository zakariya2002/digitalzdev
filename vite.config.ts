import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Les dépendances lourdes sont isolées pour qu'elles soient mises en
        // cache indépendamment du code applicatif, qui bouge bien plus souvent.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion', 'lenis'],
          three: ['three'],
        },
      },
    },
  },
})
