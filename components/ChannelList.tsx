'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'

interface ChannelListProps {
  onChannelSelect: (channel: number) => void
  onChannelToggle: (channel: number, isEnabled: boolean) => void
  initialEnabledChannels: Set<number>
  channelNames: Record<number, string>
  selectedItemIndex: number
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number>>
  uiColor: string
  isInTabContent: boolean
  TOTAL_CHANNELS: number
  FIRST_CHANNEL: number
  LAST_CHANNEL: number
  startChannel: number
}

export default function ChannelList({ 
  onChannelSelect, 
  onChannelToggle,
  initialEnabledChannels, 
  channelNames, 
  selectedItemIndex, 
  setSelectedItemIndex,
  uiColor, 
  isInTabContent,
  TOTAL_CHANNELS,
  FIRST_CHANNEL,
  LAST_CHANNEL,
  startChannel
}: ChannelListProps) {
  const [enabledChannels, setEnabledChannels] = useState<Set<number>>(initialEnabledChannels)

  useEffect(() => {
    setEnabledChannels(initialEnabledChannels)
  }, [initialEnabledChannels])

  const toggleChannel = (channel: number) => {
    const newSet = new Set(enabledChannels)
    if (newSet.has(channel)) {
      newSet.delete(channel)
    } else {
      newSet.add(channel)
    }
    setEnabledChannels(newSet)
    onChannelToggle(channel, newSet.has(channel))
  }

  const isChannelClickable = (channel: number) => {
    return channel >= 5 && channel <= 44 && enabledChannels.has(channel);
  };

  const visibleChannels = useMemo(() => {
    const channelsPerPage = 24 // 4 columns * 6 rows
    return Array.from({ length: channelsPerPage }, (_, i) => {
      let channel = i + startChannel
      return channel >= 5 && channel <= 44 ? channel : null
    }).filter((channel): channel is number => channel !== null)
  }, [startChannel])

  const handleChannelSelect = (channel: number, index: number) => {
    setSelectedItemIndex(index);
    onChannelSelect(channel);
  }

  return (
    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
      <h2 className="text-lg font-bold mb-2 px-2">Channels</h2>
      <div className="grid grid-cols-4 gap-2 p-2">
        {visibleChannels.map((channel, index) => (
          <div key={`channel-${channel}`} className={`flex items-center ${selectedItemIndex === index && isInTabContent ? `ring-2 ring-${uiColor}-500 ring-opacity-100 shadow-lg shadow-${uiColor}-500/50` : ''}`}>
            <Button
              className={`mr-1 text-xs text-white cursor-pointer ${isChannelClickable(channel) ? '' : 'opacity-50'}`}
              onClick={() => handleChannelSelect(channel, index)}
              disabled={!isChannelClickable(channel)}
            >
              {channelNames[channel] || `Ch ${channel.toString().padStart(2, '0')}`}
            </Button>
            <div
              className={`w-3 h-3 rounded-full ${enabledChannels.has(channel) ? 'bg-green-500' : 'bg-red-500'}`}
              aria-label={`Channel ${channel} ${enabledChannels.has(channel) ? 'enabled' : 'disabled'}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

