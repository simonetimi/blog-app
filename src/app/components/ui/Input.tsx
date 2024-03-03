interface InputField {
  id: string;
  type: string;
  min?: number;
  max?: number;
  value: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
  width?: string;
}

export default function InputField({
  id,
  type,
  min,
  max,
  value,
  placeholder,
  onChange,
  required,
  width = 'w-5/6',
}: InputField) {
  return (
    <input
      className={`h-8 ${width} self-center rounded-md border border-white bg-black p-2 text-sm focus:outline-none`}
      id={id}
      type={type}
      min={min}
      max={max}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      required={required}
    ></input>
  );
}
