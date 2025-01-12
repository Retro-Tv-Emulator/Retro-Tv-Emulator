interface MuteDisplayProps {
  isMuted: boolean
  uiColor: string
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

export default function MuteDisplay({ isMuted, uiColor }: MuteDisplayProps) {
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 font-mono z-50">
      <div 
        className="text-4xl"
        style={{ color: getColorHex(uiColor) }}
      >
        <svg
          viewBox="0 0 24 24"
          width="48"
          height="48"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8h3l4-4v16l-4-4H6z" />
          <path d="M14 10c0.5-0.5 1-1.5 1-2.5c0-1-0.5-2-1-2.5" />
          <path d="M14 16.5c0.5-0.5 1-1.5 1-2.5c0-1-0.5-2-1-2.5" />
          {isMuted && (
            <line x1="22" y1="2" x2="2" y2="22" strokeWidth="2" />
          )}
        </svg>
      </div>
      <div className="text-lg font-bold" style={{ color: getColorHex(uiColor) }}>
        {isMuted ? 'MUTED' : 'UNMUTED'}
      </div>
    </div>
  )
}

