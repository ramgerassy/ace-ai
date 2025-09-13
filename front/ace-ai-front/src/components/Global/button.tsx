import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

const VARIANT_CLASSES = {
  primary: 'btn-quiz-primary text-white',
  secondary: 'btn-quiz-secondary',
} as const;

const SIZE_OVERRIDES = {
  sm: '!px-3 !py-2 !text-sm',
  md: '!px-4 !py-3 !text-base',
  lg: '!px-6 !py-4 !text-lg',
} as const;

const BASE_CLASSES =
  'font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-quiz-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

const LoadingSpinner = () => (
  <div className='flex items-center justify-center'>
    <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2' />
    Loading...
  </div>
);

const getButtonClasses = (
  variant: ButtonVariant,
  size: ButtonSize,
  className: string
): string => {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_OVERRIDES[size]} ${className}`.trim();
};

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  onClick,
  type = 'button',
  ...restProps
}: ButtonProps) => {
  const buttonClasses = getButtonClasses(variant, size, className);

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...restProps}
    >
      {isLoading ? <LoadingSpinner /> : children}
    </button>
  );
};

export default Button;
