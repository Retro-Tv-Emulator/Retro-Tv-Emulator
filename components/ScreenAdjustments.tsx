'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ScreenAdjustmentsProps {
  onClose: () => void
  uiColor: string
  menuColor: string
}

export default function ScreenAdjustments({ onClose, uiColor, menuColor }: ScreenAdjustmentsProps) {
  const [scale, setScale] = useState({ x: 1, y: 1 })

  const adjustScale = useCallback((axis: 'x' | 'y', amount: number) => {
    setScale(prev => ({
      ...prev,
      [axis]: Math.max(0.5, Math.min(1.5, prev[axis] + amount))
    }))
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      const step = 0.01
      
      switch (e.key.toLowerCase()) {
        case 'w':
          adjustScale('y', step)
          break
        case 's':
          adjustScale('y', -step)
          break
        case 'a':
          adjustScale('x', step)
          break
        case 'd':
          adjustScale('x', -step)
          break
        case 'enter':
        case 'escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [adjustScale, onClose])

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        className="bg-center bg-contain bg-no-repeat w-full h-full relative"
        style={{
          transform: `scale(${scale.x}, ${scale.y})`,
          transformOrigin: 'center',
        }}
      >
        <Image
          src="/images/ScreenAdjustment.png"
          alt="Screen Adjustment Grid"
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={onClose}
          className={`bg-${uiColor}-500 hover:bg-${uiColor}-600 ring-2 ring-${uiColor}-400 shadow-lg shadow-${uiColor}-400/50`}
        >
          Close
        </Button>
      </div>
    </div>
  )
}

