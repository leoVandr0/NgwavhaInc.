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
    // You can log to the console or an external service
    console.error('ErrorBoundary caught error', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>We encountered an issue while loading this part of the app.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16 }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
