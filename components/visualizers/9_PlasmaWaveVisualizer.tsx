import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const PlasmaWaveVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
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

      const imageData = ctx.createImageData(WIDTH, HEIGHT);
      const data = imageData.data;

      for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
          const index = (x + y * WIDTH) * 4;
          const frequency = dataArray[Math.floor(x / WIDTH * bufferLength)] / 255;

          const value = Math.sin(x / 20 + time)
            + Math.sin(y / 20 + time)
            + Math.sin((x + y) / 20 + time)
            + Math.sin(Math.sqrt(x * x + y * y) / 20);

          const normalizedValue = (value + 4) / 8;
          const colorValue = Math.floor(normalizedValue * 255 * frequency);

          data[index] = colorValue;
          data[index + 1] = colorValue * Math.sin(time);
          data[index + 2] = 255 - colorValue;
          data[index + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      time += 0.05;
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default PlasmaWaveVisualizer;

