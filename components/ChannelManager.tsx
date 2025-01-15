'use client'

import React, { useState, useEffect } from 'react'
import Channel from './Channel'
import TVGuide from './TVGuide'
import VideoPlayerChannel from './VideoPlayerChannel'
import { VideoSettingsType } from './VideoSettings'
import { FolderSelection } from '../types'
import { useAudio } from '../contexts/AudioContext'
import EmulationStation from './EmulationStation'
import MusicVisualizer from './MusicVisualizer'

interface ChannelManagerProps {
  currentChannel: number
  videoSettings: VideoSettingsType
  channelFolders: Record<number, FolderSelection>
  enabledChannels: Set<number>
  channelNames: Record<number, string>
  onChannelChange: (channel: number) => void
  menuColor: string
  uiColor: string
  isAnyMenuOpen: boolean
}

export default function ChannelManager({
  currentChannel,
  videoSettings,
  channelFolders,
  enabledChannels,
  channelNames,
  onChannelChange,
  menuColor,
  uiColor,
  isAnyMenuOpen,
}: ChannelManagerProps) {
  const [loadedChannels, setLoadedChannels] = useState<number[]>([])
  const [isEmulationStationLoaded, setIsEmulationStationLoaded] = useState(false)
  const { audioSettings } = useAudio()

  useEffect(() => {
    if (!loadedChannels.includes(currentChannel)) {
      setLoadedChannels(prev => [...prev, currentChannel])
    }
  }, [currentChannel, loadedChannels])

  useEffect(() => {
    if (currentChannel === 3 || loadedChannels.includes(3)) {
      setIsEmulationStationLoaded(true)
    }
  }, [currentChannel, loadedChannels])

  return (
    <div className="w-full h-full relative overflow-hidden">
      {loadedChannels.map(channel => (
        <div key={channel} className="absolute inset-0" style={{ display: channel === currentChannel ? 'block' : 'none' }}>
          {channel === 4 ? (
            <TVGuide
              menuColor={menuColor}
              uiColor={uiColor}
              enabledChannels={enabledChannels}
              channelNames={channelNames}
              onChannelChange={onChannelChange}
              videoSettings={videoSettings}
              isAnyMenuOpen={isAnyMenuOpen}
              channelFolders={channelFolders}
              audioSettings={audioSettings}
            />
          ) : channel === 44 ? (
            <MusicVisualizer 
              playlist={channelFolders[44]?.morning || []}
              isCurrentChannel={currentChannel === 44}
              isMuted={audioSettings.isMuted}
              volume={audioSettings.volume / 100}
              currentTime={new Date()}
              hasCustomContent={channelFolders[44]?.morning?.length > 0}
              className="w-full h-full"
              isPreview={false}
            />
          ) : (
            <Channel
              channel={channel}
              videoSettings={videoSettings}
              folderContent={channelFolders[channel] || {
                morning: [],
                evening: [],
                night: [],
                commercials: [],
                intros: [],
                outros: []
              }}
              isCurrentChannel={channel === currentChannel}
              audioSettings={audioSettings}
            />
          )}
        </div>
      ))}
      {isEmulationStationLoaded && (
        <div className="absolute inset-0" style={{ display: currentChannel === 3 ? 'block' : 'none' }}>
          <EmulationStation isActive={currentChannel === 3} uiColor={uiColor} isPreview={false} />
        </div>
      )}
    </div>
  );
}
