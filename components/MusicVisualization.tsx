import React, { useRef, useEffect } from 'react'

interface MusicVisualizationProps {
  audioElement: HTMLAudioElement
}

const MusicVisualization: React.FC<MusicVisualizationProps> = ({ audioElement }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaElementSource(audioElement)
    source.connect(analyser)
    analyser.connect(audioContext.destination)

    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = 'rgb(0, 0, 0)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2

        const r = barHeight + (25 * (i / bufferLength))
        const g = 250 * (i / bufferLength)
        const b = 50

        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()

    return () => {
      source.disconnect()
      analyser.disconnect()
    }
  }, [audioElement])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

export default MusicVisualization

