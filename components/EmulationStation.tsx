'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Silkscreen } from 'next/font/google';
import { useAudio } from '../contexts/AudioContext';

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] });

const styles = `
  .logo-image {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
  .scale-120 {
    transform: scale(1.2);
  }
  .preview-mode {
    transform: scale(0.8);
    transform-origin: center center;
  }
`;

interface EmulationStationProps {
  isActive: boolean;
  uiColor: string;
  isPreview?: boolean;
  disableControls?: boolean;
}

const logos = [
  { 
    name: "Game Boy Advance", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gameboy%20Advance.jpg-3WcBjs4StzhOC1x0lb5mPncXHmnse5.jpeg?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "Game Boy Color", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gameboy%20Color-iHW3tbU0WVdJ6HAqS98rQz1DkoUNDL.png?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "Game Boy", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gameboy-hSRY29WO5Teuu8RksolGls6Nn1tbVV.png?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "Nintendo 64", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nintendo%2064-cP3QAcmGz68y111MAbWBXNnscrNQdW.png?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "SEGA Genesis", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sega%20genesis.jpg-M4y0zcwqQbESTtdS63S0YZSnWGH9Ic.jpeg?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "Nintendo Entertainment System", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nintendo%20entertainment%20system.jpg-KB5coZds65BhEVFPEOjuMqZhk3RNIR.jpeg?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "PlayStation Portable", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PSP.jpg-ckDQv0A6HpgHSxiqDVc1GXV6Wp2kqQ.jpeg?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "Super Nintendo Entertainment System", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/super%20nintendo%20entertainment%20system.jpg-fYf3pK04tiPN8NcKDjkZnxCIi7zeEB.jpeg?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "PlayStation", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/playstation-fo9IXIJ03GXekZxK8WRrILaE7ZRhL4.png?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "MAME", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mame.jpg-dDzfrANjb2Vhkyk00IgVCj8zlYCFvQ.jpeg?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
  { 
    name: "DVD/VHS Player", 
    url: `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitl000ed-Wvn7kyjCNjmsLzwBm9RI0YdZBxBCxE.png?token=${process.env.BLOB_READ_WRITE_TOKEN}` 
  },
];

const BACKGROUND_VIDEO = `https://rs0eo86eke8nzztg.public.blob.vercel-storage.com/Tv%20Static%20Placeholder-SmieTVPj1fA75ItZIyKUnB52WWkfat.mp4?token=${process.env.BLOB_READ_WRITE_TOKEN}`;

const EmulationStation: React.FC<EmulationStationProps> = ({ isActive, uiColor, isPreview = false, disableControls = false }) => {
  const [currentView, setCurrentView] = useState<'system' | 'basic'>('system');
  const [selectedLogoIndex, setSelectedLogoIndex] = useState(0);
  const [isExitButtonFocused, setIsExitButtonFocused] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { audioSettings } = useAudio();

  useEffect(() => {
    if (isActive && currentView === 'system' && audioRef.current) {
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive, currentView]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioSettings.volume / 100;
      audioRef.current.muted = audioSettings.isMuted;
    }
  }, [audioSettings.volume, audioSettings.isMuted]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || (isPreview && disableControls)) return;

    switch (e.key.toLowerCase()) {
      case 'enter':
        if (currentView === 'system') {
          setCurrentView('basic');
        } else if (currentView === 'basic' && isExitButtonFocused) {
          setCurrentView('system');
        }
        break;
      case 'w':
        if (currentView === 'system') {
          setSelectedLogoIndex((prevIndex) => (prevIndex - 1 + logos.length) % logos.length);
        }
        break;
      case 's':
        if (currentView === 'system') {
          setSelectedLogoIndex((prevIndex) => (prevIndex + 1) % logos.length);
        }
        break;
    }
  }, [isActive, currentView, isExitButtonFocused, isPreview, disableControls]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getLogoIndex = (offset: number) => {
    return (selectedLogoIndex + offset + logos.length) % logos.length;
  };

  const renderLogo = (offset: number) => {
    const index = getLogoIndex(offset);
    const logo = logos[index];
    const size = offset === 0 
      ? (isPreview ? 'w-[320px] h-[96px]' : 'w-[400px] h-[120px]') 
      : (isPreview ? 'w-[224px] h-[67px]' : 'w-[280px] h-[84px]');
    const opacity = offset === 0 ? 'opacity-100' : 'opacity-50';
    const transition = 'transition-all duration-300 ease-in-out';

    return (
      <div key={index} className={`${size} relative ${opacity} ${transition}`}>
        <Image
          src={logo.url}
          alt={logo.name}
          layout="fill"
          className="logo-image"
          priority={offset === 0}
        />
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative transition-opacity duration-300 ${
        isActive ? 'opacity-100' : 'opacity-50'
      } ${!isPreview ? 'scale-120' : 'preview-mode'}`}
    >
      <style>{styles}</style>
      {currentView === 'system' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-8">
              {renderLogo(-1)}
              {renderLogo(0)}
              {renderLogo(1)}
            </div>
          </div>
        </div>
      )}

      {currentView === 'basic' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <video
            src={BACKGROUND_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-80" />
          <div className="relative z-10 text-white text-center">
            <h2 className={`${silkscreen.className} text-4xl mb-8`}>
              {logos[selectedLogoIndex].name}
            </h2>
            <div className={`${silkscreen.className} text-2xl mb-4`}>
              No games available
            </div>
            <button
              className={`${silkscreen.className} px-6 py-3 text-xl text-white rounded-lg transition-all duration-300 ${
                isExitButtonFocused 
                  ? `bg-${uiColor}-500 ring-4 ring-${uiColor}-400 shadow-lg shadow-${uiColor}-500/50` 
                  : `bg-${uiColor}-600 hover:bg-${uiColor}-700`
              }`}
              onClick={() => setCurrentView('system')}
              onFocus={() => setIsExitButtonFocused(true)}
              onBlur={() => setIsExitButtonFocused(false)}
            >
              Exit
            </button>
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11)-funky-s-fugue-M4ew542uAh1cibqCSg2um34ZpzhJkX.mp3"
        loop
      />
    </div>
  );
};

export default EmulationStation;

