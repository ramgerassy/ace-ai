import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) => {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full transition-colors';

  const variantClasses = {
    primary: 'bg-quiz-primary text-white',
    secondary: 'bg-quiz-surface text-quiz-text border border-quiz-border',
    success:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100',
    warning:
      'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100',
    danger: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return (
    <span className={combinedClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
