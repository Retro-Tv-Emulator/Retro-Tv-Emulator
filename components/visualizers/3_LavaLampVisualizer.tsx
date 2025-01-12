import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

interface Blob {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
}

const LavaLampVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const blobs: Blob[] = Array.from({ length: 15 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 25 + 10,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      vx: (Math.random() * 0.5 - 0.25) * 1.1,
      vy: (Math.random() * 0.5 - 0.25) * 1.1
    }));

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      blobs.forEach((blob, index) => {
        blob.radius = dataArray[index * 4] / 8 + 10;
        blob.x += blob.vx * 0.55;
        blob.y += blob.vy * 0.55;

        if (blob.x < 0 || blob.x > WIDTH) {
          blob.vx *= -1.1;
          blob.x = Math.max(0, Math.min(blob.x, WIDTH));
        }
        if (blob.y < 0 || blob.y > HEIGHT) {
          blob.vy *= -1.1;
          blob.y = Math.max(0, Math.min(blob.y, HEIGHT));
        }

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        blob.color = blob.color;
        ctx.fillStyle = blob.color;
        ctx.fill();
      });
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default LavaLampVisualizer;

