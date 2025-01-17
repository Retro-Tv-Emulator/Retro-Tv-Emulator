import { VideoSettingsType, AudioSettingsType, SystemSettingsType } from '../types';

export const DEFAULT_SETTINGS = {
  video: {
    aspectRatio: '16:9' as const,
    brightness: 50,
    contrast: 50,
    sharpness: 50,
  } as VideoSettingsType,
  audio: {
    volume: 50,
    isMuted: false,
    isStereo: true,
  } as AudioSettingsType,
  system: {
    channel3Option: 'default' as const,
    showControlsOnStart: true,
    startOnPCBoot: false,
  } as SystemSettingsType,
};

export const TOTAL_CHANNELS = 42; // From channel 3 to 44, including channel 5
export const FIRST_CHANNEL = 3;
export const LAST_CHANNEL = 44;

