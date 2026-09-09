import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'

/**
 * Rend une page en HTML complet, au moment de la construction du site.
 *
 * La vitrine était livrée en coquille vide : le serveur envoyait une page sans
 * texte et un programme qui l'écrivait ensuite dans le navigateur. Un visiteur
 * n'y voyait rien, mais Google recevait une cinquantaine de caractères par
 * page et n'avait donc rien à indexer. Ici le contenu est écrit une fois pour
 * toutes à la compilation.
 *
 * `StaticRouter` remplace `BrowserRouter` : il n'existe pas d'historique de
 * navigateur côté serveur, seulement l'adresse qu'on lui passe. Les balises du
 * `<head>` restent écrites par le script de pré-rendu, qui les connaît déjà.
 */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthProvider>
      </StaticRouter>
    </StrictMode>
  )
}
