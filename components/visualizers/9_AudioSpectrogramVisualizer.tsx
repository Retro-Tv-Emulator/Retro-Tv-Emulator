import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode;
}

const AudioSpectrogramVisualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = WIDTH / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 255 * HEIGHT;

        const hue = i / bufferLength * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, ${barHeight / HEIGHT * 100}%)`;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth;
      }

      // Shift the existing spectrogram to the left
      const imageData = ctx.getImageData(1, 0, WIDTH - 1, HEIGHT);
      ctx.putImageData(imageData, 0, 0);

      // Clear the rightmost column
      ctx.clearRect(WIDTH - 1, 0, 1, HEIGHT);

      // Draw the new data in the rightmost column
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 255 * HEIGHT;
        const hue = i / bufferLength * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, ${barHeight / HEIGHT * 100}%)`;
        ctx.fillRect(WIDTH - 1, HEIGHT - barHeight, 1, barHeight);
      }
    };

    draw();
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default AudioSpectrogramVisualizer;

