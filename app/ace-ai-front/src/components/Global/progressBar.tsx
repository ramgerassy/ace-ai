import type { HTMLAttributes } from 'react';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const SIZE_CLASSES = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

const COLOR_CLASSES = {
  primary: 'bg-quiz-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

interface ProgressLabelProps {
  label?: string;
  percentage: number;
}

const ProgressLabel = ({ label, percentage }: ProgressLabelProps) => (
  <div className='flex justify-between items-center mb-2'>
    <span
      className='text-sm font-medium'
      style={{ color: 'var(--color-quiz-text)' }}
    >
      {label || 'Progress'}
    </span>
    <span
      className='text-sm font-medium'
      style={{ color: 'var(--color-quiz-text)' }}
    >
      {Math.round(percentage)}%
    </span>
  </div>
);

const ProgressBar = ({
  value,
  max = 100,
  showLabel = false,
  label,
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`.trim()} {...props}>
      {showLabel && <ProgressLabel label={label} percentage={percentage} />}

      <div
        className={`w-full rounded-full overflow-hidden ${SIZE_CLASSES[size]}`}
        style={{ backgroundColor: 'var(--color-quiz-border)' }}
      >
        <div
          className={`${COLOR_CLASSES[color]} ${SIZE_CLASSES[size]} rounded-full transition-all duration-300 ease-out`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
