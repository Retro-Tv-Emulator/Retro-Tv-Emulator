'use client'

import { useState, useEffect } from 'react'
import React from 'react';
import ExitConfirmation from './ExitConfirmation'
import { Button } from '@/components/ui/button'

export interface SystemSettingsType {
  channel3Option: 'default' | 'alwaysLoad' | 'turnOff'
  showControlsOnStart: boolean
  startOnPCBoot: boolean
}

interface SystemSettingsProps {
  settings: SystemSettingsType
  onSettingsChange: (settings: SystemSettingsType) => void
  onExit: () => void
  onReset: () => void
  menuColor: string
  selectedItemIndex: number
  uiColor: string
  isInTabContent: boolean
  setSelectedItemIndex: (index: number) => void
}

const options = [
    { label: 'Default (Channel 3 always active)', value: 'default' },
    { label: 'Channel 3 Loads When Selected', value: 'alwaysLoad' },
    { label: 'Turn Off Channel 3', value: 'turnOff' },
    { label: 'Start the Program When Your PC Starts', value: 'startOnPCBoot' },
    { label: 'Show Controls Menu When Program Starts', value: 'showControls' },
    { value: 'reset' },
    { value: 'exit' },
  ];

export default function SystemSettings({ 
  settings, 
  onSettingsChange, 
  onExit, 
  onReset, 
  menuColor, 
  selectedItemIndex, 
  uiColor, 
  isInTabContent, 
  setSelectedItemIndex 
}: SystemSettingsProps) {
  const [channel3Option, setChannel3Option] = useState(settings.channel3Option)
  const [showControlsOnStart, setShowControlsOnStart] = useState(settings.showControlsOnStart)
  const [startOnPCBoot, setStartOnPCBoot] = useState(settings.startOnPCBoot || false)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const handleOptionChange = (option: SystemSettingsType['channel3Option']) => {
    setChannel3Option(option)
    onSettingsChange({ ...settings, channel3Option: option })
  }

  const handleShowControlsChange = (show: boolean) => {
    setShowControlsOnStart(show)
    onSettingsChange({ ...settings, showControlsOnStart: show })
  }

  const handleStartOnPCBootChange = (start: boolean) => {
    setStartOnPCBoot(start)
    onSettingsChange({ ...settings, startOnPCBoot: start })
  }

  useEffect(() => {
    setChannel3Option(settings.channel3Option)
    setShowControlsOnStart(settings.showControlsOnStart)
    setStartOnPCBoot(settings.startOnPCBoot || false)
  }, [settings])

  const handleOptionSelect = (index: number) => {
    switch (index) {
      case 0:
      case 1:
      case 2:
        handleOptionChange(options[index].value as SystemSettingsType['channel3Option']);
        break;
      case 3:
        handleStartOnPCBootChange(!startOnPCBoot);
        break;
      case 4:
        handleShowControlsChange(!showControlsOnStart);
        break;
      case 5:
        handleReset();
        break;
      case 6:
        handleExit();
        break;
    }
  };

  const handleExit = () => {
    setShowExitConfirmation(true);
  };

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInTabContent) return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          setSelectedItemIndex(Math.min(selectedItemIndex + 1, options.length - 1));
          break;
        case 'w':
          e.preventDefault();
          setSelectedItemIndex(Math.max(selectedItemIndex - 1, 0));
          break;
        case 'a':
        case 'd':
          e.preventDefault();
          if (selectedItemIndex >= options.length - 2) {
            setSelectedItemIndex(e.key.toLowerCase() === 'a' ? options.length - 2 : options.length - 1);
          }
          break;
        case 'enter':
          e.preventDefault();
          handleOptionSelect(selectedItemIndex);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInTabContent, selectedItemIndex, setSelectedItemIndex, handleOptionSelect]);

  return (
    <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto p-2">
      <div className={`bg-${menuColor}-700 bg-opacity-30 p-4 rounded-lg relative`}>
        <h3 className="text-white text-xl mb-4 font-bold">System Settings</h3>

        <div className="mb-4"> {/* Updated margin-bottom */}
          <h4 className="text-white text-lg mb-2 font-bold">Channel 3</h4>
          <div className="space-y-1 inline-block">
            {options.slice(0, 5).map((option, index) => (
              <label key={option.value} className="block">
                <div
                  className={`py-1 px-2 rounded-lg flex items-center ${
                    selectedItemIndex === index && isInTabContent
                      ? `ring-2 ring-${uiColor}-500 ring-opacity-100 shadow-lg shadow-${uiColor}-500/50`
                      : ''
                  }`}
                >
                  {option.value === 'startOnPCBoot' || option.value === 'showControls' ? (
                    <>
                      <input
                        type="checkbox"
                        checked={option.value === 'startOnPCBoot' ? startOnPCBoot : showControlsOnStart}
                        onChange={(e) => option.value === 'startOnPCBoot' ? handleStartOnPCBootChange(e.target.checked) : handleShowControlsChange(e.target.checked)}
                        className={`w-4 h-4 mr-2 rounded transition-colors duration-200 ${
                          selectedItemIndex === index
                            ? `text-${uiColor}-500 ring-1 ring-${uiColor}-500 ring-opacity-50 shadow-sm shadow-${uiColor}-500/50`
                            : `text-${menuColor}-500`
                        }`}
                      />
                      <span className="text-base font-semibold text-white">{option.label}</span>
                    </>
                  ) : (
                    <>
                      <input
                        type="radio"
                        checked={channel3Option === option.value}
                        onChange={() => handleOptionChange(option.value as SystemSettingsType['channel3Option'])}
                        className={`mr-2 w-4 h-4 text-${menuColor}-500`}
                      />
                      <span className="text-base font-semibold text-white">{option.label}</span>
                    </>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="absolute top-0 right-4 flex flex-col space-y-2 mt-14"> {/* Updated button container */}
          <Button
            onClick={handleReset}
            className={`px-4 py-2 text-white text-base font-bold rounded focus:outline-none transition-all duration-200 ${
              selectedItemIndex === options.length - 2 && isInTabContent
                ? `bg-${uiColor}-500 hover:bg-${uiColor}-600 shadow-lg shadow-${uiColor}-500/50`
                : `bg-${menuColor}-600 hover:bg-${menuColor}-700`
            }`}
          >
            Reset All Settings
          </Button>
          <Button
            onClick={handleExit}
            className={`px-4 py-2 text-white text-base font-bold rounded focus:outline-none transition-all duration-200 ${
              selectedItemIndex === options.length - 1 && isInTabContent
                ? `bg-${uiColor}-500 hover:bg-${uiColor}-600 shadow-lg shadow-${uiColor}-500/50`
                : `bg-${menuColor}-600 hover:bg-${menuColor}-700`
            }`}
          >
            Exit
          </Button>
        </div>
      </div>
      {showExitConfirmation && (
        <ExitConfirmation
          onConfirm={(confirm) => {
            if (confirm) {
              onExit();
            }
            setShowExitConfirmation(false);
          }}
          menuColor={menuColor}
          uiColor={uiColor}
          title="Exit Program"
          message="Are you sure you want to exit the program?"
        />
      )}
      {showResetConfirmation && (
        <ExitConfirmation
          onConfirm={(confirm) => {
            if (confirm) {
              onReset();
            }
            setShowResetConfirmation(false);
          }}
          menuColor={menuColor}
          uiColor={uiColor}
          title="Reset All Settings"
          message="Are you sure you want to reset all settings? This action cannot be undone."
        />
      )}
    </div>
  )
}

