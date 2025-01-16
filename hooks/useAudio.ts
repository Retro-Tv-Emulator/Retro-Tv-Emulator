declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

import { useState, useEffect, useCallback } from 'react'
import { AudioSettingsType } from '../types'

export default function useAudio(audioSettings: AudioSettingsType) {
  const [staticAudio, setStaticAudio] = useState<HTMLAudioElement | null>(null)

  const initializeAudio = useCallback(() => {
    const audio = new Audio(audioSettings.isStereo ? "/static_sound_stereo.mp3" : "/static_sound_mono.mp3")
    audio.loop = true
    audio.preload = "auto"
    audio.load()
    setStaticAudio(audio)

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [audioSettings.isStereo])

  useEffect(() => {
    const cleanup = initializeAudio()
    return cleanup
  }, [initializeAudio])

  useEffect(() => {
    const initAudioContext = () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audioContext = new AudioContext()
      audioContext.resume()
    }

    const handleUserInteraction = () => {
      initAudioContext()
      window.removeEventListener('click', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)
    }

    window.addEventListener('click', handleUserInteraction)
    window.addEventListener('keydown', handleUserInteraction)

    return () => {
      window.removeEventListener('click', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)
    }
  }, [])

  return { staticAudio, initializeAudio }
}

