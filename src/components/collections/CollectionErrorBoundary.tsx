import { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { GenericErrorDisplay } from '@/components/layout/GenericErrorDisplay';

interface CollectionErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  navigate?: NavigateFunction;
}

interface CollectionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class CollectionErrorBoundary extends Component<CollectionErrorBoundaryProps, CollectionErrorBoundaryState> {
  constructor(props: CollectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CollectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Collection error boundary caught an error:', error, errorInfo);
  }

  handleGoToDashboard = () => {
    if (this.props.navigate) {
      this.props.navigate('/dashboard');
    } else {
      console.error('Navigate function not provided to CollectionErrorBoundary');
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <GenericErrorDisplay
          title="Something went wrong"
          description="An unexpected error occurred while rendering this part of the application."
          errorMessage={this.state.error?.message || 'Unknown error'}
          actionButtonLabel="Back to Dashboard"
          onActionClick={this.handleGoToDashboard}
          containerClassName="w-full h-full"
        />
      );
    }

    return this.props.children;
  }
}

const CollectionErrorBoundaryWithNavigation = (props: Omit<CollectionErrorBoundaryProps, 'navigate'>) => {
  const navigate = useNavigate();
  return <CollectionErrorBoundary {...props} navigate={navigate} />;
};

export default CollectionErrorBoundaryWithNavigation;
