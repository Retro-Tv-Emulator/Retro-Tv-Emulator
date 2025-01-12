import React from 'react';
import { Silkscreen } from 'next/font/google'

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] })

const MusicVisualizerPlaceholder: React.FC = () => {
 return (
   <div className="w-full h-full flex items-center justify-center bg-black text-white">
     <div className="text-center">
       <h1 className={`${silkscreen.className} text-4xl font-bold mb-4`} style={{ textShadow: '0 0 10px #fff' }}>Music Visualizer</h1>
       <p className={`${silkscreen.className} text-2xl`} style={{ textShadow: '0 0 5px #fff' }}>Coming Soon!</p>
     </div>
   </div>
 );
};

export default MusicVisualizerPlaceholder;

