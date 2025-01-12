import { VolumeX, Volume2 } from 'lucide-react'

interface MuteButtonProps {
  isMuted: boolean
  toggleMute: () => void
  uiColor: string
}

export default function MuteButton({ isMuted, toggleMute, uiColor }: MuteButtonProps) {
  return (
    <button
      onClick={toggleMute}
      className={`fixed bottom-4 right-4 p-2 rounded-full bg-${uiColor}-500 hover:bg-${uiColor}-600 transition-colors duration-200 z-50`}
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <VolumeX className={`w-6 h-6 text-${uiColor}-100`} />
      ) : (
        <Volume2 className={`w-6 h-6 text-${uiColor}-100`} />
      )}
    </button>
  )
}

