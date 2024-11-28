type PingEffectProps = {
  position: { x: number; y: number } | null; // position의 타입 정의
};

const PingEffect: React.FC<PingEffectProps> = ({ position }) => {
  if (!position) return null;

  return (
    <div
      className="absolute bg-blue-500 rounded-full animate-ping overflow-hidden"
      style={{
        left: `${position.x - 20}px`,
        top: `${position.y - 20}px`,
        width: '40px',
        height: '40px',
        zIndex: 10,
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default PingEffect;
