interface InputField {
  id: string;
  type: string;
  min?: number;
  max?: number;
  value: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
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
}: InputField) {
  return (
    <input
      className="h-8 w-52 rounded-md p-2 text-sm text-gray-800 focus:outline-none"
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
