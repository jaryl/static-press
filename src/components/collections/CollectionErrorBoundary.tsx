import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class CollectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Collection error boundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
          <div className="bg-destructive/10 p-4 rounded-lg mb-4 inline-flex">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Collection Data</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            There was a problem loading the collection data. This might be due to malformed data or schema incompatibility.
          </p>
          <p className="text-xs text-destructive mb-6 max-w-md font-mono bg-muted p-2 rounded overflow-auto">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <Button
            onClick={this.props.onRetry}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CollectionErrorBoundary;
