'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Silkscreen } from 'next/font/google'
import { AudioAnalyzer } from '../utils/audioAnalyzer';
import BubbleVisualizer from './visualizers/8_BubbleVisualizer';
import RainbowWaveVisualizer from './visualizers/1_RainbowWaveVisualizer';
import CircularSpectrumVisualizer from './visualizers/2_CircularSpectrumVisualizer';
import LavaLampVisualizer from './visualizers/3_LavaLampVisualizer';
import KaleidoscopeVisualizer from './visualizers/4_KaleidoscopeVisualizer';
import ColorShiftingParticleFlowVisualizer from './visualizers/5_ColorShiftingParticleFlowVisualizer';
import SoundWaveVisualizer from './visualizers/6_SoundWaveVisualizer';
import SpiralGalaxyVisualizer from './visualizers/7_SpiralGalaxyVisualizer';
import StarfieldVisualizer from './visualizers/10_StarfieldVisualizer';
import TieDyeCloudVisualizer from './visualizers/9_TieDyeCloudVisualizer';

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] })

const DEFAULT_MUSIC_URL = "audio/Music Visualizer Placeholder.mp3";
const DEFAULT_MUSIC_TITLE = 'Default Music';

interface Song {
  url: string;
  title: string;
}

interface MusicVisualizerProps {
  playlist: { url: string; title: string }[];
  isCurrentChannel: boolean;
  isMuted: boolean;
  volume: number;
  currentTime?: Date;
  className?: string;
  hasCustomContent: boolean;
  isPreview?: boolean;
}

const visualizers = [
  { component: RainbowWaveVisualizer, name: '1. Rainbow Wave' },
  { component: CircularSpectrumVisualizer, name: '2. Circular Spectrum' },
  { component: LavaLampVisualizer, name: '3. Lava Lamp' },
  { component: KaleidoscopeVisualizer, name: '4. Kaleidoscope' },
  { component: ColorShiftingParticleFlowVisualizer, name: '5. Color Shifting Particle Flow' },
  { component: SoundWaveVisualizer, name: '6. Sound Wave' },
  { component: SpiralGalaxyVisualizer, name: '7. Spiral Galaxy' },
  { component: BubbleVisualizer, name: '8. Bubble' },
  { component: TieDyeCloudVisualizer, name: '9. Tie-Dye Clouds' },
  { component: StarfieldVisualizer, name: '10. Starfield' },
];

export default function MusicVisualizer({ 
  playlist = [], 
  isCurrentChannel, 
  isMuted, 
  volume,
  currentTime = new Date(),
  className = '',
  hasCustomContent = false,
  isPreview = false
}: MusicVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentVisualizerIndex, setCurrentVisualizerIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const unmountingRef = useRef(false);

  const selectRandomVisualizer = useCallback(() => {
    setCurrentVisualizerIndex(prev => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * visualizers.length);
      } while (newIndex === prev);
      return newIndex;
    });
  }, []);


  const setupAudioElement = useCallback(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audio.volume = volume;
    audio.muted = isMuted;
    audio.loop = true;

    audio.addEventListener('ended', () => {
      if (!unmountingRef.current) {
        selectRandomVisualizer();
        if (hasCustomContent && playlist.length > 1) {
          const nextSong = playlist[Math.floor(Math.random() * playlist.length)];
          audio.src = nextSong.url;
          setCurrentSong(nextSong);
        }
        audio.play().catch(error => console.error('Replay error:', error));
      }
    });

    return audio;
  }, [volume, isMuted, selectRandomVisualizer, hasCustomContent, playlist]);

  const initializeAudioPlayback = useCallback(async (audio: HTMLAudioElement) => {
    try {
      // Ensure the audio is fully loaded before playing
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
        audio.load();
      });

      await audio.play();
      setIsPlaying(true);
      setError(null);
    } catch (error) {
      console.error('Playback error:', error);
      setError('Failed to start playback');
    }
  }, []);

  const initializeAudio = useCallback(async () => {
    if (unmountingRef.current) return;

    try {
      if (!audioRef.current) {
        const audio = setupAudioElement();
        audioRef.current = audio;

        const analyzer = new AudioAnalyzer();
        await analyzer.init();
        await analyzer.connectSource(audio);
        analyzerRef.current = analyzer;
      }

      const songToPlay = hasCustomContent && playlist.length > 0
        ? playlist[Math.floor(Math.random() * playlist.length)]
        : { url: DEFAULT_MUSIC_URL, title: DEFAULT_MUSIC_TITLE };

      if (audioRef.current.src !== songToPlay.url) {
        audioRef.current.src = songToPlay.url;
        setCurrentSong(songToPlay);
      }

      if (isCurrentChannel || isPreview) { // Updated condition
        await initializeAudioPlayback(audioRef.current);
      }
    } catch (error) {
      console.error('Audio initialization error:', error);
      setError('Failed to initialize audio system');
    }
  }, [hasCustomContent, isCurrentChannel, isPreview, playlist, setupAudioElement, initializeAudioPlayback]);

  useEffect(() => {
    unmountingRef.current = false;
    
    const initAudio = async () => {
      if (unmountingRef.current) return;

      try {
        if (!audioRef.current) {
          const audio = setupAudioElement();
          audioRef.current = audio;

          const analyzer = new AudioAnalyzer();
          await analyzer.init();
          await analyzer.connectSource(audio);
          analyzerRef.current = analyzer;
        }

        const songToPlay = hasCustomContent && playlist.length > 0
          ? playlist[Math.floor(Math.random() * playlist.length)]
          : { url: DEFAULT_MUSIC_URL, title: DEFAULT_MUSIC_TITLE };

        if (audioRef.current.src !== songToPlay.url) {
          audioRef.current.src = songToPlay.url;
          setCurrentSong(songToPlay);
        }

        if (isCurrentChannel || isPreview) {
          await initializeAudioPlayback(audioRef.current);
        }
      } catch (error) {
        console.error('Audio initialization error:', error);
        setError('Failed to initialize audio system');
      }
    };

    initAudio();

    return () => {
      unmountingRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (analyzerRef.current) {
        analyzerRef.current.cleanup();
      }
    };
  }, [hasCustomContent, isCurrentChannel, isPreview, playlist, setupAudioElement, initializeAudioPlayback]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'v' && isCurrentChannel && !isPreview) {
        selectRandomVisualizer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCurrentChannel, isPreview, selectRandomVisualizer]);

  useEffect(() => {
    if (isCurrentChannel || isPreview) {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().catch(error => console.error('Resume playback error:', error));
      }
    } else {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
      }
    }
  }, [isCurrentChannel, isPreview, isPlaying]);


  const CurrentVisualizer = visualizers[currentVisualizerIndex].component;

  useEffect(() => {
    selectRandomVisualizer();
  }, [currentSong, selectRandomVisualizer]);

  if (isPreview) {
    return (
      <div className={`bg-black overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          {analyzerRef.current?.analyser && (
            <CurrentVisualizer analyser={analyzerRef.current.analyser} />
          )}
        </div>
      </div>
    );
  }

  if (!isCurrentChannel) {
    return null;
  }

  return (
    <div className={`bg-black overflow-hidden ${className}`}>
      {analyzerRef.current?.analyser && (
        <CurrentVisualizer analyser={analyzerRef.current.analyser} />
      )}
      <div className="absolute top-4 left-4 text-white opacity-70">
        <p className={silkscreen.className}>
          NOW PLAYING: {currentSong?.title || 'No song playing'}
        </p>
        <p className={silkscreen.className}>
          VISUALIZER: {visualizers[currentVisualizerIndex].name}
        </p>
      </div>
      {error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
