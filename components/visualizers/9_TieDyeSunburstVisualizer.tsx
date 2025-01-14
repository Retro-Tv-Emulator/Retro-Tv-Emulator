import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const TieDyeSunburstVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
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
      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const maxRadius = Math.min(WIDTH, HEIGHT) * 0.45; // Adjusted back to original size

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const hue = (i / bufferLength) * 360 + time;
        const saturation = 100;
        const lightness = 50;

        const angle = (i / bufferLength) * Math.PI * 2;
        const radius = (value / 255) * maxRadius;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.lineTo(Math.cos(angle + Math.PI * 2 / bufferLength) * radius, Math.sin(angle + Math.PI * 2 / bufferLength) * radius);
        ctx.closePath();

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`);
        gradient.addColorStop(0.6, `hsla(${(hue + 30) % 360}, ${saturation}%, ${lightness}%, 0.7)`);
        gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, ${saturation}%, ${lightness}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.restore();

      time += 0.5;
    };

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

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default TieDyeSunburstVisualizer;

