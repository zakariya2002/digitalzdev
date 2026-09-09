import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Les dépendances lourdes sont isolées pour qu'elles soient mises en
        // cache indépendamment du code applicatif, qui bouge bien plus souvent.
        //
        // Le découpage ne vaut que pour le paquet du navigateur : dans la
        // construction serveur, React est externe et Rollup refuse alors de le
        // placer dans un morceau.
        manualChunks: isSsrBuild
          ? undefined
          : {
              react: ['react', 'react-dom', 'react-router-dom'],
              motion: ['framer-motion', 'lenis'],
              three: ['three'],
            },
      },
    },
  },
}))
