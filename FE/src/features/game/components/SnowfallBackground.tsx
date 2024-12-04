import { useEffect, useRef } from 'react';

export const SnowfallBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Snowflake {
      x = 0;
      y = 0;
      radius = 0;
      speed = 0;
      opacity = 0;
      constructor() {
        this.reset();
      }

      reset() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 3 + 5; // 크기
        this.speed = Math.random() * 1 + 0.5; // 속도
        this.opacity = Math.random() * 0.5 + 0.3; // 반투명도
      }

      update() {
        if (!canvas) return;
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.reset();
          this.y = 0; // 화면 위로 다시 이동
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; // 흰색 반투명
        ctx.fill();
      }
    }

    const snowflakes: Snowflake[] = [];
    const maxSnowflakes = 100;

    const createSnowflakes = () => {
      for (let i = 0; i < maxSnowflakes; i++) {
        snowflakes.push(new Snowflake());
      }
    };

    const updateSnowflakes = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
      snowflakes.forEach((snowflake) => {
        snowflake.update();
        snowflake.draw();
      });
      requestAnimationFrame(updateSnowflakes); // 애니메이션
    };

    createSnowflakes();
    updateSnowflakes();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // 상호작용 방지
        zIndex: '0'
      }}
    />
  );
};

export default SnowfallBackground;
