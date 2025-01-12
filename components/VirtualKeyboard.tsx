import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface VirtualKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength: number;
  menuColor: string;
  uiColor: string;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength,
  menuColor,
  uiColor,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const keys = [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
    ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
    ['V', 'W', 'X', 'Y', 'Z', '0', '1'],
    ['2', '3', '4', '5', '6', '7', '8'],
    ['9', 'Space', 'Backspace', 'Enter'],
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key.toLowerCase()) {
        case 'w':
          moveSelection('up');
          break;
        case 's':
          moveSelection('down');
          break;
        case 'a':
          moveSelection('left');
          break;
        case 'd':
          moveSelection('right');
          break;
        case 'enter':
          if (selectedKey) {
            handleKeyPress(selectedKey);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKey, value, maxLength]);

  const moveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedKey) {
      setSelectedKey(keys[0][0]);
      return;
    }

    const currentRow = keys.findIndex(row => row.includes(selectedKey));
    const currentCol = keys[currentRow].indexOf(selectedKey);

    let newRow = currentRow;
    let newCol = currentCol;

    switch (direction) {
      case 'up':
        newRow = (currentRow - 1 + keys.length) % keys.length;
        break;
      case 'down':
        newRow = (currentRow + 1) % keys.length;
        break;
      case 'left':
        newCol = (currentCol - 1 + keys[currentRow].length) % keys[currentRow].length;
        break;
      case 'right':
        newCol = (currentCol + 1) % keys[currentRow].length;
        break;
    }

    setSelectedKey(keys[newRow][newCol]);
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      onChange(value.slice(0, -1));
    } else if (key === 'Space') {
      if (value.length < maxLength) {
        onChange(value + ' ');
      }
    } else if (key === 'Enter') {
      onSubmit();
    } else {
      if (value.length < maxLength) {
        onChange(value + key);
      }
    }
  };

  return (
    <div className="grid gap-2">
      <div className={`p-2 bg-${menuColor}-700 text-white rounded`}>
        {value || 'Enter channel name'}
      </div>
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((key) => (
            <Button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`flex-1 ${
                selectedKey === key
                  ? `bg-${uiColor}-500 hover:bg-${uiColor}-600`
                  : `bg-${menuColor}-600 hover:bg-${menuColor}-700`
              }`}
            >
              {key}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;

