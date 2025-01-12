import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

const ParticleFieldVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const particles: Particle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: Math.random() * 5 + 1,
        speed: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      });
    }

    const draw = () => {
      requestAnimationFrame(draw);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      analyser.getByteFrequencyData(dataArray);

      particles.forEach((particle, index) => {
        particle.y -= particle.speed;
        if (particle.y < 0) {
          particle.y = HEIGHT;
        }

        const frequencyIndex = Math.floor(index / particleCount * bufferLength);
        const frequency = dataArray[frequencyIndex];
        const scaleFactor = frequency / 256 + 0.5;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * scaleFactor, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default ParticleFieldVisualizer;

