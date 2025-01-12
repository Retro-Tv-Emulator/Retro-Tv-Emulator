import { VideoSettingsType } from '../components/VideoSettings'
import { sampleMusicFiles } from '../constants/sampleMusic'

function getTimeOfDay(date: Date): 'morning' | 'evening' | 'night' {
 const hour = date.getHours()
 if (hour >= 6 && hour < 12) return 'morning'
 if (hour >= 12 && hour < 18) return 'evening'
 return 'night'
}

interface PlaylistItem {
 type: 'video' | 'music'
 url: string
}

interface FolderSelection {
 morning: string[]
 evening: string[]
 night: string[]
 commercials: string[]
 intros: string[]
 outros: string[]
}

const LAST_CHANNEL = 44;

function shuffleArray<T>(array: T[]): T[] {
 for (let i = array.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [array[i], array[j]] = [array[j], array[i]];
 }
 return array;
}

export function createPlaylist(
  folderContent: FolderSelection,
  currentTime: Date,
  videoSettings: VideoSettingsType,
  channel: number
): PlaylistItem[] {
  console.log(`Creating playlist for channel ${channel}`, folderContent);

  if (channel === 3 || channel === 4 || channel === 44) {
    return []; // Return an empty playlist for special channels
  }

  const playlist: PlaylistItem[] = [];
  const timeOfDay = getTimeOfDay(currentTime);
  const showFolder = folderContent[timeOfDay];
  const { commercials, intros, outros } = folderContent;

  console.log(`Time of day: ${timeOfDay}, Show folder:`, showFolder);

  if (!showFolder || showFolder.length === 0) {
    console.log(`No content for channel ${channel} at ${timeOfDay}`);
    return [];
  }

  // Add intro if available
  if (intros && intros.length > 0) {
    const randomIntro = intros[Math.floor(Math.random() * intros.length)];
    if (randomIntro) {
      playlist.push({ type: 'video', url: randomIntro });
    } else {
      console.warn(`Empty intro URL for channel ${channel} in ${timeOfDay} slot`);
    }
  }

  // Add main content
  shuffleArray(showFolder).forEach(show => {
    if (show) {
      playlist.push({ type: 'video', url: show });
    } else {
      console.warn(`Empty show URL for channel ${channel} in ${timeOfDay} slot`);
    }
    
    // Add commercials between shows
    if (commercials && commercials.length > 0) {
      const numCommercials = Math.floor(Math.random() * 3) + 1; // 1 to 3 commercials
      for (let i = 0; i < numCommercials; i++) {
        const randomCommercial = commercials[Math.floor(Math.random() * commercials.length)];
        if (randomCommercial) {
          playlist.push({ type: 'video', url: randomCommercial });
        } else {
          console.warn(`Empty commercial URL for channel ${channel} in ${timeOfDay} slot`);
        }
      }
    }
  });

  // Add outro if available
  if (outros && outros.length > 0) {
    const randomOutro = outros[Math.floor(Math.random() * outros.length)];
    if (randomOutro) {
      playlist.push({ type: 'video', url: randomOutro });
    } else {
      console.warn(`Empty outro URL for channel ${channel} in ${timeOfDay} slot`);
    }
  }

  console.log(`Created playlist for channel ${channel}:`, playlist);
  return playlist;
}

