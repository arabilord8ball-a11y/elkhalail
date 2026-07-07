import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('🔴 React Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A12',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: '40px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#C9973A', marginBottom: '12px', fontSize: '24px' }}>
            خطأ في تحميل الصفحة
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', marginBottom: '24px', lineHeight: 1.6 }}>
            {this.state.error?.message || 'حدث خطأ غير متوقع.'}
          </p>
          <details style={{ marginBottom: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', maxWidth: '600px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>تفاصيل الخطأ (للمطورين)</summary>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#C9973A',
              color: '#fff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            🔄 إعادة تحميل الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
