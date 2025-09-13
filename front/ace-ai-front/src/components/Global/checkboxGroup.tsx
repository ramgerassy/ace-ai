interface CheckboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  name: string;
  options: CheckboxOption[];
  values?: string[];
  onChange?: (values: string[]) => void;
  label?: string;
  error?: string;
  className?: string;
}

interface CheckboxOptionItemProps {
  option: CheckboxOption;
  name: string;
  isChecked: boolean;
  onChange?: (value: string, checked: boolean) => void;
}

const CheckboxOptionItem = ({
  option,
  name,
  isChecked,
  onChange,
}: CheckboxOptionItemProps) => {
  const checkboxId = `${name}-${option.value}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(option.value, e.target.checked);
  };

  return (
    <div className='flex items-center gap-3 p-3 rounded-lg border-2 border-quiz-border transition-all duration-200 hover:border-quiz-primary/50'>
      <input
        type='checkbox'
        id={checkboxId}
        name={name}
        value={option.value}
        checked={isChecked}
        disabled={option.disabled}
        onChange={handleChange}
        className='w-4 h-4 text-quiz-primary bg-gray-100 border-gray-300 rounded focus:ring-quiz-primary focus:ring-2 disabled:opacity-50'
      />
      <label
        htmlFor={checkboxId}
        className={`flex-1 text-sm cursor-pointer ${
          option.disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ color: 'var(--color-quiz-text)' }}
      >
        {option.label}
      </label>
    </div>
  );
};

const CheckboxGroup = ({
  name,
  options,
  values = [],
  onChange,
  label,
  error,
  className = '',
}: CheckboxGroupProps) => {
  const handleOptionChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange?.([...values, value]);
    } else {
      onChange?.(values.filter(v => v !== value));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          className='block text-sm font-medium'
          style={{ color: 'var(--color-quiz-text)' }}
        >
          {label}
        </label>
      )}

      <div className='space-y-2'>
        {options.map(option => (
          <CheckboxOptionItem
            key={option.value}
            option={option}
            name={name}
            isChecked={values.includes(option.value)}
            onChange={handleOptionChange}
          />
        ))}
      </div>

      {error && <p className='text-red-600 text-sm mt-1'>{error}</p>}
    </div>
  );
};

export default CheckboxGroup;
