import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const SpectrumRingsVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const maxRadius = Math.min(WIDTH, HEIGHT) * 0.325; // Reduced by 35%
      const bands = 5;

      for (let band = 0; band < bands; band++) {
        ctx.beginPath();
        const radius = (maxRadius / bands) * (band + 1);

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] * 0.5;
          const angle = (i / bufferLength) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * (radius + barHeight);
          const y = centerY + Math.sin(angle) * (radius + barHeight);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.strokeStyle = `hsl(${(band / bands) * 360}, 100%, 50%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default SpectrumRingsVisualizer;

