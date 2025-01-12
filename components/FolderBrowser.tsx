import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface FolderBrowserProps {
  slot: string;
  folders: string[];
  onClose: () => void;
  onSave: (folders: string[]) => void;
  menuColor: string;
  uiColor: string;
}

const FolderBrowser: React.FC<FolderBrowserProps> = ({ slot, folders, onClose, onSave, menuColor, uiColor }) => {
  const [selectedFolders, setSelectedFolders] = useState<string[]>(folders);

  const handleAddFolder = () => {
    if (selectedFolders.length < 5) {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const folderPath = files[0].webkitRelativePath.split('/')[0];
          setSelectedFolders(prev => [...prev, folderPath]);
        }
      };
      input.click();
    }
  };

  const handleRemoveFolder = (index: number) => {
    setSelectedFolders(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`bg-${menuColor}-800 border-${menuColor}-700`}>
        <DialogHeader>
          <DialogTitle>Browse Folders for {slot}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ul className="space-y-2">
            {selectedFolders.map((folder, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{folder}</span>
                <Button onClick={() => handleRemoveFolder(index)} className={`bg-${uiColor}-500 hover:bg-${uiColor}-600`}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          {selectedFolders.length < 5 && (
            <Button onClick={handleAddFolder} className={`mt-4 bg-${uiColor}-500 hover:bg-${uiColor}-600`}>
              Add Folder
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(selectedFolders)} className={`bg-${menuColor}-600 hover:bg-${menuColor}-700`}>
            Save
          </Button>
          <Button onClick={onClose} className={`bg-${menuColor}-600 hover:bg-${menuColor}-700`}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FolderBrowser;

