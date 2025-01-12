'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from "@/components/ui/switch"
import VirtualKeyboard from './VirtualKeyboard'

interface MusicChannelSchedulingProps {
  channel: number
  onBack: () => void
  onFoldersChange: (folders: { url: string; title: string }[]) => void
  initialFolders: { url: string; title: string }[]
  onChannelNameChange: (channelNumber: number, newName: string) => void
  initialChannelName: string
  menuColor: string
  onChannelToggle: (channel: number, isEnabled: boolean) => void
  isChannelEnabled: boolean
  uiColor: string
  selectedItemIndex: number
  isInTabContent: boolean
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number>>
}

export default function MusicChannelScheduling({ 
  channel, 
  onBack, 
  onFoldersChange, 
  initialFolders,
  onChannelNameChange,
  initialChannelName,
  menuColor,
  onChannelToggle,
  isChannelEnabled,
  uiColor,
  selectedItemIndex,
  isInTabContent,
  setSelectedItemIndex
}: MusicChannelSchedulingProps) {
  const [playlist, setPlaylist] = useState< { url: string; title: string }[]>(initialFolders || [])
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState(initialChannelName)
  const [channelName, setChannelName] = useState(initialChannelName)

  const handleFileSelect = useCallback(async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.accept = 'audio/*'

      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files
        if (files) {
          const newPlaylist = Array.from(files).map(file => ({
            url: URL.createObjectURL(file),
            title: file.name
          }))
          setPlaylist(prevPlaylist => {
            const updatedPlaylist = [...prevPlaylist, ...newPlaylist]
            onFoldersChange(updatedPlaylist)
            return updatedPlaylist
          })
        }
      }

      input.click()
    } catch (error) {
      console.error('Error selecting files:', error)
      alert('Unable to select files. Please try again.')
    }
  }, [onFoldersChange])

  const handleOpenNameDialog = useCallback(() => {
    setNewChannelName(channelName)
    setIsNameDialogOpen(true)
  }, [channelName])

  const handleCloseNameDialog = useCallback(() => {
    setIsNameDialogOpen(false)
  }, [])

  const handleSaveNewName = useCallback(() => {
    if (newChannelName.trim() !== '' && newChannelName !== channelName) {
      setChannelName(newChannelName)
      onChannelNameChange(channel, newChannelName)
    }
    setIsNameDialogOpen(false)
  }, [channel, newChannelName, channelName, onChannelNameChange])

  const handleNameChange = useCallback((newName: string) => {
    setNewChannelName(newName.slice(0, 6))
  }, [])

  useEffect(() => {
    setPlaylist(initialFolders || [])
  }, [initialFolders])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInTabContent) return

      switch (e.key.toLowerCase()) {
        case 'w':
          e.preventDefault()
          setSelectedItemIndex(prev => Math.max(0, prev - 1))
          break
        case 's':
          e.preventDefault()
          setSelectedItemIndex(prev => Math.min(3, prev + 1))
          break
        case 'enter':
          e.preventDefault()
          if (selectedItemIndex === 0) {
            onChannelToggle(channel, !isChannelEnabled)
          } else if (selectedItemIndex === 1) {
            handleOpenNameDialog()
          } else if (selectedItemIndex === 2) {
            handleFileSelect()
          } else if (selectedItemIndex === 3) {
            onBack()
          }
          break
        case 'escape':
          e.preventDefault()
          onBack()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInTabContent, selectedItemIndex, setSelectedItemIndex, onBack, channel, isChannelEnabled, onChannelToggle, handleOpenNameDialog, handleFileSelect])

  return (
    <div className={`bg-${menuColor}-800 p-2 rounded-lg h-full overflow-y-auto text-xs`}>
      <div className="flex flex-wrap justify-between items-center mb-1">
        <div className="flex items-center space-x-1 mb-1 sm:mb-0">
          <Switch
            checked={isChannelEnabled}
            onCheckedChange={(checked) => onChannelToggle(channel, checked)}
            className={`${isChannelEnabled ? 'bg-green-500' : 'bg-red-500'} ${
              selectedItemIndex === 0 && isInTabContent 
                ? `shadow-[0_0_5px_#22c55e,0_0_10px_#22c55e]`
                : ''
            }`}
          />
          <span className={`font-bold ${isChannelEnabled ? 'text-green-500' : 'text-red-500'}`}>
            {isChannelEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 sm:mb-0">Music Channel Scheduling</h3>
        <div className="flex space-x-1">
          <Button 
            onClick={handleOpenNameDialog} 
            className={`bg-${menuColor}-600 hover:bg-${menuColor}-700 text-sm font-bold px-2 py-1 w-20 ${
              selectedItemIndex === 1 && isInTabContent 
                ? `bg-green-500 text-white shadow-[0_0_5px_#22c55e]` 
                : ''
            }`}
          >
            Name
          </Button>
          <Button 
            onClick={onBack} 
            className={`bg-${menuColor}-600 hover:bg-${menuColor}-700 text-sm font-bold px-2 py-1 w-20 ${
              selectedItemIndex === 3 && isInTabContent 
                ? `bg-green-500 text-white shadow-[0_0_5px_#22c55e]` 
                : ''
            }`}
          >
            Back
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Button 
          onClick={handleFileSelect}
          className={`bg-${menuColor}-600 hover:bg-${menuColor}-700 text-sm font-bold px-2 py-2 mb-1 w-full h-auto ${
            selectedItemIndex === 2 && isInTabContent 
              ? `bg-${uiColor}-500 text-white shadow-[0_0_5px_${uiColor},0_0_10px_${uiColor}]` 
              : ''
          }`}
        >
          Select Music Files
        </Button>
      </div>
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className={`bg-${menuColor}-800 border-${menuColor}-700`}>
          <DialogHeader>
            <DialogTitle>Change Channel {channel} Name</DialogTitle>
          </DialogHeader>
          <VirtualKeyboard
            value={newChannelName}
            onChange={handleNameChange}
            onSubmit={handleSaveNewName}
            maxLength={6}
            menuColor={menuColor}
            uiColor={uiColor}
          />
          <DialogFooter>
            <Button onClick={handleSaveNewName} className={`bg-${menuColor}-600 hover:bg-${menuColor}-700`}>
              Save
            </Button>
            <Button onClick={handleCloseNameDialog} className={`bg-${menuColor}-600 hover:bg-${menuColor}-700 animate-pulse`}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

