'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { VideoSettingsType, SystemSettingsType, FolderSelection, ChannelData } from '../types'
import { DEFAULT_SETTINGS, TOTAL_CHANNELS, FIRST_CHANNEL, LAST_CHANNEL } from '../constants'
import useKeyboardControls from '../hooks/useKeyboardControls'
import debounce from 'lodash-es/debounce';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage'
import ChannelManager from '../components/ChannelManager'
import { AudioProvider, useAudio } from '../contexts/AudioContext'

const LoadingScreen = dynamic(() => import('../components/LoadingScreen'))
const ChannelDisplay = dynamic(() => import('../components/ChannelDisplay'), { ssr: false })
const VolumeDisplay = dynamic(() => import('../components/VolumeDisplay'), { ssr: false })
const ControlsMenu = dynamic(() => import('../components/ControlsMenu'), { ssr: false })
const BlankMenu = dynamic(() => import('../components/BlankMenu'), { ssr: false })
const ExitConfirmation = dynamic(() => import('../components/ExitConfirmation'), { ssr: false })
const MuteDisplay = dynamic(() => import('../components/MuteDisplay'), { ssr: false })
const EmulationStation = dynamic(() => import('../components/EmulationStation'), { ssr: false })

function HomeContent() {
  const { audioSettings, setAudioSettings, toggleMute, changeVolume } = useAudio();
  const [isLoading, setIsLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showBlankMenu, setShowBlankMenu] = useState(false)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [channel, setChannel] = useState(4)
  const [showChannel, setShowChannel] = useState(false) 
  const [showVolume, setShowVolume] = useState(false)
  const [showMute, setShowMute] = useState(false)
  const [enabledChannels, setEnabledChannels] = useState<Set<number>>(
    new Set(Array.from({ length: LAST_CHANNEL - FIRST_CHANNEL + 1 }, (_, i) => i + FIRST_CHANNEL))
  )
  const [videoSettings, setVideoSettings] = useState<VideoSettingsType>(DEFAULT_SETTINGS.video)
  const [systemSettings, setSystemSettings] = useState<SystemSettingsType>(() => ({
    ...DEFAULT_SETTINGS.system,
    startOnPCBoot: loadFromLocalStorage('startOnPCBoot', false)
  }))
  const [channelFolders, setChannelFolders] = useState<Record<number, FolderSelection>>({})
  const [menuColor, setMenuColor] = useState(() => loadFromLocalStorage('menuColor', 'blue'))
  const [uiColor, setUiColor] = useState(() => loadFromLocalStorage('uiColor', 'green'))
  const [isChangingChannel, setIsChangingChannel] = useState(false)
  const [channelNames, setChannelNames] = useState<Record<number, string>>({})
  const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false)
  const [channelInput, setChannelInput] = useState<string>('')
  const [showChannelInput, setShowChannelInput] = useState(false)
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [isVideoPlayerButtonSelected, setIsVideoPlayerButtonSelected] = useState(true)

  const volumeDisplayTimeout = useRef<NodeJS.Timeout | null>(null);
  const muteDisplayTimeout = useRef<NodeJS.Timeout | null>(null);
  const channelInputTimeout = useRef<NodeJS.Timeout | null>(null);

  const channelFoldersRef = useRef(channelFolders)

  useEffect(() => {
    channelFoldersRef.current = channelFolders
  }, [channelFolders])

  const changeChannel = useCallback((delta: number, directChannel?: number) => {
    setIsChangingChannel(true)
    setShowChannel(false) 
    setChannel(prev => {
      let newChannel: number
      if (directChannel !== undefined) {
        newChannel = directChannel
      } else {
        newChannel = ((prev - FIRST_CHANNEL + delta + (LAST_CHANNEL - FIRST_CHANNEL + 1)) % (LAST_CHANNEL - FIRST_CHANNEL + 1)) + FIRST_CHANNEL
      }
      
      while (!enabledChannels.has(newChannel) && newChannel !== FIRST_CHANNEL && newChannel !== 4 && newChannel !== 5 && newChannel !== 6 && newChannel !== prev) {
        newChannel = ((newChannel - FIRST_CHANNEL + delta + (LAST_CHANNEL - FIRST_CHANNEL + 1)) % (LAST_CHANNEL - FIRST_CHANNEL + 1)) + FIRST_CHANNEL
      }

      if (enabledChannels.has(newChannel) || newChannel === FIRST_CHANNEL || newChannel === 4 || newChannel === 5 || newChannel === 6) {
        return newChannel
      }
      return prev
    })

    setTimeout(() => {
      setIsChangingChannel(false)
      setShowChannel(true) 

      setTimeout(() => {
        setShowChannel(false)
      }, 3000)
    }, 700)
  }, [enabledChannels])

  const debouncedSetShowVolume = useCallback(
    debounce((show: boolean) => setShowVolume(show), 100),
    []
  );

  const handleChangeVolume = useCallback((delta: number) => {
    if (!audioSettings.isMuted) {
      changeVolume(delta);
      debouncedSetShowVolume(true);
      if (volumeDisplayTimeout.current !== null) {
        clearTimeout(volumeDisplayTimeout.current);
      }
      volumeDisplayTimeout.current = setTimeout(() => debouncedSetShowVolume(false), 3000);
    } else {
      setShowMute(true);
      if (muteDisplayTimeout.current !== null) {
        clearTimeout(muteDisplayTimeout.current);
      }
      muteDisplayTimeout.current = setTimeout(() => setShowMute(false), 3000);
    }
  }, [audioSettings.isMuted, changeVolume, debouncedSetShowVolume]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
    setShowMute(true);
    setTimeout(() => setShowMute(false), 3000);
  }, [toggleMute]);

  const toggleControlsMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const closeAllMenus = () => {
    setShowBlankMenu(false);
    setShowMenu(false);
    setShowExitConfirmation(false);
  };

  const clearChannelInput = useCallback(() => {
    setChannelInput('')
    setShowChannelInput(false)
    if (channelInputTimeout.current) {
      clearTimeout(channelInputTimeout.current)
    }
  }, [])

  const handleChannelInput = useCallback((input: string) => {
    setChannelInput(prev => {
      const newInput = (prev + input).slice(-2)  
      setShowChannelInput(true)
      
      if (channelInputTimeout.current) {
        clearTimeout(channelInputTimeout.current)
      }

      channelInputTimeout.current = setTimeout(() => {
        const channelNumber = parseInt(newInput, 10)
        if (channelNumber >= 3 && channelNumber <= 44) {
          changeChannel(0, channelNumber)
        }
        clearChannelInput()
      }, newInput.length === 2 ? 300 : 700)

      return newInput
    })
  }, [changeChannel, clearChannelInput])

  useKeyboardControls({
    changeChannel,
    changeVolume: handleChangeVolume,
    toggleMute: handleToggleMute,
    setShowBlankMenu,
    setShowExitConfirmation,
    toggleControlsMenu,
    audioSettings,
    isAnyMenuOpen,
    systemSettings,
    handleChannelInput,
    clearChannelInput,
    isVideoPlayerButtonSelected,
    setIsVideoPlayerButtonSelected
  })

  const handleExit = useCallback(() => {
    if (window.electron) {
      window.electron.ipcRenderer.send('app-exit', {});
    } else {
      console.log("Exiting the application");
    }
  }, []);

  const handleChannelToggle = useCallback((channel: number, isEnabled: boolean) => {
    setEnabledChannels(prev => {
      const newSet = new Set(prev)
      if (isEnabled) {
        newSet.add(channel)
      } else {
        newSet.delete(channel)
      }
      return newSet
    })
    setChannels(prev => prev.map(ch => 
      ch.id === channel ? { ...ch, isEnabled } : ch
    ))
  }, [])

  const handleVideoSettingsChange = (newSettings: VideoSettingsType) => {
    setVideoSettings(newSettings)
    saveToLocalStorage('videoSettings', newSettings)
  }

  const handleFoldersChange = useCallback((channel: number, folders: FolderSelection) => {
    setChannelFolders(prev => {
      const updated = { ...prev, [channel]: folders };
      saveToLocalStorage('channelFolders', updated);
      return updated;
    });
  }, []);

  const handleThemeChange = (newMenuColor: string, newUiColor: string) => {
    setMenuColor(newMenuColor)
    setUiColor(newUiColor)
    saveToLocalStorage('menuColor', newMenuColor)
    saveToLocalStorage('uiColor', newUiColor)
  }

  const handleSystemSettingsChange = (newSettings: SystemSettingsType) => {
    setSystemSettings(newSettings)
    saveToLocalStorage('systemSettings', newSettings)
    saveToLocalStorage('startOnPCBoot', newSettings.startOnPCBoot)
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
    if (systemSettings.showControlsOnStart) {
      setShowMenu(true)
    }
  }

  const handleReset = () => {
    setVideoSettings(DEFAULT_SETTINGS.video)
    setSystemSettings(DEFAULT_SETTINGS.system)
    setEnabledChannels(new Set(Array.from({ length: LAST_CHANNEL - FIRST_CHANNEL + 1 }, (_, i) => i + FIRST_CHANNEL)))
    setChannelFolders({})
    setMenuColor('blue')
    setUiColor('green')
    setChannelNames({})
    
    localStorage.clear()
  }

  const handleChannelNameChange = (channelNumber: number, newName: string) => {
    setChannelNames(prev => {
      const updated = { ...prev, [channelNumber]: newName }
      saveToLocalStorage('channelNames', updated)
      return updated
    })
  }

  useEffect(() => {
    const menuOpen = showMenu || showBlankMenu || showExitConfirmation;
    setIsAnyMenuOpen(menuOpen);
  }, [showMenu, showBlankMenu, showExitConfirmation]);

  useEffect(() => {
    setVideoSettings(loadFromLocalStorage('videoSettings', DEFAULT_SETTINGS.video))
    const loadedSystemSettings = loadFromLocalStorage('systemSettings', DEFAULT_SETTINGS.system);
    setSystemSettings(loadedSystemSettings);
    if (loadedSystemSettings.showControlsOnStart) {
      setShowMenu(true);
    }
    setMenuColor(loadFromLocalStorage('menuColor', 'blue'))
    setUiColor(loadFromLocalStorage('uiColor', 'green'))
    setChannelNames(loadFromLocalStorage('channelNames', {}))
    setChannelFolders(loadFromLocalStorage('channelFolders', {}));
    setEnabledChannels(new Set(loadFromLocalStorage('enabledChannels', Array.from({ length: LAST_CHANNEL - FIRST_CHANNEL + 1 }, (_, i) => i + FIRST_CHANNEL))))
  }, []);

  useEffect(() => {
    saveToLocalStorage('menuColor', menuColor)
    saveToLocalStorage('uiColor', uiColor)
  }, [menuColor, uiColor])

  useEffect(() => {
    return () => {
      if (volumeDisplayTimeout.current) clearTimeout(volumeDisplayTimeout.current);
      if (muteDisplayTimeout.current) clearTimeout(muteDisplayTimeout.current);
      if (channelInputTimeout.current) clearTimeout(channelInputTimeout.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.pointerEvents = 'none';
    const rootDiv = document.getElementById('__next');
    if (rootDiv) {
      rootDiv.style.pointerEvents = 'auto';
    }

    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, []);

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
        channelName = '05 Video Player' 
        showName = 'Video Player'
      } else if (channelNumber === 6) {
        channelName = '06'
        showName = 'No Content'
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

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />
  }

  return (
    <main className="w-full h-screen relative bg-black overflow-hidden focus:outline-none" tabIndex={-1}>
      {isChangingChannel ? (
        <div className="absolute inset-0 bg-black z-50" />
      ) : (
        <div className="w-full h-full">
          <ChannelManager
            currentChannel={channel}
            videoSettings={videoSettings}
            channelFolders={channelFolders}
            enabledChannels={enabledChannels}
            channelNames={channelNames}
            onChannelChange={(newChannel) => changeChannel(0, newChannel)}
            menuColor={menuColor}
            uiColor={uiColor}
            isAnyMenuOpen={isAnyMenuOpen}
            audioSettings={{
              isMuted: audioSettings.isMuted || isAnyMenuOpen,
              volume: audioSettings.volume / 100,
              isStereo: audioSettings.isStereo
            }}
            isVideoPlayerButtonSelected={isVideoPlayerButtonSelected}
            setIsVideoPlayerButtonSelected={setIsVideoPlayerButtonSelected}
          />
        </div>
      )}
      {showMenu && (
        <ControlsMenu 
          onClose={() => {
            setShowMenu(false)
          }} 
          menuColor={menuColor}
          uiColor={uiColor}
        />
      )}
      {showBlankMenu && (
        <BlankMenu 
          onClose={closeAllMenus}
          onChannelToggle={handleChannelToggle}
          enabledChannels={enabledChannels}
          onVideoSettingsChange={handleVideoSettingsChange}
          videoSettings={videoSettings}
          onAudioSettingsChange={setAudioSettings}
          audioSettings={audioSettings}
          onFoldersChange={handleFoldersChange}
          channelFolders={channelFolders}
          onThemeChange={handleThemeChange}
          menuColor={menuColor}
          uiColor={uiColor}
          onSystemSettingsChange={handleSystemSettingsChange}
          systemSettings={systemSettings}
          onExit={() => setShowExitConfirmation(true)}
          onReset={handleReset}
          onChannelNameChange={handleChannelNameChange}
          channelNames={channelNames}
          showBlankMenu={showBlankMenu}
          TOTAL_CHANNELS={TOTAL_CHANNELS}
          FIRST_CHANNEL={FIRST_CHANNEL}
          LAST_CHANNEL={LAST_CHANNEL}
        />
      )}
      {showExitConfirmation && (
        <ExitConfirmation 
          onConfirm={handleExit} 
          menuColor={menuColor} 
          uiColor={uiColor} 
          title="Exit Confirmation"
          message="Are you sure you want to exit the application?"
        />
      )}
      {<ChannelDisplay 
        channel={channel} 
        uiColor={uiColor} 
        isVisible={showChannel || showChannelInput} 
        channelInput={channelInput}
      />}
      {showMute && <MuteDisplay isMuted={audioSettings.isMuted} uiColor={uiColor} />}
      {showVolume && <VolumeDisplay volume={audioSettings.volume} uiColor={uiColor} isMuted={audioSettings.isMuted} />}
    </main>
  )
}

export default function Page() {
  return (
    <AudioProvider>
      <div className="w-full h-screen relative bg-black overflow-hidden focus:outline-none" tabIndex={-1}>
        <HomeContent />
      </div>
    </AudioProvider>
  )
}
