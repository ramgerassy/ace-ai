import { useNavigate, useRouteError } from 'react-router-dom';
import Card from './card';
import Button from './button';

interface RouteError {
  statusText?: string;
  message?: string;
  status?: number;
}

const ErrorElement = () => {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();

  console.error('Route error:', error);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    window.history.back();
  };

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
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>

          {/* Error Message */}
          <div className='space-y-2'>
            <h1 className='text-xl font-bold text-quiz-text'>
              {error?.status === 404
                ? 'Page Not Found'
                : 'Something Went Wrong'}
            </h1>
            <p className='text-quiz-text opacity-70'>
              {error?.status === 404
                ? "The page you're looking for doesn't exist."
                : error?.statusText ||
                  error?.message ||
                  'An unexpected error occurred.'}
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {import.meta.env.DEV && error && (
            <div className='text-left bg-gray-100 p-4 rounded-lg'>
              <details className='text-sm'>
                <summary className='font-medium text-red-600 cursor-pointer mb-2'>
                  Error Details (Development)
                </summary>
                <div className='space-y-2 text-xs font-mono'>
                  {error.status && (
                    <div>
                      <strong>Status:</strong> {error.status}
                    </div>
                  )}
                  {error.statusText && (
                    <div>
                      <strong>Status Text:</strong> {error.statusText}
                    </div>
                  )}
                  {error.message && (
                    <div>
                      <strong>Message:</strong> {error.message}
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
              onClick={handleGoBack}
              className='flex-1'
            >
              Go Back
            </Button>
            <Button onClick={handleGoHome} className='flex-1'>
              Go Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ErrorElement;
