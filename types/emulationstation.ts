export interface ThemeConfig {
  formatVersion: string;
  views: {
    [key: string]: ViewConfig;
  };
}

export interface ViewConfig {
  background?: ImageConfig;
  logo?: ImageConfig;
  text?: TextConfig[];
  textlist?: TextListConfig;
  sound?: SoundConfig;
  helpsystem?: HelpSystemConfig;
}

export interface ImageConfig {
  path?: string;
  pos?: string;
  size?: string;
  origin?: string;
  color?: string;
  tile?: boolean;
  extra?: boolean;
}

export interface TextConfig {
  text?: string;
  color?: string;
  fontSize?: string;
  fontPath?: string;
  pos?: string;
  size?: string;
  alignment?: 'left' | 'center' | 'right';
  forceUppercase?: boolean;
}

export interface TextListConfig {
  selectorColor?: string;
  selectedColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontPath?: string;
  fontSize?: string;
  alignment?: string;
  horizontalMargin?: string;
}

export interface SoundConfig {
  path: string;
}

export interface HelpSystemConfig {
  textColor?: string;
  iconColor?: string;
  pos?: string;
}

