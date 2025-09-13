interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

interface RadioOptionItemProps {
  option: RadioOption;
  name: string;
  isChecked: boolean;
  onChange?: (value: string) => void;
}

const RadioOptionItem = ({
  option,
  name,
  isChecked,
  onChange,
}: RadioOptionItemProps) => {
  const radioId = `${name}-${option.value}`;

  return (
    <label
      htmlFor={radioId}
      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isChecked
          ? 'border-quiz-primary bg-quiz-light'
          : 'border-quiz-border bg-quiz-bg hover:border-quiz-primary/50'
      } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`.trim()}
    >
      <input
        type='radio'
        id={radioId}
        name={name}
        value={option.value}
        checked={isChecked}
        onChange={e => onChange?.(e.target.value)}
        disabled={option.disabled}
        className='sr-only'
      />

      <div
        className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
          isChecked
            ? 'border-quiz-primary bg-quiz-primary'
            : 'border-quiz-border bg-quiz-bg'
        }`}
      >
        {isChecked && <div className='w-2 h-2 rounded-full bg-white' />}
      </div>

      <span
        className='text-sm font-medium'
        style={{ color: 'var(--color-quiz-text)' }}
      >
        {option.label}
      </span>
    </label>
  );
};

const RadioGroup = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  className = '',
}: RadioGroupProps) => {
  return (
    <fieldset className={`w-full ${className}`.trim()}>
      {label && (
        <legend
          className='block text-sm font-medium mb-3'
          style={{ color: 'var(--color-quiz-text)' }}
        >
          {label}
        </legend>
      )}

      <div className='space-y-2'>
        {options.map(option => (
          <RadioOptionItem
            key={option.value}
            option={option}
            name={name}
            isChecked={value === option.value}
            onChange={onChange}
          />
        ))}
      </div>

      {error && (
        <p className='mt-2 text-sm text-red-500' role='alert'>
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default RadioGroup;
