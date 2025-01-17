'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import ChannelList from './ChannelList'
import ChannelScheduling from './ChannelScheduling'
import VideoSettings, { VideoSettingsType } from './VideoSettings'
import ThemeSettings from './ThemeSettings'
import SystemSettings, { SystemSettingsType } from './SystemSettings'
import ExitConfirmation from './ExitConfirmation'
import AudioSettings, { AudioSettingsType } from './AudioSettings'
import FixedCloseButton from './FixedCloseButton'
import BlackScreen from './BlackScreen'
import { Silkscreen } from 'next/font/google'

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] })

interface FolderSelection {
  morning: string[];
  evening: string[];
  night: string[];
  commercials: string[];
  intros: string[];
  outros: string[];
}

interface BlankMenuProps {
  onClose: () => void
  onChannelToggle: (channel: number, isEnabled: boolean) => void
  enabledChannels: Set<number>
  onVideoSettingsChange: (settings: VideoSettingsType) => void
  videoSettings: VideoSettingsType
  onFoldersChange: (channel: number, folders: FolderSelection) => void
  channelFolders: Record<number, FolderSelection>
  onThemeChange: (menuColor: string, uiColor: string) => void
  menuColor: string
  uiColor: string
  onSystemSettingsChange: (settings: SystemSettingsType) => void
  systemSettings: SystemSettingsType
  onExit: () => void
  onAudioSettingsChange: (settings: AudioSettingsType) => void
  audioSettings: AudioSettingsType
  onChannelNameChange: (channel: number, name: string) => void;
  channelNames: Record<number, string>;
  showBlankMenu: boolean;
  TOTAL_CHANNELS: number;
  FIRST_CHANNEL: number;
  LAST_CHANNEL: number;
  onReset: () => void;
}

export default function BlankMenu({
  onClose,
  onChannelToggle,
  enabledChannels,
  onVideoSettingsChange,
  videoSettings,
  onFoldersChange,
  channelFolders,
  onThemeChange,
  menuColor,
  uiColor,
  onSystemSettingsChange,
  systemSettings,
  onExit,
  onAudioSettingsChange,
  audioSettings,
  onChannelNameChange,
  channelNames,
  showBlankMenu,
  TOTAL_CHANNELS,
  FIRST_CHANNEL,
  LAST_CHANNEL,
  onReset
}: BlankMenuProps) {
  const [activeTab, setActiveTab] = useState('System')
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1)
  const [currentLayer, setCurrentLayer] = useState(1)
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [isCloseButtonSelected, setIsCloseButtonSelected] = useState(false)
  const [channelListIndex, setChannelListIndex] = useState(0)
  const [startChannel, setStartChannel] = useState(FIRST_CHANNEL)
  const [showBlackScreen, setShowBlackScreen] = useState(false)

  const tabs = useMemo(() => ['System', 'Channels', 'Video', 'Audio', 'Theme'], [])

  const handleBackToChannels = useCallback(() => {
    setSelectedChannel(null)
    setCurrentLayer(2)
  }, [])

  const handleChannelSelect = useCallback((channel: number) => {
    if (channel >= FIRST_CHANNEL && channel <= LAST_CHANNEL) {
      setSelectedChannel(channel)
      setCurrentLayer(3)
      setSelectedItemIndex(0)
    }
  }, [FIRST_CHANNEL, LAST_CHANNEL])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    switch (e.key.toLowerCase()) {
      case 'w':
        if (currentLayer === 1) {
          if (isCloseButtonSelected) {
            setIsCloseButtonSelected(false)
          }
        } else if (currentLayer === 2) {
          if (activeTab === 'Channels') {
            if (channelListIndex > 0) {
              setChannelListIndex(prev => prev - 1)
            } else if (startChannel > FIRST_CHANNEL) { 
              setStartChannel(prev => Math.max(prev - 1, FIRST_CHANNEL))
            } else {
              setCurrentLayer(1)
              setSelectedItemIndex(-1)
              setChannelListIndex(0)
              setStartChannel(FIRST_CHANNEL) 
            }
          } else if (activeTab === 'System') {
            if (selectedItemIndex > 0) {
              setSelectedItemIndex(prev => prev - 1)
            } else {
              setCurrentLayer(1)
              setSelectedItemIndex(-1)
            }
          } else {
            setSelectedItemIndex((prev) => (prev > 0 ? prev - 1 : 0))
          }
        } else if (currentLayer === 3) {
          setSelectedItemIndex((prev) => (prev > 0 ? prev - 1 : 0))
        }
        break
      case 's':
        if (currentLayer === 1) {
          if (!isCloseButtonSelected) {
            setIsCloseButtonSelected(true)
          }
        } else if (currentLayer === 2) {
          if (activeTab === 'Channels') {
            if (channelListIndex < 23) {
              setChannelListIndex(prev => prev + 1)
            } else if (startChannel + 23 < LAST_CHANNEL) { 
              setStartChannel(prev => Math.min(prev + 1, LAST_CHANNEL - 23)) 
            }
          } else if (activeTab === 'System') {
            setSelectedItemIndex((prev) => (prev < 5 ? prev + 1 : 5))
          } else {
            setSelectedItemIndex((prev) => prev + 1)
          }
        } else if (currentLayer === 3) {
          setSelectedItemIndex((prev) => prev + 1)
        }
        break
      case 'a':
        if (currentLayer === 1 && !isCloseButtonSelected) {
          setSelectedTabIndex((prev) => (prev > 0 ? prev - 1 : tabs.length - 1))
        }
        break
      case 'd':
        if (currentLayer === 1 && !isCloseButtonSelected) {
          setSelectedTabIndex((prev) => (prev < tabs.length - 1 ? prev + 1 : 0))
        }
        break
      case 'enter':
        if (currentLayer === 1) {
          if (isCloseButtonSelected) {
            onClose()
          } else {
            setCurrentLayer(2)
            setSelectedItemIndex(0)
            setActiveTab(tabs[selectedTabIndex])
            if (tabs[selectedTabIndex] === 'Channels') {
              setChannelListIndex(0)
              setStartChannel(FIRST_CHANNEL) 
            }
          }
        } else if (currentLayer === 2 && activeTab === 'Channels') {
          const selectedChannelNumber = startChannel + channelListIndex;
          handleChannelSelect(selectedChannelNumber)
        }
        break
      case 'escape':
        if (currentLayer === 3) {
          handleBackToChannels()
        } else if (currentLayer === 2) {
          setCurrentLayer(1)
          setSelectedItemIndex(-1)
          setChannelListIndex(0)
          setStartChannel(FIRST_CHANNEL) 
        } else {
          onClose()
        }
        break
    }
  }, [currentLayer, isCloseButtonSelected, selectedTabIndex, tabs, activeTab, selectedItemIndex, onClose, handleChannelSelect, handleBackToChannels, channelListIndex, TOTAL_CHANNELS, startChannel, FIRST_CHANNEL, LAST_CHANNEL])

  useEffect(() => {
    if (showBlankMenu) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, showBlankMenu])

  useEffect(() => {
    setActiveTab(tabs[selectedTabIndex])
    if (currentLayer === 1) {
      setSelectedItemIndex(-1)
    }
  }, [selectedTabIndex, tabs, currentLayer])

  const renderActiveTab = useMemo(() => {
    switch (activeTab) {
      case 'System':
        return (
          <SystemSettings
            settings={systemSettings}
            onSettingsChange={onSystemSettingsChange}
            onExit={() => setShowExitConfirmation(true)}
            onReset={onReset}
            menuColor={menuColor}
            selectedItemIndex={selectedItemIndex}
            uiColor={uiColor}
            isInTabContent={currentLayer === 2}
            setSelectedItemIndex={setSelectedItemIndex}
          />
        )
      case 'Channels':
        return currentLayer === 3 && selectedChannel && selectedChannel >= FIRST_CHANNEL && selectedChannel <= LAST_CHANNEL ? (
          <ChannelScheduling 
            channel={selectedChannel} 
            onBack={handleBackToChannels} 
            onFoldersChange={(folders) => onFoldersChange(selectedChannel, folders)}
            initialFolders={channelFolders[selectedChannel] || {
              morning: [],
              evening: [],
              night: [],
              commercials: [],
              intros: [],
              outros: []
            }}
            onChannelNameChange={onChannelNameChange}
            initialChannelName={channelNames[selectedChannel] || `Channel ${selectedChannel.toString().padStart(2, '0')}`}
            menuColor={menuColor}
            onChannelToggle={onChannelToggle}
            isChannelEnabled={enabledChannels.has(selectedChannel)}
            uiColor={uiColor}
            selectedItemIndex={selectedItemIndex}
            isInTabContent={currentLayer === 3}
            setSelectedItemIndex={setSelectedItemIndex}
          />
        ) : (
          <ChannelList 
            onChannelSelect={handleChannelSelect} 
            onChannelToggle={onChannelToggle}
            initialEnabledChannels={enabledChannels}
            channelNames={channelNames}
            selectedItemIndex={channelListIndex}
            setSelectedItemIndex={setSelectedItemIndex}
            uiColor={uiColor}
            isInTabContent={currentLayer === 2}
            TOTAL_CHANNELS={TOTAL_CHANNELS}
            FIRST_CHANNEL={FIRST_CHANNEL}
            LAST_CHANNEL={LAST_CHANNEL}
            startChannel={startChannel}
          />
        )
      case 'Video':
        return (
          <VideoSettings
            onSettingsChange={onVideoSettingsChange}
            initialSettings={videoSettings}
            selectedItemIndex={selectedItemIndex}
            setSelectedItemIndex={setSelectedItemIndex}
            uiColor={uiColor}
            menuColor={menuColor}
            isInTabContent={currentLayer === 2}
            onExitTab={() => {
              setCurrentLayer(1);
              setSelectedItemIndex(-1);
            }}
          />
        )
      case 'Audio':
        return (
          <AudioSettings
            onSettingsChange={onAudioSettingsChange}
            initialSettings={audioSettings}
            selectedItemIndex={selectedItemIndex}
            uiColor={uiColor}
            menuColor={menuColor}
            isInTabContent={currentLayer === 2}
            onExitTab={() => {
              setCurrentLayer(1);
              setSelectedItemIndex(-1);
            }}
            setSelectedItemIndex={setSelectedItemIndex}
          />
        )
      case 'Theme':
        return (
          <ThemeSettings
            onThemeChange={onThemeChange}
            initialMenuColor={menuColor}
            initialUiColor={uiColor}
            selectedItemIndex={selectedItemIndex}
            isInTabContent={currentLayer === 2}
            onExitTab={() => {
              setCurrentLayer(1);
              setSelectedItemIndex(-1);
            }}
          />
        )
      default:
        return null
    }
  }, [
    activeTab,
    currentLayer,
    selectedChannel,
    handleBackToChannels,
    onClose,
    onFoldersChange,
    channelFolders,
    onChannelNameChange,
    channelNames,
    menuColor,
    onChannelToggle,
    enabledChannels,
    uiColor,
    selectedItemIndex,
    setSelectedItemIndex,
    handleChannelSelect,
    channelListIndex,
    TOTAL_CHANNELS,
    FIRST_CHANNEL,
    LAST_CHANNEL,
    startChannel
  ])

  const handleExit = () => {
    setShowBlackScreen(true);
    // You might want to add a timeout here to simulate the program closing
    // setTimeout(() => {
    //   // Add any cleanup or actual exit logic here
    // }, 2000);
  };

  return (
    <>
      {showBlackScreen ? (
        <BlackScreen />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50`}>
          <div className={`bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-500 bg-opacity-30 text-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-100 p-8 pb-16 font-mono text-lg border-2 border-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-300 shadow-lg shadow-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-400/50 w-4/5 h-4/5 max-w-4xl max-h-[800px] relative focus:outline-none`} tabIndex={-1}>
            <h2 className={`${silkscreen.className} text-4xl mb-8 text-center font-bold text-yellow-300`} style={{ textShadow: '0 0 10px rgba(234, 179, 8, 0.5)' }}>
              Menu
            </h2>

            <div className="flex mb-6">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`px-4 py-2 mr-2 rounded-t-lg transition-colors duration-200 ${
                    index === selectedTabIndex && currentLayer === 1 && !isCloseButtonSelected
                      ? `bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-600 text-white ring-2 ring-${uiColor === 'blue' ? 'blue' : uiColor === 'green' ? 'green' : uiColor === 'red' ? 'red' : uiColor === 'pink' ? 'pink' : uiColor === 'purple' ? 'purple' : uiColor === 'yellow' ? 'yellow' : 'orange'}-400 shadow-lg shadow-${uiColor === 'blue' ? 'blue' : uiColor === 'green' ? 'green' : uiColor === 'red' ? 'red' : uiColor === 'pink' ? 'pink' : uiColor === 'purple' ? 'purple' : uiColor === 'yellow' ? 'yellow' : 'orange'}-400/50`
                      : `bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-400 bg-opacity-50 hover:bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-500`
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={`bg-${menuColor === 'blue' ? 'blue' : menuColor === 'green' ? 'green' : menuColor === 'red' ? 'red' : menuColor === 'pink' ? 'pink' : menuColor === 'purple' ? 'purple' : menuColor === 'yellow' ? 'yellow' : 'orange'}-600 bg-opacity-30 p-6 rounded-lg h-[calc(100%-180px)] overflow-hidden`}>
              {renderActiveTab}
            </div>

            <FixedCloseButton
              onClose={onClose}
              menuColor={menuColor}
              uiColor={uiColor}
              isSelected={isCloseButtonSelected && currentLayer === 1}
            />

            {showExitConfirmation && (
              <ExitConfirmation 
                onConfirm={(confirm) => {
                  if (confirm) {
                    handleExit();
                  }
                  setShowExitConfirmation(false);
                }} 
                menuColor={menuColor} 
                uiColor={uiColor}
                title="Exit Program"
                message="Are you sure you want to exit the program?"
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

