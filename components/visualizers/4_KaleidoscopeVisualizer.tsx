import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const KaleidoscopeVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      analyser.fftSize = 1024;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'; 

      analyser.getByteFrequencyData(dataArray);

      const segments = 12;
      const angleStep = (Math.PI * 2) / segments;
      const radius = Math.max(WIDTH, HEIGHT) * 0.4725; // Increased from 0.45 to 0.4725 (5% larger)

      const createGradient = (intensity: number) => {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `hsla(${(Date.now() / 50) % 360}, 100%, 50%, ${intensity})`);
        gradient.addColorStop(0.5, `hsla(${((Date.now() / 50) + 120) % 360}, 100%, 50%, ${intensity * 0.7})`);
        gradient.addColorStop(1, `hsla(${((Date.now() / 50) + 240) % 360}, 100%, 50%, ${intensity * 0.5})`);
        return gradient;
      };

      for (let layer = 0; layer < 3; layer++) {
        ctx.save();
        ctx.translate(centerX, centerY);

        const layerOffset = layer * (Math.PI / segments);
        const intensity = 1 - (layer * 0.2);

        for (let s = 0; s < segments; s++) {
          ctx.save();
          ctx.rotate(s * angleStep + layerOffset);

          ctx.beginPath();
          ctx.moveTo(0, 0);

          for (let i = 0; i < bufferLength; i += 32) {
            const value = dataArray[i] / 256.0;
            const x = (radius * (i / bufferLength)) * Math.cos(value * Math.PI);
            const y = (radius * (i / bufferLength)) * Math.sin(value * Math.PI);

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              const prevValue = dataArray[Math.max(0, i - 32)] / 256.0;
              const cpx = radius * ((i - 16) / bufferLength) * Math.cos(prevValue * Math.PI * 1.5);
              const cpy = radius * ((i - 16) / bufferLength) * Math.sin(prevValue * Math.PI * 1.5);
              ctx.quadraticCurveTo(cpx, cpy, x, y);
            }
          }

          ctx.fillStyle = createGradient(intensity);
          ctx.fill();

          ctx.shadowBlur = 8; // Reduced from 10 to 8
          ctx.shadowColor = `hsla(${(Date.now() / 50 + layer * 120) % 360}, 100%, 50%, ${intensity * 0.4})`; // Reduced opacity from 0.5 to 0.4
          ctx.strokeStyle = `hsla(${(Date.now() / 50 + layer * 120) % 360}, 100%, 60%, ${intensity * 0.8})`; // Reduced lightness from 70% to 60% and intensity by 20%
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.restore();
        }

        ctx.scale(-1, 1);
        ctx.drawImage(canvas, -centerX, -centerY, WIDTH, HEIGHT);

        ctx.restore();
      }


      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default KaleidoscopeVisualizer;

