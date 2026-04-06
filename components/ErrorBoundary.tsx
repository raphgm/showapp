
// @ts-nocheck
// React class component for Error Boundary — requires class syntax per React spec
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleRetry = this.handleRetry.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Show ErrorBoundary]', error, errorInfo);
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
  }

  handleGoHome() {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-10">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto size-20 bg-rose-50 rounded-3xl flex items-center justify-center border border-rose-100">
              <AlertTriangle className="size-10 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Something went wrong</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                This section encountered an unexpected error. Your data is safe — try refreshing.
              </p>
              {this.state.error && (
                <p className="text-xs font-mono text-slate-400 bg-slate-50 rounded-xl px-4 py-2 mt-3 break-all border border-slate-100">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-indigo-700 transition-all active:scale-95 shadow-lg"
              >
                <RefreshCw className="size-4" />
                Retry
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95"
              >
                <Home className="size-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
