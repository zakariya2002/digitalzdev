import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

/** Une erreur d'affichage ne doit jamais laisser une page blanche :
 *  on montre ce qui s'est passé et on offre une porte de sortie. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Erreur d\'affichage :', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h1 className="text-lg font-semibold mb-2">Cette page n'a pas pu s'afficher</h1>
          <p className="text-sm text-gray-400 mb-4">
            Le reste du back-office continue de fonctionner. Recharge la page&nbsp;;
            si le problème persiste, envoie ce message :
          </p>
          <pre className="text-xs text-amber-400 bg-gray-950 border border-gray-800 rounded-lg p-3 overflow-x-auto mb-4">
            {error.message}
          </pre>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Recharger
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              Retour au tableau de bord
            </a>
          </div>
        </div>
      </div>
    )
  }
}
