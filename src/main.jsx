import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { erro: null }
  }
  static getDerivedStateFromError(error) {
    return { erro: error?.message || 'Erro desconhecido' }
  }
  render() {
    if (this.state.erro) {
      return (
        <div style={{ fontFamily: 'sans-serif', padding: 32, maxWidth: 400, margin: '0 auto' }}>
          <h2 style={{ color: '#ef4444' }}>⚠️ Erro ao carregar o app</h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>{this.state.erro}</p>
          <button onClick={() => { localStorage.clear(); window.location.reload() }}
            style={{ background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 14 }}>
            Limpar dados e recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
