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
  // Add any additional properties expected by the SystemSettings component
}

export type FolderSelection = {
  morning: string[];
  evening: string[];
  night: string[];
  commercials: string[];
  intros: string[];
  outros: string[];
};

export type ChannelData = {
  id: number;
  name: string;
  shows: { name: string; time: string; isPlaying: boolean }[];
  isEnabled: boolean;
  url?: string; // Make url optional
};