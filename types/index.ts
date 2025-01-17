export interface VideoSettingsType {
  aspectRatio: '4:3' | '16:9';
  brightness: number;
  contrast: number;
  sharpness: number;
}

export interface AudioSettingsType {
  volume: number;
  isMuted: boolean;
  isStereo: boolean;
}

export interface SystemSettingsType {
  channel3Option: 'default' | 'alwaysLoad' | 'turnOff';
  showControlsOnStart: boolean;
  startOnPCBoot: boolean;
}

export type FolderSelection = {
  morning: string[];
  evening: string[];
  night: string[];
  commercials: string[];
  intros: string[];
  outros: string[];
};

export interface ChannelData {
  id: number;
  name: string;
  shows: Array<{
    name: string;
    time: string;
    isPlaying: boolean;
  }>;
  isEnabled: boolean;
}

export interface Song {
  url: string;
  title: string;
}

declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        send: (channel: string, data: any) => void;
        on: (channel: string, func: (...args: any[]) => void) => void;
      };
    };
  }
}
