import React, { useState } from 'react';

type ModalProps = {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  placeholder,
  initialValue = '',
  onSubmit
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue(''); // 입력값 초기화
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-2 mb-4 w-full"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white rounded-md px-4 py-2 mr-2 hover:bg-blue-600"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};
