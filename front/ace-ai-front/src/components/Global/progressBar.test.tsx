import { describe, expect, it } from 'vitest';
import { render, screen } from '../../test/utils';
import ProgressBar from './progressBar';

describe('ProgressBar', () => {
  it('renders basic progress bar', () => {
    render(<ProgressBar value={50} data-testid='progress' />);

    const progressContainer = screen.getByTestId('progress');
    expect(progressContainer).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<ProgressBar value={30} max={100} data-testid='progress' />);

    const progressBar = screen
      .getByTestId('progress')
      .querySelector('[style*="width: 30%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('uses max value of 100 by default', () => {
    render(<ProgressBar value={25} data-testid='progress' />);

    const progressBar = screen
      .getByTestId('progress')
      .querySelector('[style*="width: 25%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('handles custom max values', () => {
    render(<ProgressBar value={20} max={40} data-testid='progress' />);

    // 20/40 = 50%
    const progressBar = screen
      .getByTestId('progress')
      .querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('clamps values below 0 to 0%', () => {
    render(<ProgressBar value={-10} data-testid='progress' />);

    const progressBar = screen
      .getByTestId('progress')
      .querySelector('[style*="width: 0%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('clamps values above max to 100%', () => {
    render(<ProgressBar value={150} max={100} data-testid='progress' />);

    const progressBar = screen
      .getByTestId('progress')
      .querySelector('[style*="width: 100%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <ProgressBar value={50} size='sm' data-testid='progress' />
    );

    let progressContainer = screen
      .getByTestId('progress')
      .querySelector('.h-2');
    expect(progressContainer).toBeInTheDocument();

    rerender(<ProgressBar value={50} size='md' data-testid='progress' />);
    progressContainer = screen.getByTestId('progress').querySelector('.h-4');
    expect(progressContainer).toBeInTheDocument();

    rerender(<ProgressBar value={50} size='lg' data-testid='progress' />);
    progressContainer = screen.getByTestId('progress').querySelector('.h-6');
    expect(progressContainer).toBeInTheDocument();
  });

  it('uses medium size by default', () => {
    render(<ProgressBar value={50} data-testid='progress' />);

    const progressContainer = screen
      .getByTestId('progress')
      .querySelector('.h-4');
    expect(progressContainer).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { rerender } = render(
      <ProgressBar value={50} color='primary' data-testid='progress' />
    );

    let progressBar = screen
      .getByTestId('progress')
      .querySelector('.bg-quiz-primary');
    expect(progressBar).toBeInTheDocument();

    rerender(<ProgressBar value={50} color='success' data-testid='progress' />);
    progressBar = screen
      .getByTestId('progress')
      .querySelector('.bg-emerald-500');
    expect(progressBar).toBeInTheDocument();

    rerender(<ProgressBar value={50} color='warning' data-testid='progress' />);
    progressBar = screen.getByTestId('progress').querySelector('.bg-amber-500');
    expect(progressBar).toBeInTheDocument();

    rerender(<ProgressBar value={50} color='danger' data-testid='progress' />);
    progressBar = screen.getByTestId('progress').querySelector('.bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('uses primary color by default', () => {
    render(<ProgressBar value={50} data-testid='progress' />);

    const progressBar = screen
      .getByTestId('progress')
      .querySelector('.bg-quiz-primary');
    expect(progressBar).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    render(<ProgressBar value={50} />);

    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('shows default label and percentage when showLabel is true', () => {
    render(<ProgressBar value={75} showLabel />);

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows custom label when provided', () => {
    render(<ProgressBar value={60} showLabel label='Loading...' />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('rounds percentage display correctly', () => {
    render(<ProgressBar value={33.33} max={100} showLabel />);

    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('displays 0% for very small values', () => {
    render(<ProgressBar value={0.4} max={100} showLabel />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays 100% for complete progress', () => {
    render(<ProgressBar value={100} max={100} showLabel />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ProgressBar
        value={50}
        className='custom-progress'
        data-testid='progress'
      />
    );

    const progressContainer = screen.getByTestId('progress');
    expect(progressContainer).toHaveClass('custom-progress');
  });

  it('forwards div attributes', () => {
    render(
      <ProgressBar
        value={50}
        data-testid='test-progress'
        role='progressbar'
        aria-label='Upload progress'
      />
    );

    const progressContainer = screen.getByTestId('test-progress');
    expect(progressContainer).toBeInTheDocument();
    expect(progressContainer).toHaveAttribute('role', 'progressbar');
    expect(progressContainer).toHaveAttribute('aria-label', 'Upload progress');
  });

  it('has proper transition classes on progress bar', () => {
    render(<ProgressBar value={50} data-testid='progress' />);

    const progressBar = screen
      .getByTestId('progress')
      .querySelector('.transition-all');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveClass('duration-300', 'ease-out');
  });

  it('maintains consistent structure with all props', () => {
    render(
      <ProgressBar
        value={80}
        max={100}
        showLabel
        label='Custom Progress'
        size='lg'
        color='success'
        data-testid='progress'
      />
    );

    expect(screen.getByText('Custom Progress')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();

    const progressContainer = screen
      .getByTestId('progress')
      .querySelector('.h-6');
    expect(progressContainer).toBeInTheDocument();

    const progressBar = screen
      .getByTestId('progress')
      .querySelector('.bg-emerald-500');
    expect(progressBar).toBeInTheDocument();
  });
});
