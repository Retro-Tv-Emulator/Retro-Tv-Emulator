import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const RotatingBarsVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotation = 0;

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      analyser.fftSize = 128;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      const barWidth = 4;
      const radius = Math.min(WIDTH, HEIGHT) / 3;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 0.5;
        const angle = (i / bufferLength) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        ctx.fillStyle = `hsl(${i * 360 / bufferLength}, 100%, 50%)`;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      ctx.restore();

      rotation += 0.01;
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default RotatingBarsVisualizer;

