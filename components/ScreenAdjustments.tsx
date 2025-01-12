'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface ScreenAdjustmentsProps {
  onClose: () => void
  uiColor: string
  menuColor: string
}

export default function ScreenAdjustments({ onClose, uiColor, menuColor }: ScreenAdjustmentsProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    switch (e.key.toLowerCase()) {
      case 'w':
        setSelectedItemIndex(prev => Math.max(0, prev - 1))
        break
      case 's':
        setSelectedItemIndex(prev => Math.min(1, prev + 1))
        break
      case 'enter':
        if (selectedItemIndex === 0) {
          // Implement screen adjustment logic here
        } else if (selectedItemIndex === 1) {
          onClose()
        }
        break
      case 'escape':
        onClose()
        break
    }
  }, [selectedItemIndex, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`bg-${menuColor}-800 p-8 rounded-lg w-full max-w-md`}>
        <h2 className="text-2xl font-bold mb-4 text-white">Screen Adjustments</h2>
        <div className="space-y-4">
          <Button
            className={`w-full ${selectedItemIndex === 0 ? `bg-${uiColor}-500 hover:bg-${uiColor}-600` : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            Adjust Screen
          </Button>
          <Button
            onClick={onClose}
            className={`w-full ${selectedItemIndex === 1 ? `bg-${uiColor}-500 hover:bg-${uiColor}-600` : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}

