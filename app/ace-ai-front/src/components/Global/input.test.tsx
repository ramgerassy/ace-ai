import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../test/utils';
import Input from './input';

describe('Input', () => {
  it('renders basic input', () => {
    render(<Input placeholder='Enter text' />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('renders with label', () => {
    render(<Input label='Username' placeholder='Enter username' />);

    const label = screen.getByText('Username');
    const input = screen.getByRole('textbox');

    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('generates unique id when not provided', () => {
    render(<Input label='Test Input' />);

    const input = screen.getByRole('textbox');
    expect(input.id).toMatch(/^input-/);
  });

  it('uses provided id', () => {
    render(<Input label='Test Input' id='custom-id' />);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test Input');

    expect(input.id).toBe('custom-id');
    expect(label).toHaveAttribute('for', 'custom-id');
  });

  it('applies input-quiz class', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input-quiz');
  });

  it('shows error state', () => {
    render(<Input error='This field is required' />);

    const input = screen.getByRole('textbox');
    const errorMsg = screen.getByRole('alert');

    expect(input).toHaveClass(
      'border-red-500',
      'focus:border-red-500',
      'focus:ring-red-500/20'
    );
    expect(errorMsg).toHaveTextContent('This field is required');
    expect(errorMsg).toHaveClass('text-red-500');
  });

  it('shows helper text when no error', () => {
    render(<Input helperText='Enter at least 8 characters' />);

    const helperText = screen.getByText('Enter at least 8 characters');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('opacity-70');
  });

  it('does not show helper text when error is present', () => {
    render(
      <Input
        error='This field is required'
        helperText='Enter at least 8 characters'
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(
      screen.queryByText('Enter at least 8 characters')
    ).not.toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test input' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test input');
  });

  it('forwards input props', () => {
    render(
      <Input
        type='email'
        required
        disabled
        maxLength={50}
        data-testid='email-input'
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('maxlength', '50');
    expect(input).toHaveAttribute('data-testid', 'email-input');
  });

  it('applies custom className', () => {
    render(<Input className='custom-input' />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('handles focus and blur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('maintains accessibility attributes', () => {
    render(<Input label='Email' error='Invalid email' />);

    const input = screen.getByRole('textbox');
    const errorMsg = screen.getByRole('alert');

    expect(input).toHaveAccessibleName('Email');
    expect(errorMsg).toBeInTheDocument();
  });
});
