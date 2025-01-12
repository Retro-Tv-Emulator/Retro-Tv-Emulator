'use client'

import { useState, useEffect, useCallback } from 'react';
import { KeyboardKey } from './KeyboardKey'
import { Silkscreen } from 'next/font/google'

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] })

interface ControlsMenuProps {
 onClose: () => void
 menuColor: string
 uiColor: string
}

export default function ControlsMenu({ onClose, menuColor, uiColor }: ControlsMenuProps) {
 const handleClose = useCallback(() => {
   onClose()
 }, [onClose])

 useEffect(() => {
   const handleKeyDown = (e: KeyboardEvent) => {
     if (e.key === 'Enter') {
       handleClose();
     }
   };

   window.addEventListener('keydown', handleKeyDown);
   return () => window.removeEventListener('keydown', handleKeyDown);
 }, [handleClose]);

 return (
   <div className="fixed bottom-[calc(16.5%+1rem)] left-1/2 transform -translate-x-1/2 z-50 w-[43.33%]">
     <div className={`bg-${menuColor}-500 text-${menuColor}-100 p-8 font-mono text-lg border-2 border-${menuColor}-300 shadow-lg shadow-${menuColor}-400/50 w-full relative`}>
       <h2 className={`${silkscreen.className} text-4xl mb-8 text-center font-bold text-yellow-300`} style={{ textShadow: '0 0 10px rgba(234, 179, 8, 0.5)' }}>
         Controls
       </h2>
       <div className="grid grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
         <div className="flex items-center">
           <div className="flex space-x-1">
             <KeyboardKey>W</KeyboardKey>
             <KeyboardKey>A</KeyboardKey>
             <KeyboardKey>S</KeyboardKey>
             <KeyboardKey>D</KeyboardKey>
           </div>
           <span className="ml-2">Navigate</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>Enter</KeyboardKey>
           <span className="ml-2">Select Option</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>↑</KeyboardKey>
           <span className="ml-2">Channel Up</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>ESC</KeyboardKey>
           <span className="ml-2">Exit</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>↓</KeyboardKey>
           <span className="ml-2">Channel Down</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>M</KeyboardKey>
           <span className="ml-2">Open Menu</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>←</KeyboardKey>
           <span className="ml-2">Volume Down</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>N</KeyboardKey>
           <span className="ml-2">Mute/Unmute</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>→</KeyboardKey>
           <span className="ml-2">Volume Up</span>
         </div>
         <div className="flex items-center">
           <KeyboardKey>C</KeyboardKey>
           <span className="ml-2">Controls Menu</span>
         </div>
       </div>
       <div className="mt-4 flex justify-between items-center">
         <div>
           <p className="text-sm italic mb-2">The Controls Menu Loading on start can be</p>
           <p className="text-sm italic mb-2">turned off in the System Menu</p>
           <p className="text-sm italic mb-2">Shows and Music can be scheduled in</p>
           <p className="text-sm italic">the Channels Menu</p>
         </div>
         <button 
           className={`px-4 py-2 text-white rounded focus:outline-none transition-all duration-200 bg-${uiColor}-600 ring-2 ring-${uiColor}-500 ring-opacity-100 shadow-lg shadow-${uiColor}-500/50 cursor-default`}
           tabIndex={-1}
           aria-hidden="true"
         >
           Close
         </button>
       </div>
     </div>
   </div>
 )
}

