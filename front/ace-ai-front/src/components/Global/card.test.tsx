import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test/utils';
import Card from './card';

describe('Card', () => {
  it('renders with children', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies quiz-card class by default', () => {
    render(<Card data-testid='card'>Content</Card>);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('quiz-card');
  });

  it('renders with default variant', () => {
    render(<Card data-testid='card'>Default Card</Card>);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('quiz-card');
    expect(card).not.toHaveClass('shadow-quiz-md');
  });

  it('renders with elevated variant', () => {
    render(
      <Card variant='elevated' data-testid='card'>
        Elevated Card
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass(
      'quiz-card',
      'shadow-quiz-md',
      'hover:shadow-quiz-lg',
      'transition-shadow',
      'duration-300'
    );
  });

  it('applies custom className', () => {
    render(
      <Card className='custom-card-class' data-testid='card'>
        Custom Card
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('quiz-card', 'custom-card-class');
  });

  it('forwards div attributes', () => {
    render(
      <Card data-testid='test-card' role='region' aria-label='Card content'>
        Test Content
      </Card>
    );

    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', 'Card content');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(
      <Card onClick={handleClick} data-testid='clickable-card'>
        Clickable Card
      </Card>
    );

    const card = screen.getByTestId('clickable-card');
    card.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders complex children structure', () => {
    render(
      <Card>
        <header>
          <h1>Header</h1>
        </header>
        <main>
          <p>Main content</p>
          <button>Action</button>
        </main>
        <footer>
          <span>Footer</span>
        </footer>
      </Card>
    );

    expect(screen.getByRole('heading', { name: 'Header' })).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('maintains proper DOM structure', () => {
    render(<Card data-testid='card'>Test Content</Card>);

    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
  });
});
