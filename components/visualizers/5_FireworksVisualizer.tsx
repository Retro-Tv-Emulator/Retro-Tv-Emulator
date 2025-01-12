import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const FireworksVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: { x: number; y: number };

      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3
        };
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }

      update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.radius -= 0.05;
      }
    }

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
        if (dataArray[i] > 200) {
          const x = Math.random() * WIDTH;
          const y = Math.random() * HEIGHT;
          const radius = Math.random() * 3 + 1;
          const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
          for (let j = 0; j < 8; j++) {
            particles.push(new Particle(x, y, radius, color));
          }
        }
      }

      particles.forEach((particle, index) => {
        if (particle.radius > 0) {
          particle.update();
        } else {
          particles.splice(index, 1);
        }
      });
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default FireworksVisualizer;

