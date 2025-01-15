'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { VideoSettingsType } from './VideoSettings'
import { createPlaylist } from '../utils/createPlaylist'
import EmulationStation from './EmulationStation'
import MusicVisualizer from './MusicVisualizer'
import { useAudio } from '../contexts/AudioContext'
import { Silkscreen } from 'next/font/google'
import React from 'react';

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] })

interface ChannelProps {
 channel: number
 videoSettings: VideoSettingsType
 folderContent: {
   morning: string[]
   evening: string[]
   night: string[]
   commercials: string[]
   intros: string[]
   outros: []
 }
 isCurrentChannel: boolean
 isPreview?: boolean
 audioSettings?: {
   volume: number
   isMuted: boolean
 }
 isMusic?: boolean
}

const TV_GUIDE_IMAGE = `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-12-26%20054916-W64uqoo1mj6JUQwXbt9wOgVO1fLDg8.png?token=${process.env.BLOB_READ_WRITE_TOKEN}`;
const STATIC_VIDEO = "/Videos/Tv Static Placeholder.mp4";

export default function Channel({
 channel,
 videoSettings,
 folderContent,
 isCurrentChannel,
 isPreview = false,
 audioSettings,
 isMusic = false
}: ChannelProps) {
 const { audioSettings: audioSettingsFromContext } = useAudio()
 const videoRef = useRef<HTMLVideoElement>(null)
 const [playlist, setPlaylist] = useState<{ type: string; url: string }[]>([])
 const [currentItemIndex, setCurrentItemIndex] = useState(0)
 const [isTransitioning, setIsTransitioning] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [hasMediaForChannel, setHasMediaForChannel] = useState(false);

 const memoizedPlaylist = React.useMemo(() => {
  if (channel >= 5 && channel <= 44) {
    return createPlaylist(folderContent, new Date(), videoSettings, channel);
  }
  return [];
}, [channel, folderContent, videoSettings]);

 useEffect(() => {
   if (channel >= 5 && channel <= 44) {
     setPlaylist(memoizedPlaylist);
     setHasMediaForChannel(memoizedPlaylist.length > 0);
   } else {
     setPlaylist([]);
     setHasMediaForChannel(false);
   }
 }, [channel, memoizedPlaylist]);

 useEffect(() => {
   setIsTransitioning(true)
   const timer = setTimeout(() => {
     setIsTransitioning(false)
   }, 700)
   return () => clearTimeout(timer)
 }, [channel])

 const handleEnded = useCallback(() => {
  setCurrentItemIndex((prevIndex) => (prevIndex + 1) % Math.max(playlist.length, 1));
}, [playlist.length]);

 useEffect(() => {
   setCurrentItemIndex(0)
 }, [channel])

 useEffect(() => {
   if (videoRef.current) {
     videoRef.current.volume = audioSettings?.volume / 100;
     videoRef.current.muted = audioSettings?.isMuted;
   }
 }, [audioSettings?.volume, audioSettings?.isMuted]);

 useEffect(() => {
   if (!isCurrentChannel && videoRef.current && audioSettings) {
     videoRef.current.volume = audioSettings.volume / 100;
   }
}, [isCurrentChannel, audioSettings?.volume]);

 const currentItem = playlist[currentItemIndex];

 useEffect(() => {
   if (isCurrentChannel && videoRef.current && currentItem && hasMediaForChannel) {
     videoRef.current.src = currentItem.url;
     videoRef.current.load();
     videoRef.current.play().catch(e => {
       console.error(`Error playing video on channel ${channel}:`, e);
       setError(`Failed to play video: ${e.message || 'Unknown error'}`);
     });
   }
 }, [isCurrentChannel, currentItem, channel, hasMediaForChannel]);

 useEffect(() => {
  if (!isCurrentChannel || !videoRef.current || isPreview) return;

  const currentItem = memoizedPlaylist[currentItemIndex];
  if (!currentItem) return;

  videoRef.current.src = currentItem.url;
  videoRef.current.load();
  videoRef.current.play().catch(e => {
    console.error(`Error playing video on channel ${channel}:`, e);
    setError(`Failed to play video: ${e.message || 'Unknown error'}`);
  });

  return () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  };
}, [isCurrentChannel, isPreview, memoizedPlaylist, currentItemIndex, channel]);

 if (channel === 3) {
   return <EmulationStation isActive={isCurrentChannel} uiColor="green" isPreview={isPreview} />;
 }

 if (channel === 44) {
  const musicFiles = folderContent.morning || [];
  return (
    <MusicVisualizer
      playlist={musicFiles.map(url => ({ url, title: 'Unknown Title' }))}
      isCurrentChannel={isCurrentChannel}
      isMuted={(audioSettings || audioSettingsFromContext).isMuted}
      volume={(audioSettings || audioSettingsFromContext).volume / 100}
      currentTime={new Date()}
      hasCustomContent={musicFiles.length > 0}
      className="w-full h-full"
      isPreview={isPreview}
    />
  );
}

 if (channel === 4) {
   return (
     <div className="w-full h-full flex items-center justify-center bg-black">
       <img
         src={TV_GUIDE_IMAGE || "/placeholder.svg"}
         alt="TV Guide"
         className="w-full h-full object-contain"
       />
     </div>
   );
 }

 // For channels 5-43
 if (channel >= 5 && channel <= 43) {
   if (!hasMediaForChannel || playlist.length === 0) {
     return (
       <div className="w-full h-full flex items-center justify-center bg-black relative">
         <video
           ref={videoRef}
           src={STATIC_VIDEO}
           autoPlay
           loop
           playsInline
           muted={audioSettings?.isMuted}
           className="w-full h-full object-cover"
           style={{
             filter: `brightness(${videoSettings.brightness}%) contrast(${videoSettings.contrast}%) saturate(${videoSettings.sharpness}%)`,
           }}
         />
       </div>
     );
   }

   return (
     <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
       {isTransitioning ? (
         <div className="w-full h-full bg-black" />
       ) : (
         <div className="relative w-full h-full">
           <video
             ref={videoRef}
             src={currentItem.url}
             autoPlay
             loop={false}
             muted={(audioSettings || audioSettingsFromContext).isMuted}
             className="absolute top-0 left-0 w-full h-full object-contain"
             onEnded={handleEnded}
             onError={(e) => {
               console.error(`Error playing video on channel ${channel}:`, e);
               setError(`Failed to play video: ${e}`);
             }}
             style={{
               filter: `brightness(${videoSettings.brightness}%) contrast(${videoSettings.contrast}%) saturate(${videoSettings.sharpness}%)`,
             }}
           />
         </div>
       )}
       {error && (
         <div className="absolute top-0 left-0 bg-red-500 text-white p-2">
           {error}
         </div>
       )}
     </div>
   );
 }

 // For any other channels
 return (
  <div className="w-full h-full flex items-center justify-center bg-black text-white">
    <p className={`${silkscreen.className} text-4xl`}>Off-Air</p>
  </div>
 );
}

