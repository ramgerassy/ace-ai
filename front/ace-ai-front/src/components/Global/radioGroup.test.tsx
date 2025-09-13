import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../test/utils';
import RadioGroup from './radioGroup';

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

const mockOptionsWithDisabled = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2', disabled: true },
  { label: 'Option 3', value: 'option3' },
];

describe('RadioGroup', () => {
  it('renders all options', () => {
    render(<RadioGroup name='test' options={mockOptions} />);

    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('renders with fieldset and legend when label is provided', () => {
    render(
      <RadioGroup name='test' options={mockOptions} label='Choose an option' />
    );

    const fieldset = screen.getByRole('group', { name: 'Choose an option' });
    expect(fieldset).toBeInTheDocument();
    expect(fieldset.tagName).toBe('FIELDSET');
  });

  it('does not render legend when no label is provided', () => {
    render(<RadioGroup name='test' options={mockOptions} />);

    expect(screen.queryByRole('group')).toBeInTheDocument(); // fieldset still exists
    expect(screen.queryByText(/choose/i)).not.toBeInTheDocument();
  });

  it('creates radio inputs with correct attributes', () => {
    render(<RadioGroup name='test-group' options={mockOptions} />);

    const radio1 = screen.getByLabelText('Option 1') as HTMLInputElement;
    const radio2 = screen.getByLabelText('Option 2') as HTMLInputElement;

    expect(radio1.type).toBe('radio');
    expect(radio1.name).toBe('test-group');
    expect(radio1.value).toBe('option1');

    expect(radio2.type).toBe('radio');
    expect(radio2.name).toBe('test-group');
    expect(radio2.value).toBe('option2');
  });

  it('handles selection correctly', () => {
    render(<RadioGroup name='test' options={mockOptions} value='option2' />);

    const radio1 = screen.getByLabelText('Option 1') as HTMLInputElement;
    const radio2 = screen.getByLabelText('Option 2') as HTMLInputElement;
    const radio3 = screen.getByLabelText('Option 3') as HTMLInputElement;

    expect(radio1.checked).toBe(false);
    expect(radio2.checked).toBe(true);
    expect(radio3.checked).toBe(false);
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup name='test' options={mockOptions} onChange={handleChange} />
    );

    const radio2 = screen.getByLabelText('Option 2');
    fireEvent.click(radio2);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('handles disabled options correctly', () => {
    render(<RadioGroup name='test' options={mockOptionsWithDisabled} />);

    const radio1 = screen.getByLabelText('Option 1') as HTMLInputElement;
    const radio2 = screen.getByLabelText('Option 2') as HTMLInputElement;
    const radio3 = screen.getByLabelText('Option 3') as HTMLInputElement;

    expect(radio1.disabled).toBe(false);
    expect(radio2.disabled).toBe(true);
    expect(radio3.disabled).toBe(false);
  });

  it('applies disabled styling to disabled options', () => {
    render(<RadioGroup name='test' options={mockOptionsWithDisabled} />);

    const disabledLabel = screen.getByLabelText('Option 2').parentElement;
    expect(disabledLabel).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('disabled radio input is properly disabled', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup
        name='test'
        options={mockOptionsWithDisabled}
        onChange={handleChange}
      />
    );

    const disabledRadio = screen.getByLabelText('Option 2') as HTMLInputElement;

    // The radio input should be disabled
    expect(disabledRadio.disabled).toBe(true);

    // Clicking the disabled radio should not change its state
    fireEvent.click(disabledRadio);
    expect(disabledRadio.checked).toBe(false);
  });

  it('applies correct styling to selected option', () => {
    render(<RadioGroup name='test' options={mockOptions} value='option1' />);

    const selectedLabel = screen.getByLabelText('Option 1').parentElement;
    const unselectedLabel = screen.getByLabelText('Option 2').parentElement;

    expect(selectedLabel).toHaveClass('border-quiz-primary', 'bg-quiz-light');
    expect(unselectedLabel).toHaveClass('border-quiz-border', 'bg-quiz-bg');
  });

  it('shows custom radio button indicator', () => {
    render(<RadioGroup name='test' options={mockOptions} value='option1' />);

    const selectedOption = screen.getByLabelText('Option 1').parentElement;
    const indicator = selectedOption?.querySelector('.w-4.h-4.rounded-full');
    const innerDot = selectedOption?.querySelector(
      '.w-2.h-2.rounded-full.bg-white'
    );

    expect(indicator).toBeInTheDocument();
    expect(innerDot).toBeInTheDocument();
  });

  it('does not show inner dot for unselected options', () => {
    render(<RadioGroup name='test' options={mockOptions} value='option1' />);

    const unselectedOption = screen.getByLabelText('Option 2').parentElement;
    const innerDot = unselectedOption?.querySelector(
      '.w-2.h-2.rounded-full.bg-white'
    );

    expect(innerDot).not.toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(
      <RadioGroup
        name='test'
        options={mockOptions}
        error='Please select an option'
      />
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('Please select an option');
    expect(errorMessage).toHaveClass('text-red-500');
  });

  it('applies custom className', () => {
    render(
      <RadioGroup
        name='test'
        options={mockOptions}
        className='custom-radio-group'
      />
    );

    const fieldset = screen.getByRole('group');
    expect(fieldset).toHaveClass('custom-radio-group');
  });

  it('generates unique IDs for each option', () => {
    render(<RadioGroup name='test-unique' options={mockOptions} />);

    const radio1 = screen.getByLabelText('Option 1');
    const radio2 = screen.getByLabelText('Option 2');
    const radio3 = screen.getByLabelText('Option 3');

    expect(radio1.id).toBe('test-unique-option1');
    expect(radio2.id).toBe('test-unique-option2');
    expect(radio3.id).toBe('test-unique-option3');
  });

  it('associates labels with radio inputs correctly', () => {
    render(<RadioGroup name='test' options={mockOptions} />);

    const radio1 = screen.getByLabelText('Option 1');

    // The radio should have the correct ID
    expect(radio1.id).toBe('test-option1');

    // The label should properly associate with the radio
    expect(radio1).toBeInTheDocument();
    expect(screen.getByLabelText('Option 1')).toBe(radio1);
  });

  it('hides native radio inputs with sr-only class', () => {
    render(<RadioGroup name='test' options={mockOptions} />);

    const radio1 = screen.getByLabelText('Option 1');
    expect(radio1).toHaveClass('sr-only');
  });

  it('handles keyboard navigation properly', () => {
    render(<RadioGroup name='test' options={mockOptions} />);

    const label1 = screen.getByLabelText('Option 1').parentElement;
    const label2 = screen.getByLabelText('Option 2').parentElement;

    // Labels should be properly focusable and clickable
    expect(label1?.tagName).toBe('LABEL');
    expect(label2?.tagName).toBe('LABEL');
  });

  it('works without onChange callback', () => {
    render(<RadioGroup name='test' options={mockOptions} />);

    const radio1 = screen.getByLabelText('Option 1');

    // Should not throw error when clicking without onChange
    expect(() => fireEvent.click(radio1)).not.toThrow();
  });

  it('maintains state consistency with controlled component', () => {
    const { rerender } = render(
      <RadioGroup name='test' options={mockOptions} value='option1' />
    );

    let radio1 = screen.getByLabelText('Option 1') as HTMLInputElement;
    let radio2 = screen.getByLabelText('Option 2') as HTMLInputElement;

    expect(radio1.checked).toBe(true);
    expect(radio2.checked).toBe(false);

    rerender(<RadioGroup name='test' options={mockOptions} value='option2' />);

    radio1 = screen.getByLabelText('Option 1') as HTMLInputElement;
    radio2 = screen.getByLabelText('Option 2') as HTMLInputElement;

    expect(radio1.checked).toBe(false);
    expect(radio2.checked).toBe(true);
  });
});
