import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../test/utils';
import Button from './button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders with primary variant by default', () => {
    render(<Button>Primary Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-quiz-primary', 'text-white');
  });

  it('renders with secondary variant', () => {
    render(<Button variant='secondary'>Secondary Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-quiz-secondary');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size='sm'>Small</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      '!px-3',
      '!py-2',
      '!text-sm'
    );

    rerender(<Button size='md'>Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      '!px-4',
      '!py-3',
      '!text-base'
    );

    rerender(<Button size='lg'>Large</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      '!px-6',
      '!py-4',
      '!text-lg'
    );
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    );
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
  });

  it('renders loading spinner when isLoading is true', () => {
    render(<Button isLoading>Click me</Button>);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className='custom-class'>Custom</Button>);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('forwards button attributes', () => {
    render(
      <Button type='submit' aria-label='Submit form' data-testid='submit-btn'>
        Submit
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    expect(button).toHaveAttribute('data-testid', 'submit-btn');
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Loading
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
