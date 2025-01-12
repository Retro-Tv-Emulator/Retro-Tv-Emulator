'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import ScreenAdjustments from './ScreenAdjustments'

export interface VideoSettingsType {
  aspectRatio: '4:3' | '16:9'
  brightness: number
  contrast: number
  sharpness: number
}

interface VideoSettingsProps {
  onSettingsChange: (settings: VideoSettingsType) => void
  initialSettings: VideoSettingsType
  selectedItemIndex: number
  uiColor: string
  menuColor: string
  isInTabContent: boolean
  onExitTab?: () => void
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number>>
}

export default function VideoSettings({
  onSettingsChange,
  initialSettings,
  selectedItemIndex,
  uiColor,
  menuColor,
  isInTabContent,
  onExitTab,
  setSelectedItemIndex
}: VideoSettingsProps) {
  const [settings, setSettings] = useState<VideoSettingsType>(initialSettings)
  const [isScreenAdjustmentsOpen, setIsScreenAdjustmentsOpen] = useState(false)
  const [localSelectedItemIndex, setLocalSelectedItemIndex] = useState(selectedItemIndex);

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  useEffect(() => {
    setLocalSelectedItemIndex(selectedItemIndex);
  }, [selectedItemIndex]);

  const handleSettingChange = (setting: keyof VideoSettingsType, value: number | string) => {
    const newSettings = { ...settings, [setting]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInTabContent) return

      switch (e.key.toLowerCase()) {
        case 'w':
          e.preventDefault()
          if (localSelectedItemIndex > 0) {
            setSelectedItemIndex(prev => prev - 1)
          } else if (onExitTab) {
            onExitTab()
          }
          break
        case 's':
          e.preventDefault()
          if (localSelectedItemIndex < 4) {
            setSelectedItemIndex(prev => prev + 1)
          }
          break
        case 'a':
        case 'd':
          e.preventDefault()
          if (localSelectedItemIndex >= 1 && localSelectedItemIndex <= 3) {
            const setting = ['brightness', 'contrast', 'sharpness'][localSelectedItemIndex - 1] as keyof VideoSettingsType
            const delta = e.key === 'a' ? -1 : 1
            handleSettingChange(setting, Math.max(0, Math.min(100, settings[setting] as number + delta)))
          } else if (localSelectedItemIndex === 0) {
            // Toggle aspect ratio
            const newAspectRatio = settings.aspectRatio === '16:9' ? '4:3' : '16:9'
            handleSettingChange('aspectRatio', newAspectRatio)
          }
          break
        case 'enter':
          e.preventDefault()
          if (localSelectedItemIndex === 0) {
            setIsScreenAdjustmentsOpen(true)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInTabContent, localSelectedItemIndex, settings, handleSettingChange, onExitTab, setSelectedItemIndex])

  if (isScreenAdjustmentsOpen) {
    return (
      <ScreenAdjustments
        onClose={() => setIsScreenAdjustmentsOpen(false)}
        uiColor={uiColor}
        menuColor={menuColor}
      />
    )
  }

  return (
    <div className={`space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto p-4 bg-${menuColor}-700 bg-opacity-30 rounded-lg`}>
      <h3 className="text-xl mb-4 font-bold text-white">Video Settings</h3>

      <div className="flex flex-col space-y-4">
        <div className="flex space-x-2">
          <Button
            className={`flex-1 p-2 text-white rounded transition-colors duration-200 ${
              localSelectedItemIndex === 0
                ? `bg-${uiColor}-500 hover:bg-${uiColor}-600`
                : `bg-blue-500 hover:bg-blue-600`
            }`}
            onClick={() => setIsScreenAdjustmentsOpen(true)}
          >
            <span className="text-base font-semibold">Screen Adjustments</span>
          </Button>

          <Button
            className={`flex-1 p-2 text-white rounded transition-colors duration-200 ${
              localSelectedItemIndex === 1
                ? `bg-${uiColor}-500 hover:bg-${uiColor}-600`
                : `bg-blue-500 hover:bg-blue-600`
            }`}
            onClick={() => handleSettingChange('aspectRatio', settings.aspectRatio === '16:9' ? '4:3' : '16:9')}
          >
            <span className="text-base font-semibold">Aspect Ratio: {settings.aspectRatio}</span>
          </Button>
        </div>

        {['Brightness', 'Contrast', 'Sharpness'].map((setting, index) => (
          <div
            key={setting}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              localSelectedItemIndex === index + 2
                ? `bg-${uiColor}-500`
                : `bg-${menuColor}-600`
            }`}
          >
            <div className="flex items-center justify-between mb-1 text-base font-semibold text-white">
              <label>{setting}:</label>
              <span>{settings[setting.toLowerCase() as keyof VideoSettingsType]}</span>
            </div>
            <Slider
              value={[settings[setting.toLowerCase() as keyof VideoSettingsType] as number]}
              onValueChange={(value) => handleSettingChange(setting.toLowerCase() as keyof VideoSettingsType, value[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

