import { TextField } from '@mui/material';
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
      inputRef.current.querySelector('input')?.focus();
    }
  }, [props.error, inputRef]);

  return (
    <div className={'w-full ' + props.className}>
      <div className="flex items-center">
        <TextField
          ref={inputRef}
          label={props.label}
          type={props.type || 'text'}
          variant="outlined"
          value={props.value}
          onChange={props.onChange}
          className="w-full flex-grow"
          slotProps={{
            inputLabel: {
              style: { color: props.error ? 'red' : 'inherit', borderColor: 'red' }
            }
          }}
        />
        {props.children}
      </div>
      <p className={'text-red-600 text-sm'}>{props.error}</p>
    </div>
  );
};
