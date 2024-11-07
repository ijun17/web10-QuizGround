type Props = {
  name: string;
  position: [number, number];
};

export const Player = ({ name, position }: Props) => {
  const [xPos, yPos] = position;
  //   const randomX = xPos + Math.floor(Math.random() * 100) + 1; // 1~100 범위의 랜덤값을 xPos에 추가
  //   const randomY = yPos + Math.floor(Math.random() * 100) + 1;

  const top = xPos * 100 + '%';
  const left = yPos * 100 + '%';
  console.log(top, left);
  return (
    <div className="absolute transition-all" style={{ top, left }}>
      {'😀' + name}
    </div>
  );
};
