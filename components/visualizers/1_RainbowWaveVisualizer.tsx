import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const RainbowWaveVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const aspectRatio = 16 / 9;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const windowRatio = windowWidth / windowHeight;

      if (windowRatio > aspectRatio) {
        canvas.height = windowHeight;
        canvas.width = windowHeight * aspectRatio;
      } else {
        canvas.width = windowWidth;
        canvas.height = windowWidth / aspectRatio;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgb(0, 0, 0)';
      ctx.beginPath();

      const sliceWidth = WIDTH * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * HEIGHT / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        const hue = (i / bufferLength) * 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        x += sliceWidth;
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default RainbowWaveVisualizer;

