import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Component, type ReactNode } from 'react'
import { AuthProvider } from '../src/contexts/AuthContext'
import App from '../src/App'

class Catcher extends Component<{ children: ReactNode; sink: string[] }, { err: string | null }> {
  state = { err: null as string | null }
  static getDerivedStateFromError(e: Error) { return { err: e.message } }
  componentDidCatch(e: Error) { this.props.sink.push('REACT CRASH: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 5).join('\n')) }
  render() { return this.state.err ? <div>ERREUR CAPTUREE: {this.state.err}</div> : this.props.children }
}

export function mount(el: HTMLElement, sink: string[]) {
  const root = createRoot(el)
  root.render(
    <Catcher sink={sink}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Catcher>
  )
  return () => setTimeout(() => root.unmount(), 0)
}
