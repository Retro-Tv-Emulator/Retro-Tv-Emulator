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
  angle: number;
  angleSpeed: number;
}

const ParticleFlowVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speed: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      particles.forEach((particle, index) => {
        particle.y -= particle.speed;
        particle.angle += particle.angleSpeed;
        particle.x += Math.sin(particle.angle) * 2;

        if (particle.y + particle.size < 0) {
          particle.y = HEIGHT + particle.size;
          particle.x = Math.random() * WIDTH;
        }

        if (particle.x < 0) particle.x = WIDTH;
        if (particle.x > WIDTH) particle.x = 0;

        const frequencyIndex = Math.floor(index / particleCount * bufferLength);
        const frequency = dataArray[frequencyIndex];
        const scaleFactor = frequency / 256 + 0.5;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * scaleFactor, 0, Math.PI * 2);
        
        // Create gradient for fade effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * scaleFactor
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default ParticleFlowVisualizer;

