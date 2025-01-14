'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Silkscreen } from 'next/font/google'

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] })

interface LoadingScreenProps {
 onLoadingComplete: () => void
}

const ICON_URL = `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon-S8oMfRmuci2LUHFOcmJ8UOAB9y7D7i.png?token=${process.env.BLOB_READ_WRITE_TOKEN}`;

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
 const [progress, setProgress] = useState(0)
 const [iconLoaded, setIconLoaded] = useState(false)

 const completeLoading = useCallback(() => {
   if (progress === 100) {
     setTimeout(() => {
       onLoadingComplete()
     }, 1000) // Delay to show the fully loaded icon for a second
   }
 }, [progress, onLoadingComplete])

 useEffect(() => {
   const timer = setInterval(() => {
     setProgress((oldProgress) => {
       const newProgress = Math.min(oldProgress + 1, 100)
       return newProgress
     })
   }, 50)

   return () => {
     clearInterval(timer)
   }
 }, [])

 useEffect(() => {
   completeLoading()
   if (progress >= 50 && !iconLoaded) {
     setIconLoaded(true)
   }
 }, [progress, completeLoading, iconLoaded])

 return (
   <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-blue-600 flex flex-col justify-start items-center p-8 pt-[20vh]">
     <h1 className={`${silkscreen.className} text-4xl font-bold text-yellow-300 mb-8 text-center`} style={{ textShadow: '0 0 10px rgba(234, 179, 8, 0.5)' }}>
       Retro TV Emulator
     </h1>
     <div className="relative w-[400px] h-[400px] rounded-3xl overflow-hidden">
       <div 
         className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-600 rounded-3xl overflow-hidden"
         style={{
           clipPath: `inset(0 0 ${Math.max(0, 100 - progress * 2)}% 0)`,
           transition: 'clip-path 0.3s ease-out'
         }}
       >
         <Image
           src={ICON_URL}
           alt="Retro TV"
           fill
           style={{ objectFit: 'contain' }}
           priority
           unoptimized
           className="rounded-3xl"
         />
       </div>
       {!iconLoaded && (
         <div 
           className="absolute inset-0 bg-blue-200 opacity-20"
           style={{
             top: `${progress * 2}%`,
             height: '10px',
             boxShadow: '0 0 20px 10px rgba(59, 130, 246, 0.5)',
             transition: 'top 0.3s ease-out'
           }}
         />
       )}
     </div>
     <div className="mt-8 w-[400px] h-2 bg-green-200 rounded-full overflow-hidden">
       <div
         className="h-full bg-green-500 transition-all duration-300 ease-out"
         style={{ width: `${progress}%` }}
       />
     </div>
     <div className="mt-4 text-green-200 text-lg font-bold">
       Loading... {progress}%
     </div>
     <div className="absolute bottom-8 right-4 text-sm text-blue-200">V1.0</div>
   </div>
 )
}

