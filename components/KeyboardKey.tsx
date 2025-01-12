import React from 'react'

interface KeyboardKeyProps {
  children: React.ReactNode
}

export function KeyboardKey({ children }: KeyboardKeyProps) {
  return (
    <span className="inline-block bg-gray-200 rounded-md px-2 py-1 text-sm font-semibold text-gray-700 mr-2">
      {children}
    </span>
  )
}

