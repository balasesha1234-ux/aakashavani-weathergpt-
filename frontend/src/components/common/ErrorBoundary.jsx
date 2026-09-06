import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ServerErrorPage from './ServerErrorPage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.isAppRoot) {
        return (
          <ServerErrorPage 
            onRetry={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          />
        );
      }
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-4 rounded-2xl glass-panel border border-rose-500/30 text-xs my-2 text-slate-300">
          <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Interactive Widget Temporarily Unavailable</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {this.props.name || "This component"} encountered a display issue, but your conversation is safe.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry Display</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
