import { ThemeConfig } from '../types/emulationstation';

export async function loadTheme(systemName: string): Promise<ThemeConfig> {
  // In a real implementation, this would load and parse the XML theme files
  // For now, we'll return a simplified version of the theme configuration
  return {
    formatVersion: "3",
    views: {
      system: {
        background: {
          path: "/gba_art_blur.jpg",
          size: "1 1",
          pos: "0.5 0.5",
          origin: "0.5 0.5"
        },
        logo: {
          path: "/gba.svg",
          pos: "0.5 0.4",
          origin: "0.5 0.5",
          size: "0.4 0.2"
        }
      },
      basic: {
        background: {
          path: "/gba_art.png",
          size: "1 1",
          pos: "0 0",
          origin: "0 0"
        },
        textlist: {
          selectorColor: "393a3b",
          selectedColor: "97999b",
          primaryColor: "393a3b",
          secondaryColor: "000000",
          fontSize: "0.03",
          alignment: "center"
        }
      }
    }
  };
}

