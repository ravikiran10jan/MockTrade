import React, { Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import './components/_blotter_override.css';

const TradingDashboard = React.lazy(() => import('./components/TradingDashboard'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#fee2e2',
          border: '2px solid #dc2626',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#991b1b', margin: '0 0 16px 0' }}>Error loading app</h2>
          <div style={{ color: '#7f1d1d', marginBottom: '16px' }}>
            <p><strong>Error:</strong> {this.state.error?.toString()}</p>
            {this.state.errorInfo && (
              <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                <summary>Stack trace</summary>
                {this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return (
      <AuthProvider>
        <ProtectedRoute>
          <Suspense fallback={<div style={{ padding: '40px', fontSize: '18px' }}>Loading...</div>}>
            <TradingDashboard />
          </Suspense>
        </ProtectedRoute>
      </AuthProvider>
    );
  }
}

export default ErrorBoundary;
