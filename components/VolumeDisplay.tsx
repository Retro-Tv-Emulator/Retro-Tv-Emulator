import React from 'react';

interface VolumeDisplayProps {
  volume: number;
  uiColor: string;
  isMuted: boolean;
}

function getColorHex(color: string): string {
  switch (color) {
    case 'blue': return '#3b82f6';
    case 'green': return '#22c55e';
    case 'red': return '#ef4444';
    case 'pink': return '#ec4899';
    case 'purple': return '#9333ea';
    case 'yellow': return '#eab308';
    case 'orange': return '#f97316';
    default: return '#22c55e';
  }
}

export default function VolumeDisplay({ volume, uiColor, isMuted }: VolumeDisplayProps) {
  if (isMuted) return null;

  const totalSegments = 32;
  const litSegments = Math.round((volume / 100) * totalSegments);
  const colorHex = getColorHex(uiColor);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 font-mono w-[60%] z-50">
      <div 
        className="text-2xl tracking-widest mb-2 font-['Press_Start_2P']"
        style={{ 
          color: colorHex,
          textShadow: `0 0 10px ${colorHex}`
        }}
      >
        VOLUME
      </div>
      <div className="flex gap-[2px] justify-center w-full">
        {Array.from({ length: totalSegments }).map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: index < litSegments ? colorHex : '#333',
              width: '0.5rem',
              height: '1.5rem',
            }}
          />
        ))}
      </div>
    </div>
  );
}

