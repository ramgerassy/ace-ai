import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import Badge from './badge';

describe('Badge', () => {
  it('renders with children', () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders with primary variant by default', () => {
    render(<Badge data-testid='badge'>Primary</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-quiz-primary', 'text-white');
  });

  it('renders with secondary variant', () => {
    render(
      <Badge variant='secondary' data-testid='badge'>
        Secondary
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(
      'bg-quiz-surface',
      'text-quiz-text',
      'border',
      'border-quiz-border'
    );
  });

  it('renders with success variant', () => {
    render(
      <Badge variant='success' data-testid='badge'>
        Success
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(
      'bg-emerald-100',
      'text-emerald-800',
      'dark:bg-emerald-800',
      'dark:text-emerald-100'
    );
  });

  it('renders with warning variant', () => {
    render(
      <Badge variant='warning' data-testid='badge'>
        Warning
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(
      'bg-amber-100',
      'text-amber-800',
      'dark:bg-amber-800',
      'dark:text-amber-100'
    );
  });

  it('renders with danger variant', () => {
    render(
      <Badge variant='danger' data-testid='badge'>
        Danger
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(
      'bg-red-100',
      'text-red-800',
      'dark:bg-red-800',
      'dark:text-red-100'
    );
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <Badge size='sm' data-testid='badge'>
        Small
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass(
      'px-2',
      'py-0.5',
      'text-xs'
    );

    rerender(
      <Badge size='md' data-testid='badge'>
        Medium
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass('px-3', 'py-1', 'text-sm');

    rerender(
      <Badge size='lg' data-testid='badge'>
        Large
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass(
      'px-4',
      'py-1.5',
      'text-base'
    );
  });

  it('uses medium size by default', () => {
    render(<Badge data-testid='badge'>Default Size</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('px-3', 'py-1', 'text-sm');
  });

  it('applies base classes', () => {
    render(<Badge data-testid='badge'>Base Classes</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'font-medium',
      'rounded-full',
      'transition-colors'
    );
  });

  it('applies custom className', () => {
    render(
      <Badge className='custom-badge-class' data-testid='badge'>
        Custom
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('custom-badge-class');
  });

  it('forwards span attributes', () => {
    render(
      <Badge
        data-testid='test-badge'
        role='status'
        aria-label='Badge content'
        title='Badge tooltip'
      >
        Test Badge
      </Badge>
    );

    const badge = screen.getByTestId('test-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('role', 'status');
    expect(badge).toHaveAttribute('aria-label', 'Badge content');
    expect(badge).toHaveAttribute('title', 'Badge tooltip');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(
      <Badge onClick={handleClick} data-testid='clickable-badge'>
        Clickable
      </Badge>
    );

    const badge = screen.getByTestId('clickable-badge');
    badge.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('maintains proper DOM structure', () => {
    render(<Badge data-testid='badge'>Test</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('SPAN');
  });

  it('renders with complex children', () => {
    render(
      <Badge data-testid='badge'>
        <span>Count: </span>
        <strong>42</strong>
      </Badge>
    );

    expect(screen.getByText('Count:')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('combines variant and size classes correctly', () => {
    render(
      <Badge variant='success' size='lg' data-testid='badge'>
        Large Success
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(
      // Base classes
      'inline-flex',
      'items-center',
      'font-medium',
      'rounded-full',
      'transition-colors',
      // Variant classes
      'bg-emerald-100',
      'text-emerald-800',
      // Size classes
      'px-4',
      'py-1.5',
      'text-base'
    );
  });
});
