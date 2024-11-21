import { useEffect, useRef, useState } from 'react';

type InputProps = {
  placeholder: string;
  error: string;
  focus?: boolean;
};

export const Input = (props: InputProps) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (props.focus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [props.focus, inputRef]);

  return (
    <div>
      <input
        ref={inputRef}
        className="bg-[#0001] w-[100%] h-[2rem] rounded-m p-2"
        type="text"
        placeholder={props.placeholder}
        value={inputValue}
        onChange={handleInputChange}
      />
      <p className="text-red-600">{props.error}</p>
    </div>
  );
};
