'use client'

import { useState, useEffect } from 'react'

interface DynamicChannelProps {
  channel: number
}

export default function DynamicChannel({ channel }: DynamicChannelProps) {
  const [currentShow, setCurrentShow] = useState<string | null>(null)

  useEffect(() => {
    // Simulating a schedule check
    const checkSchedule = () => {
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()

      // Example schedule logic (you can customize this for each channel)
      if (hour === 20 && minute >= 0 && minute < 30) {
        setCurrentShow(`Channel ${channel} News`)
      } else if (hour === 20 && minute >= 30 || hour === 21 && minute < 30) {
        setCurrentShow(`Channel ${channel} Prime Time`)
      } else {
        setCurrentShow(null)
      }
    }

    checkSchedule()
    const intervalId = setInterval(checkSchedule, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [channel])

  if (currentShow) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-4xl">
        Now Playing on Channel {channel}: {currentShow}
      </div>
    )
  }

  return (
    <video className="w-full h-full object-cover" autoPlay loop muted>
      <source src="/TV white noise static footage & sound (royalty free) 4K.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

