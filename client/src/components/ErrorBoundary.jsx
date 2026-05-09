import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught error', error, info)
    this.setState({ info })
  }

  // Reset the boundary when the URL changes (navigating to a new page should clear the error)
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.location !== this.props.location) {
      this.setState({ hasError: false, error: null, info: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#fff', background: '#0f172a', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#f97316' }}>Something went wrong</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>We encountered an issue while loading this part of the app.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => window.history.back()}
              style={{ padding: '8px 20px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer' }}
            >
              Go Back
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null, info: null }); window.location.reload(); }}
              style={{ padding: '8px 20px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
