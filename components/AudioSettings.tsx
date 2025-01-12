'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

export interface AudioSettingsType {
  volume: number
  isMuted: boolean
  isStereo: boolean
}

interface AudioSettingsProps {
  onSettingsChange: (settings: AudioSettingsType) => void
  initialSettings: AudioSettingsType
  selectedItemIndex: number
  uiColor: string
  isInTabContent: boolean
  onExitTab?: () => void
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number>>
  menuColor: string
}

export default function AudioSettings({ 
  onSettingsChange, 
  initialSettings, 
  selectedItemIndex, 
  uiColor, 
  isInTabContent, 
  onExitTab, 
  setSelectedItemIndex,
  menuColor
}: AudioSettingsProps) {
  const [settings, setSettings] = useState<AudioSettingsType>(initialSettings)

  useEffect(() => {
    const savedSettings = localStorage.getItem('audioSettings')
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      setSettings(parsedSettings)
      onSettingsChange(parsedSettings)
    }
  }, [])

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const handleSettingChange = (setting: keyof AudioSettingsType, value: number | boolean) => {
    const newSettings = { ...settings, [setting]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
    localStorage.setItem('audioSettings', JSON.stringify(newSettings))
  }

  const totalSegments = 32
  const litSegments = Math.floor((settings.volume / 100) * totalSegments)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInTabContent) return

      switch (e.key.toLowerCase()) {
        case 'w':
          e.preventDefault()
          if (selectedItemIndex > 0) {
            setSelectedItemIndex(prev => Math.max(0, prev - 1))
          } else if (selectedItemIndex === 0 && onExitTab) {
            onExitTab()
          }
          break
        case 's':
          e.preventDefault()
          if (selectedItemIndex < 2) {
            setSelectedItemIndex(prev => Math.min(2, prev + 1))
          }
          break
        case 'a':
        case 'd':
          e.preventDefault()
          if (selectedItemIndex === 0) {
            const newVolume = Math.max(0, Math.min(100, settings.volume + (e.key === 'a' ? -1 : 1)))
            handleSettingChange('volume', newVolume)
          }
          break
        case 'enter':
          e.preventDefault()
          if (selectedItemIndex === 1) {
            handleSettingChange('isMuted', !settings.isMuted)
          } else if (selectedItemIndex === 2) {
            handleSettingChange('isStereo', !settings.isStereo)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInTabContent, selectedItemIndex, settings, handleSettingChange, onExitTab, setSelectedItemIndex])

  return (
    <div className={`h-full flex flex-col space-y-4 p-4 bg-${menuColor}-700 bg-opacity-30 rounded-lg overflow-hidden`}>
      <h3 className="text-xl font-bold text-white">Audio Settings</h3>
      
      <div className={`flex-grow flex flex-col space-y-4 overflow-y-auto bg-${menuColor}-600 bg-opacity-50 p-4 rounded-lg`}>
        <div className={`p-3 rounded-lg ${selectedItemIndex === 0 ? `ring-2 ring-${uiColor}-500 ring-opacity-100 shadow-lg shadow-${uiColor}-500/50` : ''}`}>
          <label className="block mb-2 font-bold text-white">Volume: {settings.volume}</label>
          <Slider
            value={[settings.volume]}
            onValueChange={(value) => handleSettingChange('volume', value[0])}
            min={0}
            max={100}
            step={1}
          />
          <div className="mt-2 flex gap-[2px] justify-center w-full">
            {Array.from({ length: totalSegments }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-1 ${
                  index < litSegments ? 'bg-primary' : 'bg-primary/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className={`p-3 rounded-lg ${selectedItemIndex === 1 ? `ring-2 ring-${uiColor}-500 ring-opacity-100 shadow-lg shadow-${uiColor}-500/50` : ''}`}>
          <label className="flex items-center justify-between font-bold text-white">
            <span>Mute</span>
            <Switch
              checked={settings.isMuted}
              onCheckedChange={(checked) => handleSettingChange('isMuted', checked)}
            />
          </label>
        </div>

        <div className={`p-3 rounded-lg ${selectedItemIndex === 2 ? `ring-2 ring-${uiColor}-500 ring-opacity-100 shadow-lg shadow-${uiColor}-500/50` : ''}`}>
          <label className="flex items-center justify-between font-bold text-white">
            <span>Stereo/Mono</span>
            <Switch
              checked={settings.isStereo}
              onCheckedChange={(checked) => handleSettingChange('isStereo', checked)}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

