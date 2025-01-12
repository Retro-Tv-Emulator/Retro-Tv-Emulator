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
}

export type FolderSelection = {
  morning: string[];
  evening: string[];
  night: string[];
  commercials: string[];
  intros: string[];
  outros: string[];
};

