import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={inputId}
            className='block text-sm font-medium mb-2'
            style={{ color: 'var(--color-quiz-text)' }}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`input-quiz ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : ''
          } ${className}`.trim()}
          {...props}
        />

        {error && (
          <p className='mt-1 text-sm text-red-500' role='alert'>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            className='mt-1 text-sm opacity-70'
            style={{ color: 'var(--color-quiz-text)' }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
