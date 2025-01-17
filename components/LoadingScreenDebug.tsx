'use client'

import { useEffect } from 'react'
import LoadingScreen from './LoadingScreen'

interface LoadingScreenDebugProps {
  onLoadingComplete: () => void
}

export default function LoadingScreenDebug({ onLoadingComplete }: LoadingScreenDebugProps) {
  useEffect(() => {
    const debugLoadingComplete = () => {
      console.log('Loading complete triggered')
      if (typeof window !== 'undefined' && window.electron) {
        window.electron.send('loading-complete')
      }
      onLoadingComplete()
    }

    // Debug resource loading
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        console.log('All resources loaded')
      })

      return () => {
        window.removeEventListener('load', () => {
          console.log('All resources loaded')
        })
      }
    }
  }, [onLoadingComplete])

  return <LoadingScreen onLoadingComplete={onLoadingComplete} />
}

