import clsx from 'clsx';

interface InputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  type,
  placeholder,
  required,
  disabled,
  onChange,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className='block mb-2 text-sm font-medium text-slate-100'
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={clsx(
          `border sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full px-4 py-2.5 bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-0 focus:outline-none`,
          disabled && 'bg-slate-100 opacity-50 cursor-not-allowed'
        )}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;