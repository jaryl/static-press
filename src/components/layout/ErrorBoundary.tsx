import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback UI
  onReset?: () => void; // Optional callback to reset state
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });

    // Call the optional onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }

    // Force a window reload as a last resort
    // window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise a default one
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <div className="p-4 border border-destructive bg-destructive/10 rounded-md text-destructive">
          <h2 className="font-semibold mb-2">Something went wrong.</h2>
          <p className="text-sm mb-3">The application encountered an unexpected error.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="mb-2"
          >
            Try Again
          </Button>
          {/* Optionally display error details in development */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-2 text-xs bg-background p-2 rounded overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
