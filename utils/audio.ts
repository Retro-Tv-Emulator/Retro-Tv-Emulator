export async function loadAudio(url: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
    audio.addEventListener('error', () => reject(new Error(`Failed to load audio: ${url}`)), { once: true });
    
    // Ensure the URL is treated as an audio file
    audio.type = 'audio/mpeg';
    audio.src = url;
    audio.load();
  });
}

export function createAudioContext(): AudioContext {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext();
}

export async function setupAudioNode(
  audioElement: HTMLAudioElement,
  audioContext: AudioContext
): Promise<MediaElementAudioSourceNode> {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  return audioContext.createMediaElementSource(audioElement);
}

