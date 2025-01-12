import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const CircularWaveformVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getFloatTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(200, 200, 200)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 0, 0)';

      ctx.beginPath();

      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;
      const radius = Math.min(WIDTH, HEIGHT) / 3;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] * 200.0;
        const theta = (i / bufferLength) * 2 * Math.PI;
        const x = centerX + (radius + v) * Math.cos(theta);
        const y = centerY + (radius + v) * Math.sin(theta);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.stroke();
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default CircularWaveformVisualizer;

