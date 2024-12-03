import { useEffect, useState, ReactNode } from 'react';

type RandomBackgroundProps = {
  children: ReactNode;
};

const backgrounds = [
  'bg-gradient-to-r from-sky-300 to-indigo-500',
  'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300',
  'bg-gradient-to-r from-green-200 to-blue-400',
  "bg-[url('/snowBg1.png')] bg-cover bg-center",
  "bg-[url('/snowBg2.png')] bg-cover bg-center",
  "bg-[url('/snowBg3.png')] bg-cover bg-center",
  "bg-[url('/snowBg5.png')] bg-cover bg-center",
  "bg-[url('/snowBg6.png')] bg-cover bg-center"
];

const RandomBackGround: React.FC<RandomBackgroundProps> = ({ children }) => {
  const [background, setBackground] = useState<string>('');

  useEffect(() => {
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    setBackground(randomBackground);
  }, []);

  return (
    <div
      className={`fixed w-full h-full flex flex-col overflow-hidden items-center justify-center ${background}`}
    >
      {children}
    </div>
  );
};

export default RandomBackGround;
