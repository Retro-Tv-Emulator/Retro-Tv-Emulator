'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { VideoSettingsType } from './VideoSettings'
import { TOTAL_CHANNELS, FIRST_CHANNEL, LAST_CHANNEL } from '../constants';
import { Silkscreen } from 'next/font/google'
import EmulationStation from './EmulationStation';
import MusicVisualizerPlaceholder from './MusicVisualizerPlaceholder'
import Channel from './Channel'
import { FolderSelection } from '../types'
import VideoPlayerChannel from './VideoPlayerChannel'
import NoContentMessage from './NoContentMessage'
import MusicVisualizer from './MusicVisualizer';
import React from 'react';

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] })

interface Show {
  name: string
  time: string
  isPlaying?: boolean
}

interface ChannelData {
  id: number
  name: string
  shows: Show[]
  isEnabled: boolean
}

interface TVGuideProps {
  menuColor: string
  uiColor: string
  enabledChannels: Set<number>
  channelNames: Record<number, string>
  onChannelChange: (channel: number) => void;
  videoSettings: VideoSettingsType
  isAnyMenuOpen: boolean
  channelFolders: Record<number, FolderSelection>
  audioSettings?: {
    volume: number;
    isMuted: boolean;
  };
}

const tableStyles = `
  .tv-guide-table {
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    width: 100%;
  }
  .tv-guide-table th,
  .tv-guide-table td {
    width: 120px;
    padding: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tv-guide-table thead {
    position: sticky;
    top: 0;
    z-index: 20;
  }
  .tv-guide-table tbody {
    display: block;
    overflow-y: scroll;
    height: calc(100% - 40px);
  }
  .tv-guide-table thead tr,
  .tv-guide-table tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
`;

export default function TVGuide({ menuColor, uiColor, enabledChannels, channelNames, onChannelChange, videoSettings, isAnyMenuOpen, channelFolders, audioSettings }: TVGuideProps) {
  const [selectedTimeSlotIndex, setSelectedTimeSlotIndex] = useState(0)
  const [startChannelIndex, setStartChannelIndex] = useState(0)
  const [startTimeIndex, setStartTimeIndex] = useState(0)
  const [isChangingChannel, setIsChangingChannel] = useState(false)
  const visibleChannelCount = 11
  const visibleTimeSlotCount = 8
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([])
  const guideRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const generateTimeSlots = useCallback(() => {
    const now = new Date()
    const currentMinutes = now.getMinutes()
    const roundedMinutes = currentMinutes < 30 ? 0 : 30
    now.setMinutes(roundedMinutes, 0, 0)

    return Array.from({ length: 48 }, (_, i) => {
      const slotTime = new Date(now.getTime() + i * 30 * 60000)
      const hour = slotTime.getHours() % 12 || 12
      const minutes = slotTime.getMinutes().toString().padStart(2, '0')
      const ampm = slotTime.getHours() < 12 ? 'AM' : 'PM'
      return `${hour}:${minutes}${ampm}`
    })
  }, [])

  useEffect(() => {
    const initialChannels: ChannelData[] = Array.from({ length: LAST_CHANNEL - FIRST_CHANNEL + 1 }, (_, i) => {
      const channelNumber = i + FIRST_CHANNEL;
      let channelName = `${channelNumber.toString().padStart(2, '0')}`
      let showName = 'Off-Air'

      if (channelNumber === 3) {
        channelName = '03 Games'
        showName = 'Games'
      } else if (channelNumber === 4) {
        channelName += ' TV Guide'
        showName = 'TV Guide'
      } else if (channelNumber === 5) {
        channelName = '05'
        showName = 'Off-Air'
      } else if (channelNumber === 6) {
        channelName = '06'
        showName = 'Off-Air'
      } else if (channelNumber === 44) {
        channelName += ' Music'
        showName = 'Music'
      } else if (channelNames[channelNumber]) {
        channelName += ` ${channelNames[channelNumber]}`
      }

      return {
        id: channelNumber,
        name: channelName,
        shows: Array.from({ length: 48 }, () => ({
          name: showName,
          time: '',
          isPlaying: false
        })),
        isEnabled: enabledChannels.has(channelNumber)
      }
    })
    setChannels(initialChannels)
  }, [enabledChannels, channelNames])

  useEffect(() => {
    const timeSlots = generateTimeSlots()
    setAllTimeSlots(timeSlots)

    const intervalId = setInterval(() => {
      setAllTimeSlots(generateTimeSlots())
    }, 60000) 

    return () => clearInterval(intervalId)
  }, [generateTimeSlots])

  const changeChannel = useCallback((newChannelIndex: number) => {
    if (channels.length === 0) return;
    
    setIsChangingChannel(true);
    const safeIndex = newChannelIndex % channels.length;
    const newChannel = channels[safeIndex]?.id ?? FIRST_CHANNEL;
    onChannelChange(newChannel);
    setTimeout(() => {
      setIsChangingChannel(false);
    }, 700);
  }, [channels, onChannelChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyMenuOpen) return;

      switch (e.key.toLowerCase()) {
        case 'w':
          e.preventDefault()
          if (channels.length > 0) {
            setStartChannelIndex(prev => (prev - 1 + channels.length) % channels.length)
            setIsChangingChannel(true)
            setTimeout(() => setIsChangingChannel(false), 700)
          }
          break
        case 's':
          e.preventDefault()
          if (channels.length > 0) {
            setStartChannelIndex(prev => (prev + 1) % channels.length)
            setIsChangingChannel(true)
            setTimeout(() => setIsChangingChannel(false), 700)
          }
          break
        case 'a':
          e.preventDefault()
          setStartTimeIndex(prev => Math.max(0, prev - 1))
          break
        case 'd':
          e.preventDefault()
          setStartTimeIndex(prev => Math.min(allTimeSlots.length - visibleTimeSlotCount, prev + 1))
          break
        case 'enter':
          e.preventDefault();
          changeChannel(startChannelIndex + 1);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [channels.length, allTimeSlots.length, isAnyMenuOpen, changeChannel, startChannelIndex])

  const getPreviewStyle = () => {
    if (!previewRef.current) return {};

    const containerWidth = previewRef.current.offsetWidth;
    const containerHeight = previewRef.current.offsetHeight;

    const aspectRatio = 16 / 9;
    let width = containerWidth * 0.86625; 
    let height = width / aspectRatio;

    if (height > containerHeight * 0.98175) { 
      height = containerHeight * 0.98175;
      width = height * aspectRatio;
    }

    const horizontalPadding = (containerWidth - width) / 2;
    const verticalPadding = (containerHeight - height) / 2;

    return {
      width: `${width}px`,
      height: `${height}px`,
      marginLeft: `${horizontalPadding}px`,
      marginTop: `${verticalPadding}px`,
    };
  };

  const getPreviewContent = React.useCallback(() => {
    const previewChannelIndex = (startChannelIndex + 1) % channels.length;
    const previewChannel = channels[previewChannelIndex]?.id ?? 4;
    
    if (isChangingChannel) {
      return <div className="w-full h-full bg-black" />;
    }

    switch (previewChannel) {
      case 3:
        return <EmulationStation isActive={true} uiColor={uiColor} isPreview={true} />;
      case 4:
        return (
          <div className="w-full h-full flex items-center justify-center bg-black relative">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-12-26%20054916-W64uqoo1mj6JUQwXbt9wOgVO1fLDg8.png"
              alt="TV Guide"
              className="w-full h-full object-contain"
            />
          </div>
        );
      case 44:
        return (
          <MusicVisualizer
            playlist={channelFolders[44]?.morning || []}
            isCurrentChannel={true}
            isMuted={false}
            volume={1}
            currentTime={new Date()}
            hasCustomContent={channelFolders[44]?.morning?.length > 0}
            className="w-full h-full"
            isPreview={true}
          />
        );
      default:
        if (previewChannel >= 5 && previewChannel <= 43) {
          const folderContent = channelFolders[previewChannel] || {
            morning: [],
            evening: [],
            night: [],
            commercials: [],
            intros: [],
            outros: []
          };
          
          return (
            <Channel
              channel={previewChannel}
              videoSettings={videoSettings}
              folderContent={folderContent}
              isCurrentChannel={true}
              isPreview={true}
              audioSettings={audioSettings}
            />
          );
        }
        return <div className="w-full h-full bg-black" />;
    }
  }, [startChannelIndex, channels, isChangingChannel, uiColor, channelFolders, videoSettings, audioSettings]);

  const visibleChannels = React.useMemo(() => 
    channels.length > 0
      ? Array.from({ length: visibleChannelCount }, (_, index) => {
          const channelIndex = (startChannelIndex + index) % channels.length;
          return channels[channelIndex];
        })
      : []
  , [channels, startChannelIndex, visibleChannelCount]);

  const visibleTimeSlots = React.useMemo(() => 
    allTimeSlots.slice(startTimeIndex, startTimeIndex + visibleTimeSlotCount)
  , [allTimeSlots, startTimeIndex, visibleTimeSlotCount]);

  return (
    <div className="absolute inset-0 bg-black text-white font-mono text-sm flex flex-col z-10 overflow-hidden">
      <div className="h-[56.25%] bg-gray-900 relative overflow-hidden flex items-center justify-center" ref={previewRef}>
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 flex items-center justify-center" style={getPreviewStyle()}>
          {getPreviewContent()}
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col" ref={guideRef}>
        <div className="overflow-auto h-full flex flex-col">
          <div className="flex-grow overflow-auto">
            <table className="w-full border-collapse tv-guide-table">
              <thead>
                <tr className={`bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-900`}>
                  <th className={`p-2 border border-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-700 sticky left-0 z-30 w-[120px]`}>Channels</th>
                  {visibleTimeSlots.map((time, index) => (
                    <th key={time} className={`p-2 border border-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-700 w-[120px] bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-900`}>
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleChannels.length > 0 ? (
                  visibleChannels.map((channel, index) => (
                    <tr key={channel.id}>
                      <td className={`p-2 sticky left-0 z-20 ${
                        index === 1
                          ? `bg-${uiColor === 'blue' ? 'blue' : uiColor === 'green' ? 'green' : uiColor === 'red' ? 'red' : uiColor === 'pink' ? 'pink' : uiColor === 'purple' ? 'purple' : uiColor === 'yellow' ? 'yellow' : 'orange'}-500 text-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-900`
                          : `bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-800`
                      } border border-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-700 w-[120px]`}>
                        {channel.name}
                      </td>
                      {visibleTimeSlots.map((_, timeIndex) => (
                        <td 
                          key={timeIndex}
                          className={`p-2 border border-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-700 text-center relative w-[120px] ${
                            index === 1 && timeIndex === selectedTimeSlotIndex
                              ? `bg-${uiColor === 'blue' ? 'blue' : uiColor === 'green' ? 'green' : uiColor === 'red' ? 'red' : uiColor === 'pink' ? 'pink' : uiColor === 'purple' ? 'purple' : uiColor === 'yellow' ? 'yellow' : 'orange'}-500 text-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-900`
                              : `bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-600`
                          }`}
                        >
                          <div className="truncate">
                            {channel.id === 3 ? 'Games' : channel.shows[(startTimeIndex + timeIndex) % 48].name}
                          </div>
                          {index === 1 && timeIndex === selectedTimeSlotIndex && (
                            <div 
                              className="absolute inset-0 z-10" 
                              style={{
                                boxShadow: `0 0 10px 2px var(--${uiColor === 'blue' ? 'blue' : uiColor === 'green' ? 'green' : uiColor === 'red' ? 'red' : uiColor === 'pink' ? 'pink' : uiColor === 'purple' ? 'purple' : uiColor === 'yellow' ? 'yellow' : 'orange'}-500)`,
                                opacity: 0.5,
                              }}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleTimeSlotCount + 1} className="text-center p-4">
                      No channels available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`
        .tv-guide-table {
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
          width: 100%;
        }
        .tv-guide-table th,
        .tv-guide-table td {
          width: 120px;
          padding: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tv-guide-table thead {
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .tv-guide-table tbody {
          display: block;
          overflow-y: scroll;
          height: calc(100% - 40px);
        }
        .tv-guide-table thead tr,
        .tv-guide-table tbody tr {
          display: table;
          width: 100%;
          table-layout: fixed;
        }
      `}</style>
    </div>
  );
}

