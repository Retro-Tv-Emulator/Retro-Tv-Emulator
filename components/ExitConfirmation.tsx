import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ExitConfirmationProps {
  onConfirm: (confirm: boolean) => void
  menuColor: string
  uiColor: string
  title: string;
  message: string;
}

export default function ExitConfirmation({ onConfirm, menuColor, uiColor, title, message }: ExitConfirmationProps) {
  const [selectedButton, setSelectedButton] = useState<'yes' | 'no'>('no')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'd':
          e.preventDefault()
          setSelectedButton(prev => prev === 'yes' ? 'no' : 'yes')
          break
        case 'enter':
          e.preventDefault()
          onConfirm(selectedButton === 'yes')
          break
        case 'escape':
          e.preventDefault()
          onConfirm(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onConfirm, selectedButton])

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`bg-${menuColor}-500 bg-opacity-30 text-${menuColor}-100 p-8 font-mono text-lg border-2 border-${menuColor}-300 shadow-lg shadow-${menuColor}-400/50 max-w-md w-full relative`}>
        <h2 className="text-3xl mb-8 text-center font-bold">{title}</h2>
        <p className="text-center mb-8">{message}</p>
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => onConfirm(true)}
            className={`px-4 py-2 text-white rounded focus:outline-none transition-all duration-200 ${
              selectedButton === 'yes'
                ? `bg-${uiColor}-600 hover:bg-${uiColor}-700`
                : `bg-${menuColor}-600 hover:bg-${menuColor}-700`
            }`}
          >
            Yes
          </Button>
          <Button 
            onClick={() => onConfirm(false)}
            className={`px-4 py-2 text-white rounded focus:outline-none transition-all duration-200 ${
              selectedButton === 'no'
                ? `bg-${uiColor}-600 hover:bg-${uiColor}-700`
                : `bg-${menuColor}-600 hover:bg-${menuColor}-700`
            }`}
          >
            No
          </Button>
        </div>
      </div>
    </div>
  )
}

