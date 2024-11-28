import { ReactNode, useEffect, useRef } from 'react';

type InputProps = {
  type?: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  className?: string;
  children?: ReactNode;
};

export const TextInput = (props: InputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (props.error && inputRef.current) {
      inputRef.current.focus();
    }
  }, [props.error, inputRef]);

  return (
    <div className={'relative w-full ' + props.className}>
      <div className="flex items-center">
        <input
          ref={inputRef}
          placeholder={props.label}
          type={props.type || 'text'}
          value={props.value}
          onChange={props.onChange}
          className="w-full flex-grow h-12 border rounded-lg pl-2"
        />
        {props.children}
      </div>
      {props.error && (
        <div className="absolute z-10">
          <p className=" text-red-600 text-sm bg-gray-100 px-2 py-1 rounded shadow-lg opacity-90">
            {props.error}
          </p>
          <div
            className="absolute left-6 bottom-full w-0 h-0 "
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid rgb(243 244 246)'
            }}
          />
        </div>
      )}
    </div>
  );
};
