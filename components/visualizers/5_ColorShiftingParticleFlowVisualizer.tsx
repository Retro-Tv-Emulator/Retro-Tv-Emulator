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

const ColorShiftingParticleFlowVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    const particleCount = 200;
    let colorSet = 0;
    const colorSets = [
      ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      ['#FFA07A', '#98FB98', '#87CEFA'],
      ['#DDA0DD', '#F0E68C', '#90EE90'],
      ['#FF69B4', '#00CED1', '#FFA500']
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speed: Math.random() * 3 + 1,
        color: colorSets[colorSet][Math.floor(Math.random() * 3)],
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    let lastColorChange = Date.now();

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

      // Change colors every 7 seconds
      if (Date.now() - lastColorChange > 7000) {
        colorSet = (colorSet + 1) % colorSets.length;
        lastColorChange = Date.now();
      }

      particles.forEach((particle, index) => {
        particle.y -= particle.speed;
        particle.angle += particle.angleSpeed;
        particle.x += Math.sin(particle.angle) * 2;

        if (particle.y + particle.size < 0) {
          particle.y = HEIGHT + particle.size;
          particle.x = Math.random() * WIDTH;
          particle.color = colorSets[colorSet][Math.floor(Math.random() * 3)];
        }

        if (particle.x < 0) particle.x = WIDTH;
        if (particle.x > WIDTH) particle.x = 0;

        const frequencyIndex = Math.floor(index / particleCount * bufferLength);
        const frequency = dataArray[frequencyIndex];
        const scaleFactor = frequency / 256 + 0.5;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * scaleFactor, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
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

export default ColorShiftingParticleFlowVisualizer;

