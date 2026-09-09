import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './index.css'

/**
 * Hydratation plutôt que rendu neuf.
 *
 * Le HTML arrive déjà rempli par le pré-rendu : `hydrateRoot` reprend ce
 * balisage et se contente d'y rattacher les comportements. Avec `createRoot`,
 * React viderait le conteneur puis le reconstruirait, ce qui ferait clignoter
 * la page à chaque visite.
 */
const racine = document.getElementById('root')!

const arbre = (
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Une page servie sans corps pré-rendu, en développement par exemple, se monte
// normalement : hydrater un conteneur vide produirait une page blanche.
if (racine.hasChildNodes()) {
  ReactDOM.hydrateRoot(racine, arbre)
} else {
  ReactDOM.createRoot(racine).render(arbre)
}
