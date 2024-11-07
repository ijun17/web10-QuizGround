type Props = {
  name: string;
  position: [number, number];
  isCurrent: boolean;
};

export const Player = ({ name, position, isCurrent }: Props) => {
  const [xPos, yPos] = position;
  const top = xPos * 100 + '%';
  const left = yPos * 100 + '%';
  return (
    <div
      className="absolute transition-all duration-500 ease-in-out"
      style={{ top, left, zIndex: isCurrent ? 3 : 1 }}
      onClick={(e) => e.preventDefault()}
    >
      <div>😀</div>
      <div style={{ color: isCurrent ? 'lightgreen' : 'inherit' }}>{name}</div>
    </div>
  );
};
