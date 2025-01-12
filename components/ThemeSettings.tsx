'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage'

interface ThemeSettingsProps {
  onThemeChange: (menuColor: string, uiColor: string) => void
  initialMenuColor: string
  initialUiColor: string
  selectedItemIndex: number
  isInTabContent: boolean
  onExitTab?: () => void
}

const colorOptions = [
  { name: 'Blue', value: 'blue', rgb: '59, 130, 246' },
  { name: 'Green', value: 'green', rgb: '34, 197, 94' },
  { name: 'Red', value: 'red', rgb: '239, 68, 68' },
  { name: 'Pink', value: 'pink', rgb: '236, 72, 153' },
  { name: 'Purple', value: 'purple', rgb: '147, 51, 234' },
  { name: 'Yellow', value: 'yellow', rgb: '234, 179, 8' },
  { name: 'Orange', value: 'orange', rgb: '249, 115, 22' },
]

export default function ThemeSettings({ 
  onThemeChange, 
  initialMenuColor, 
  initialUiColor, 
  selectedItemIndex,
  isInTabContent,
  onExitTab
}: ThemeSettingsProps) {
  const [menuColor, setMenuColor] = useState(initialMenuColor)
  const [uiColor, setUiColor] = useState(initialUiColor)
  const [selectedButton, setSelectedButton] = useState(isInTabContent ? 0 : -1)

  useEffect(() => {
    const savedMenuColor = loadFromLocalStorage('menuColor', initialMenuColor)
    const savedUiColor = loadFromLocalStorage('uiColor', initialUiColor)
    setMenuColor(savedMenuColor)
    setUiColor(savedUiColor)
    onThemeChange(savedMenuColor, savedUiColor)
  }, [initialMenuColor, initialUiColor, onThemeChange])

  const handleMenuColorChange = useCallback((color: string) => {
    setMenuColor(color)
    saveToLocalStorage('menuColor', color)
    onThemeChange(color, uiColor)
  }, [uiColor, onThemeChange])

  const handleUiColorChange = useCallback((color: string) => {
    setUiColor(color)
    saveToLocalStorage('uiColor', color)
    onThemeChange(menuColor, color)
  }, [menuColor, onThemeChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInTabContent) return

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault()
          setSelectedButton(prev => (prev < colorOptions.length * 2 - 1 ? prev + 1 : prev))
          break
        case 'w':
          e.preventDefault()
          if (selectedButton > 0) {
            setSelectedButton(prev => prev - 1)
          } else if (selectedButton === 0) {
            setSelectedButton(-1)
            if (onExitTab) {
              onExitTab()
            }
          }
          break
        case 'enter':
          e.preventDefault()
          const colorIndex = selectedButton % colorOptions.length
          if (selectedButton < colorOptions.length) {
            handleMenuColorChange(colorOptions[colorIndex].value)
          } else {
            handleUiColorChange(colorOptions[colorIndex].value)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInTabContent, selectedButton, handleMenuColorChange, handleUiColorChange, onExitTab])

  useEffect(() => {
    setSelectedButton(isInTabContent ? 0 : -1)
  }, [isInTabContent])

  return (
    <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
      <h3 className="text-xl mb-4">Theme Settings</h3>
      
      <div>
        <label className="block mb-2">Menu Background Color</label>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color, index) => (
            <Button
              key={color.value}
              onClick={() => handleMenuColorChange(color.value)}
              className={`p-2 h-auto text-white font-bold ${
                menuColor === color.value ? 'ring-2 ring-white' : ''
              } ${selectedButton === index ? `ring-2 ring-${color.value}-500 ring-opacity-100 shadow-lg shadow-${color.value}-500/50` : ''}`}
              style={{
                backgroundColor: `rgba(var(--${color.value}-rgb), ${'0.3'})`,
                boxShadow: selectedButton === index 
                  ? `0 0 10px 5px rgba(var(--${color.value}-rgb), 0.5), 0 0 20px 10px rgba(var(--${color.value}-rgb), 0.3)` 
                  : menuColor === color.value 
                    ? `0 0 0 4px rgb(var(--${color.value}-rgb))` 
                    : 'none',
              }}
            >
              {color.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2">UI Color</label>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color, index) => (
            <Button
              key={color.value}
              onClick={() => handleUiColorChange(color.value)}
              className={`p-2 h-auto text-white font-bold ${
                uiColor === color.value ? 'ring-2 ring-white' : ''
              } ${selectedButton === index + colorOptions.length ? `ring-2 ring-${color.value}-500 ring-opacity-100 shadow-lg shadow-${color.value}-500/50` : ''}`}
              style={{
                backgroundColor: `rgb(var(--${color.value}-rgb))`,
                boxShadow: selectedButton === index + colorOptions.length 
                  ? `0 0 10px 5px rgba(var(--${color.value}-rgb), 1.0), 0 0 20px 10px rgba(var(--${color.value}-rgb), 0.7)` 
                  : uiColor === color.value 
                    ? `0 0 0 4px rgba(var(--${color.value}-rgb), 0.5)` 
                    : 'none',
              }}
            >
              {color.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

