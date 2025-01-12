import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const TieDyeCloudVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

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

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const x = Math.random() * WIDTH;
        const y = Math.random() * HEIGHT;
        const size = (value / 255) * 100 + 10;
        const hue = (i / bufferLength) * 360 + time;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${(hue + 30) % 360}, 100%, 50%, 0.5)`);
        gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 100%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Pulsating effect
      const pulseFactor = Math.sin(time * 0.1) * 0.1 + 0.9;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgba(255, 255, 255, ${pulseFactor})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.globalCompositeOperation = 'source-over';

      time += 0.5;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default TieDyeCloudVisualizer;

