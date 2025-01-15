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
    url: "/images/Gameboy Advance.jpg"
  },
  {
    name: "Game Boy Color",
    url: "/images/Gameboy Color.png"
  },
  {
    name: "Game Boy",
    url: "/images/Gameboy.png"
  },
  {
    name: "Nintendo 64",
    url: "/images/Nintendo 64.png"
  },
  {
    name: "SEGA Genesis",
    url: "/images/SEGA Genesis.jpg"
  },
  {
    name: "/Nintendo Entertainment System",
    url: "/images/Nintendo Entertainment System.jpg"
  },
  {
    name: "/PlayStation Portable",
    url: "/images/PlayStation Portable.png"
  },
  {
    name: "/Super Nintendo Entertainment System",
    url: "/images/Super Nintendo Entertainment System.jpg"
  },
  {
    name: "/PlayStation",
    url: "/images/PlayStation.png"
  },
  {
    name: "MAME",
    url: "/images/MAME.jpg"
  },
  {
    name: "DVD/VHS Player",
    url: "/images/DVDVHS.png"
  },
];

const BACKGROUND_VIDEO = "/videos/Tv Static Placeholder.mp4";

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
        src="/audio/Gaming Music.mp3"
        loop
      />
    </div>
  );
};

export default EmulationStation;

