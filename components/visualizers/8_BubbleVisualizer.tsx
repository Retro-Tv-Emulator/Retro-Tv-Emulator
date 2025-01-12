import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
}

const BubbleVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bubbles: Bubble[] = [];

    const createBubble = () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 20,
      radius: Math.random() * 20 + 5,
      color: `hsla(${Math.random() * 360}, 100%, 50%, 0.7)`,
      speed: Math.random() * 2 + 0.5
    });

    for (let i = 0; i < 100; i++) {
      bubbles.push(createBubble());
    }

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      bubbles.forEach((bubble, index) => {
        bubble.y -= bubble.speed;
        if (bubble.y + bubble.radius < 0) {
          bubbles[index] = createBubble();
        }

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();

        // Update bubble size based on audio data, with reduced vibration
        const dataIndex = Math.floor((index / bubbles.length) * bufferLength);
        const targetRadius = (dataArray[dataIndex] / 256) * 20 + 5; // Reduced maximum size
        bubble.radius += (targetRadius - bubble.radius) * 0.1; // Smooth transition
      });
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default BubbleVisualizer;

