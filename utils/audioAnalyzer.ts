export class AudioAnalyzer {
  public analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private isInitialized: boolean = false;

  async init() {
    if (this.isInitialized) return;
    
    try {
      if (typeof window === 'undefined') return;
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      await this.ensureAudioContextRunning();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing AudioAnalyzer:', error);
      throw error;
    }
  }

  async connectSource(audioElement: HTMLAudioElement) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      if (!this.audioContext || !this.analyser) {
        throw new Error('AudioContext or Analyser not initialized');
      }

      if (this.source) {
        this.source.disconnect();
      }

      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      return true;
    } catch (error) {
      console.error('Error connecting audio source:', error);
      throw error;
    }
  }

  cleanup() {
    if (this.source) {
      this.source.disconnect();
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }

    this.source = null;
    this.analyser = null;
    this.audioContext = null;
    this.isInitialized = false;
  }

  private async ensureAudioContextRunning() {
    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Error resuming AudioContext:', error);
        throw error;
      }
    }
  }
}

