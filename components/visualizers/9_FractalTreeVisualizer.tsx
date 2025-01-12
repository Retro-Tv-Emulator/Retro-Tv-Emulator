import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const FractalTreeVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawTree = (x: number, y: number, length: number, angle: number, depth: number, hue: number) => {
      if (depth === 0) return;

      const endX = x + length * Math.cos(angle);
      const endY = y + length * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.lineWidth = depth;
      ctx.stroke();

      const newLength = length * 0.7;
      const newDepth = depth - 1;
      const newHue = (hue + 30) % 360;

      drawTree(endX, endY, newLength, angle - 0.5, newDepth, newHue);
      drawTree(endX, endY, newLength, angle + 0.5, newDepth, newHue);
    };

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

      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const maxDepth = Math.floor(average / 25) + 5; // Adjust tree complexity based on audio
      const baseHue = (Date.now() / 50) % 360; // Slowly changing base hue

      drawTree(WIDTH / 2, HEIGHT, HEIGHT / 4, -Math.PI / 2, maxDepth, baseHue);
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default FractalTreeVisualizer;

