import React from 'react'
import { Button } from '@/components/ui/button'

interface FixedCloseButtonProps {
  onClose: () => void
  menuColor: string
  uiColor: string
  isSelected: boolean
}

const FixedCloseButton: React.FC<FixedCloseButtonProps> = ({ onClose, menuColor, uiColor, isSelected }) => {
  return (
    <div className="absolute bottom-4 right-4 z-50">
      <Button 
        onClick={onClose}
        className={`px-4 py-2 text-white rounded focus:outline-none transition-all duration-200 ${
          isSelected
            ? `bg-${uiColor}-600 hover:bg-${uiColor}-700 ring-2 ring-${uiColor}-500 ring-opacity-100 shadow-lg shadow-${uiColor}-500/50`
            : `bg-${menuColor}-600 hover:bg-${menuColor}-700`
        }`}
      >
        Close
      </Button>
    </div>
  )
}

export default FixedCloseButton

