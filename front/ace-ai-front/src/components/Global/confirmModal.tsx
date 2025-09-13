import { useEffect } from 'react';
import Button from './button';
import Card from './card';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmModalProps) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const variantStyles = {
    danger: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  const variantIcons = {
    danger: '⚠️',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      aria-describedby='modal-message'
    >
      <div
        className='absolute inset-0'
        onClick={onCancel}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            onCancel();
          }
        }}
        role='button'
        tabIndex={0}
        aria-label='Close modal'
      />
      <Card
        className='w-full max-w-md transform transition-all duration-300 scale-100 animate-bounce-in'
        onClick={e => e.stopPropagation()}
      >
        <div className='space-y-4'>
          {/* Header */}
          <div className='flex items-start space-x-3'>
            <span className='text-2xl' role='img' aria-label={variant}>
              {variantIcons[variant]}
            </span>
            <div className='flex-1'>
              <h2
                id='modal-title'
                className={`text-lg font-semibold font-heading ${variantStyles[variant]}`}
              >
                {title}
              </h2>
            </div>
          </div>

          {/* Message */}
          <p
            id='modal-message'
            className='text-quiz-text opacity-80 font-body leading-relaxed pl-9'
          >
            {message}
          </p>

          {/* Actions */}
          <div className='flex gap-3 pt-2'>
            <Button variant='secondary' onClick={onCancel} className='flex-1'>
              {cancelText}
            </Button>
            <Button
              variant='primary'
              onClick={onConfirm}
              className={`flex-1 ${
                variant === 'danger'
                  ? '!bg-gradient-to-r !from-red-500 !to-red-600 hover:!from-red-600 hover:!to-red-700'
                  : ''
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;
