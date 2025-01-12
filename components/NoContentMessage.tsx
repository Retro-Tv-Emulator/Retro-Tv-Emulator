import React from 'react';
import { Silkscreen } from 'next/font/google'

const silkscreen = Silkscreen({ weight: '400', subsets: ['latin'] })

interface NoContentMessageProps {
  channel: number;
}

const NoContentMessage: React.FC<NoContentMessageProps> = ({ channel }) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <h2 className={`${silkscreen.className} text-4xl mb-4 text-white`}>
          Channel {channel}
        </h2>
        <p className={`${silkscreen.className} text-xl text-white opacity-70`}>
          No content scheduled.<br />
          Please add content in the channel settings.
        </p>
      </div>
    </div>
  );
};

export default NoContentMessage;

