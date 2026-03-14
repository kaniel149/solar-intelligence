import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('CRM Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="h-screen w-screen bg-[#0D1117] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 text-xl mb-4">!</div>
            <h1 className="text-lg font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-white/40 mb-6">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
