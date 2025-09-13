import { Component, ErrorInfo, ReactNode } from 'react';
import Card from './card';
import Button from './button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className='min-h-screen flex items-center justify-center bg-quiz-bg p-4'>
          <Card className='max-w-lg w-full text-center'>
            <div className='space-y-6'>
              {/* Error Icon */}
              <div className='w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center'>
                <svg
                  className='w-8 h-8 text-red-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>

              {/* Error Message */}
              <div className='space-y-2'>
                <h1 className='text-xl font-bold text-quiz-text'>
                  Oops! Something went wrong
                </h1>
                <p className='text-quiz-text opacity-70'>
                  We encountered an unexpected error. This has been logged and
                  we'll look into it.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className='text-left bg-gray-100 p-4 rounded-lg'>
                  <details className='text-sm'>
                    <summary className='font-medium text-red-600 cursor-pointer mb-2'>
                      Error Details (Development)
                    </summary>
                    <div className='space-y-2 text-xs font-mono'>
                      <div>
                        <strong>Message:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className='whitespace-pre-wrap text-gray-600 mt-1'>
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <Button
                  variant='secondary'
                  onClick={this.handleReset}
                  className='flex-1'
                >
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className='flex-1'>
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
