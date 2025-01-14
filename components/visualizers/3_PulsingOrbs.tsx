import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const PulsingOrbs: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 32;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 1.5;
        const x = (WIDTH / bufferLength) * i + WIDTH / (bufferLength * 2);
        const y = HEIGHT / 2;

        ctx.beginPath();
        ctx.arc(x, y, barHeight / 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${i * 360 / bufferLength}, 100%, 50%)`;
        ctx.fill();
      }
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default PulsingOrbs;

