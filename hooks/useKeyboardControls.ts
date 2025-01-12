import { useEffect, useCallback } from 'react'
import { AudioSettingsType, SystemSettingsType } from '../types'

interface KeyboardControlsProps {
  changeChannel: (delta: number, directChannel?: number) => void
  changeVolume: (delta: number) => void
  toggleMute: () => void
  setShowBlankMenu: React.Dispatch<React.SetStateAction<boolean>>
  setShowExitConfirmation: React.Dispatch<React.SetStateAction<boolean>>
  toggleControlsMenu: () => void
  audioSettings: AudioSettingsType
  isAnyMenuOpen: boolean
  systemSettings: SystemSettingsType
  handleChannelInput: (input: string) => void
  clearChannelInput: () => void
}

export default function useKeyboardControls({
  changeChannel,
  changeVolume,
  toggleMute,
  setShowBlankMenu,
  setShowExitConfirmation,
  toggleControlsMenu,
  audioSettings,
  isAnyMenuOpen,
  systemSettings,
  handleChannelInput,
  clearChannelInput
}: KeyboardControlsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyMenuOpen) {
        // Only allow Escape key when menus are open
        if (e.key === 'Escape') {
          e.preventDefault()
          setShowExitConfirmation(true)
        }
        return
      }

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault()
          setShowBlankMenu(prev => !prev)
          break
        case 'escape':
          e.preventDefault()
          clearChannelInput()
          setShowExitConfirmation(true)
          break
        case 'g':
          e.preventDefault()
          changeChannel(0, 4)
          break
        case 'c':
          e.preventDefault()
          toggleControlsMenu()
          break
        case 'arrowup':
          e.preventDefault()
          changeChannel(1)
          break
        case 'arrowdown':
          e.preventDefault()
          changeChannel(-1)
          break
        case 'arrowleft':
        case 'arrowright':
          e.preventDefault()
          if (!audioSettings.isMuted) {
            changeVolume(e.key.toLowerCase() === 'arrowright' ? 1 : -1)
          } else {
            toggleMute()
          }
          break
        case 'n':
          e.preventDefault()
          toggleMute()
          break
        default:
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault()
            handleChannelInput(e.key)
          }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    changeChannel,
    changeVolume,
    toggleMute,
    setShowBlankMenu,
    setShowExitConfirmation,
    toggleControlsMenu,
    audioSettings.isMuted,
    isAnyMenuOpen,
    handleChannelInput,
    clearChannelInput
  ])
}

