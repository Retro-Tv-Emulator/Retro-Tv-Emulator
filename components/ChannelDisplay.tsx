interface ChannelDisplayProps {
  channel: number
  uiColor: string
  isVisible: boolean
  channelInput: string
}

export default function ChannelDisplay({ channel, uiColor, isVisible, channelInput }: ChannelDisplayProps) {
  if (!isVisible) return null;

  const displayText = channelInput || channel.toString().padStart(2, '0')

  return (
    <div 
      className={`fixed top-4 right-4 text-${uiColor}-500 text-6xl font-bold font-mono z-50`}
      style={{ 
        textShadow: `0 0 5px ${getColorHex(uiColor)}`,
        imageRendering: 'pixelated'
      }}
    >
      {displayText}
    </div>
  )
}

function getColorHex(color: string): string {
  switch (color) {
    case 'blue': return '#3b82f6'
    case 'green': return '#22c55e'
    case 'red': return '#ef4444'
    case 'pink': return '#ec4899'
    case 'purple': return '#9333ea'
    case 'yellow': return '#eab308'
    case 'orange': return '#f97316'
    default: return '#22c55e'
  }
}

