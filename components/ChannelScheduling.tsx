'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from "@/components/ui/switch"
import VirtualKeyboard from './VirtualKeyboard'
import MusicChannelScheduling from './MusicChannelScheduling'
import FolderBrowser from './FolderBrowser';

interface ChannelSchedulingProps {
  channel: number
  onBack: () => void
  onFoldersChange: (folders: FolderSelection) => void
  initialFolders: FolderSelection
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

interface FolderSelection {
  morning: string[]
  evening: string[]
  night: string[]
  commercials: string[]
  intros: string[]
  outros: string[]
}

export default function ChannelScheduling({ 
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
}: ChannelSchedulingProps) {
  if (channel === 44) {
    return (
      <MusicChannelScheduling
        channel={channel}
        onBack={onBack}
        onFoldersChange={(folders) => onFoldersChange({ morning: folders, evening: [], night: [], commercials: [], intros: [], outros: [] })}
        initialFolders={initialFolders.morning}
        onChannelNameChange={onChannelNameChange}
        initialChannelName={initialChannelName}
        menuColor={menuColor}
        onChannelToggle={onChannelToggle}
        isChannelEnabled={isChannelEnabled}
        uiColor={uiColor}
        selectedItemIndex={selectedItemIndex}
        isInTabContent={isInTabContent}
        setSelectedItemIndex={setSelectedItemIndex}
      />
    )
  }

  if (channel < 5 || channel > 43) {
    return <div>Channel not supported</div>; // Handle unsupported channels
  }

  const [folders, setFolders] = useState<FolderSelection>(initialFolders)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState(initialChannelName)
  const [channelName, setChannelName] = useState(initialChannelName)
  const [isFolderBrowserOpen, setIsFolderBrowserOpen] = useState(false);
  const [currentBrowsingSlot, setCurrentBrowsingSlot] = useState<keyof FolderSelection | null>(null);

  const handleFolderSelect = useCallback(async (category: keyof FolderSelection) => {
    console.log(`Selecting folder for ${category}`);
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.accept = 'video/*,.mkv,.avi,.mov,.wmv,.flv,.webm'

      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files
        if (files) {
          const fileList = Array.from(files).map(file => URL.createObjectURL(file))
          setFolders(prev => {
            const newFolders = {
              ...prev,
              [category]: [...prev[category], ...fileList]
            };
            console.log(`Updated folders for channel ${channel}:`, newFolders);
            onFoldersChange(newFolders);
            return newFolders;
          })
        }
      }

      input.click()
    } catch (error) {
      console.error('Error selecting files:', error)
      alert('Unable to select files. Please try again.')
    }
  }, [channel, onFoldersChange])

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

  const handleOpenFolderBrowser = (slot: keyof FolderSelection) => {
    console.log(`Opening folder browser for ${slot}`);
    setCurrentBrowsingSlot(slot);
    setIsFolderBrowserOpen(true);
  };

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
          setSelectedItemIndex(prev => Math.min(8, prev + 1))
          break
        case 'enter':
          e.preventDefault()
          if (selectedItemIndex === 0) {
            onChannelToggle(channel, !isChannelEnabled)
          } else if (selectedItemIndex === 1) {
            handleOpenNameDialog()
          } else if (selectedItemIndex === 2) {
            onBack()
          } else if (selectedItemIndex >= 3 && selectedItemIndex <= 8) {
            const categories: (keyof FolderSelection)[] = ['morning', 'evening', 'night', 'commercials', 'intros', 'outros']
            handleFolderSelect(categories[selectedItemIndex - 3])
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
  }, [isInTabContent, selectedItemIndex, setSelectedItemIndex, onBack, channel, isChannelEnabled, onChannelToggle, handleOpenNameDialog, handleFolderSelect])

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
        <h3 className="text-xl font-bold mb-2 sm:mb-0">Channel {channel} Scheduling</h3>
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
              selectedItemIndex === 2 && isInTabContent 
                ? `bg-green-500 text-white shadow-[0_0_5px_#22c55e]` 
                : ''
            }`}
          >
            Back
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2">
        <div className="col-span-1">
          {['morning', 'evening', 'night'].map((slot, index) => (
            <div key={slot} className="p-1">
              <h4 className="text-sm font-bold mb-1">{slot.charAt(0).toUpperCase() + slot.slice(1)}</h4>
              <Button 
                onClick={() => handleOpenFolderBrowser(slot)}
                className={`bg-${menuColor}-600 hover:bg-${menuColor}-700 text-sm font-bold px-2 py-2 mb-1 w-full h-auto ${
                  selectedItemIndex === index + 3 && isInTabContent 
                    ? `bg-${uiColor}-500 text-white shadow-[0_0_5px_${uiColor},0_0_10px_${uiColor}]` 
                    : ''
                }`}
              >
                Browse Folders
              </Button>
              <p className="text-sm">
                {folders[slot].length} file(s) selected
              </p>
            </div>
          ))}
        </div>
        <div className="col-span-1">
          {['commercials', 'intros', 'outros'].map((slot, index) => (
            <div key={slot} className="p-1">
              <h4 className="text-sm font-bold mb-1">{slot.charAt(0).toUpperCase() + slot.slice(1)}</h4>
              <Button 
                onClick={() => handleFolderSelect(slot)}
                className={`bg-${menuColor}-600 hover:bg-${menuColor}-700 text-sm font-bold px-2 py-2 mb-1 w-full h-auto ${
                  selectedItemIndex === index + 6 && isInTabContent 
                    ? `bg-${uiColor}-500 text-white shadow-[0_0_5px_${uiColor},0_0_10px_${uiColor}]` 
                    : ''
                }`}
              >
                Select Files
              </Button>
              <p className="text-sm">
                {folders[slot].length} file(s) selected
              </p>
            </div>
          ))}
        </div>
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
      {isFolderBrowserOpen && currentBrowsingSlot && (
        <FolderBrowser
          slot={currentBrowsingSlot}
          folders={folders[currentBrowsingSlot]}
          onClose={() => setIsFolderBrowserOpen(false)}
          onSave={(newFolders) => {
            setFolders(prev => ({
              ...prev,
              [currentBrowsingSlot]: newFolders
            }));
            onFoldersChange({
              ...folders,
              [currentBrowsingSlot]: newFolders
            });
            setIsFolderBrowserOpen(false);
          }}
          menuColor={menuColor}
          uiColor={uiColor}
        />
      )}
    </div>
  )
}

