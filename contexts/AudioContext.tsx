import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioSettingsType } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';

interface AudioContextType {
  audioSettings: AudioSettingsType;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettingsType>>;
  toggleMute: () => void;
  changeVolume: (delta: number) => void;
  isAudioInitialized: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioSettings, setAudioSettings] = useState<AudioSettingsType>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS.audio;
    const savedSettings = loadFromLocalStorage('audioSettings', DEFAULT_SETTINGS.audio);
    return {
      ...savedSettings,
      isMuted: false, // Ensure audio is not muted by default
    };
  });

  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const audioInitAttempts = useRef(0);
  const maxInitAttempts = 3;

  useEffect(() => {
    const initAudio = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContext();
        
        if (context.state === 'suspended') {
          await context.resume();
        }
        
        setIsAudioInitialized(true);
        console.log('Audio context initialized successfully');
      } catch (error) {
        console.error('Error initializing audio context:', error);
        if (audioInitAttempts.current < maxInitAttempts) {
          audioInitAttempts.current++;
          setTimeout(initAudio, 1000);
        }
      }
    };

    if (!isAudioInitialized) {
      initAudio();
    }

    return () => {
      audioInitAttempts.current = 0;
    };
  }, [isAudioInitialized]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveToLocalStorage('audioSettings', audioSettings);
    }
  }, [audioSettings]);

  const toggleMute = () => {
    setAudioSettings(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const changeVolume = (delta: number) => {
    setAudioSettings(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(100, prev.volume + delta)),
    }));
  };

  return (
    <AudioContext.Provider value={{ 
      audioSettings, 
      setAudioSettings, 
      toggleMute, 
      changeVolume,
      isAudioInitialized 
    }}>
      {children}
    </AudioContext.Provider>
  );
};

