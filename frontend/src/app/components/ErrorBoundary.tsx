import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[QFSE ErrorBoundary]", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A14]">
        <div className="max-w-md w-full mx-4 p-8 bg-[#141424] border border-[#FF4444]/30 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-[#FF4444]/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-[#FF4444]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Something went wrong</h2>
              <p className="text-sm text-[#B0B0C0]">An unexpected error occurred</p>
            </div>
          </div>

          {this.state.error && (
            <div className="mb-6 p-4 bg-[#FF4444]/5 border border-[#FF4444]/20 rounded-xl">
              <p className="text-xs font-mono text-[#FF4444] break-all">
                {this.state.error.message}
              </p>
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#6A0DAD] hover:bg-[#8A2BE2] text-white font-bold rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
