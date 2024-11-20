type ModalProps = {
  isOpen: boolean;
  title: string;
  buttonText?: string;
  onClose?: () => void;
};

export const ErrorModal = ({ isOpen, title, buttonText, onClose }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white rounded-md px-4 py-2 mr-2 hover:bg-red-600"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
