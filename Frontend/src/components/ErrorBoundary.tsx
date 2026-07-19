import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', color: '#f87171', gap: '1rem', textAlign: 'center', padding: '2rem'
        }}>
          <AlertTriangle size={48} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Algo salió mal</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', maxWidth: 400 }}>
            {this.state.error?.message || 'Error inesperado en la interfaz'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #f87171',
              background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '0.875rem'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
