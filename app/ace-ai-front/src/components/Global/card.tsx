import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated';
}

const Card = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: CardProps) => {
  const baseClasses = 'quiz-card';

  const variantClasses = {
    default: '',
    elevated:
      'shadow-quiz-md hover:shadow-quiz-lg transition-shadow duration-300',
  };

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
