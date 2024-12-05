type CustomButtonProps = {
  text: string;
  onClick?: () => void;
  className?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow'; // 색상 옵션
  size?: 'full' | 'half' | 'third' | 'small'; // 버튼 크기 옵션
};

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onClick,
  className,
  color = 'blue',
  size = 'full'
}) => {
  const colorClass = {
    blue: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
    green: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
    red: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700'
  };

  const sizeClass = {
    full: 'w-full', // 기본 크기
    half: 'w-1/2',
    third: 'w-1/3',
    small: 'w-32' // 작은 버튼 예시 (8rem)
  };

  return (
    <button
      className={`h-12 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out ${colorClass[color]} ${sizeClass[size]} ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default CustomButton;
