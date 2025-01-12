import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const StarfieldVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars: Star[] = [];

    class Star {
      x: number;
      y: number;
      z: number;
      color: string;

      constructor() {
        this.x = Math.random() * 2 - 1;
        this.y = Math.random() * 2 - 1;
        this.z = Math.random();
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      }

      update(speed: number) {
        this.z -= speed;
        if (this.z <= 0) {
          this.z = 1;
          this.x = Math.random() * 2 - 1;
          this.y = Math.random() * 2 - 1;
        }
      }

      draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const sx = (this.x / this.z) * width / 2 + width / 2;
        const sy = (this.y / this.z) * height / 2 + height / 2;
        const r = (1 - this.z) * 2;

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < 200; i++) {
      stars.push(new Star());
    }

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const speed = dataArray.reduce((a, b) => a + b, 0) / (bufferLength * 256) * 0.1;

      stars.forEach(star => {
        star.update(speed);
        star.draw(ctx, WIDTH, HEIGHT);
      });
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default StarfieldVisualizer;

