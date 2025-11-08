// Chess Sound Effects Service
// Uses Web Audio API for low-latency sound playback

class SoundService {
  private enabled: boolean = true;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.initAudioContext();
    this.generateSounds();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Generate synthesized chess sounds
   */
  private generateSounds() {
    if (!this.audioContext) return;

    // Move sound - short click
    this.sounds.set('move', this.generateTone(800, 0.05, 'sine'));
    
    // Capture sound - deeper thump
    this.sounds.set('capture', this.generateTone(400, 0.1, 'sine'));
    
    // Check sound - warning beep
    this.sounds.set('check', this.generateTone(1000, 0.15, 'square'));
    
    // Checkmate sound - victory chord
    this.sounds.set('checkmate', this.generateChord([523, 659, 784], 0.3));
    
    // Game start - ascending notes
    this.sounds.set('start', this.generateSequence([440, 554, 659], 0.1));
    
    // Castle sound - double click
    this.sounds.set('castle', this.generateDoubleClick());
    
    // Illegal move - error buzz
    this.sounds.set('illegal', this.generateTone(200, 0.1, 'sawtooth'));
  }

  /**
   * Generate a simple tone
   */
  private generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'sawtooth':
          value = 2 * (t * frequency - Math.floor(0.5 + t * frequency));
          break;
      }
      
      // Apply envelope (fade in/out)
      const envelope = Math.min(i / (sampleRate * 0.01), (buffer.length - i) / (sampleRate * 0.02), 1);
      data[i] = value * envelope * 0.3;
    }

    return buffer;
  }

  /**
   * Generate a chord (multiple frequencies)
   */
  private generateChord(frequencies: number[], duration: number): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      frequencies.forEach(freq => {
        value += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
      });
      
      const envelope = Math.min(i / (sampleRate * 0.01), (buffer.length - i) / (sampleRate * 0.05), 1);
      data[i] = value * envelope * 0.3;
    }

    return buffer;
  }

  /**
   * Generate a sequence of notes
   */
  private generateSequence(frequencies: number[], noteDuration: number): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();

    const totalDuration = frequencies.length * noteDuration;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * totalDuration, sampleRate);
    const data = buffer.getChannelData(0);

    frequencies.forEach((freq, index) => {
      const startSample = Math.floor(index * noteDuration * sampleRate);
      const endSample = Math.floor((index + 1) * noteDuration * sampleRate);

      for (let i = startSample; i < endSample && i < buffer.length; i++) {
        const t = (i - startSample) / sampleRate;
        const value = Math.sin(2 * Math.PI * freq * t);
        const envelope = Math.min((i - startSample) / (sampleRate * 0.01), 
                                  (endSample - i) / (sampleRate * 0.02), 1);
        data[i] = value * envelope * 0.3;
      }
    });

    return buffer;
  }

  /**
   * Generate double click sound for castling
   */
  private generateDoubleClick(): AudioBuffer {
    if (!this.audioContext) return this.createEmptyBuffer();

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.15;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // First click
    for (let i = 0; i < sampleRate * 0.05; i++) {
      const t = i / sampleRate;
      const value = Math.sin(2 * Math.PI * 800 * t);
      const envelope = Math.min(i / (sampleRate * 0.005), (sampleRate * 0.05 - i) / (sampleRate * 0.01), 1);
      data[i] = value * envelope * 0.3;
    }

    // Second click
    const offset = Math.floor(sampleRate * 0.08);
    for (let i = 0; i < sampleRate * 0.05; i++) {
      const t = i / sampleRate;
      const value = Math.sin(2 * Math.PI * 800 * t);
      const envelope = Math.min(i / (sampleRate * 0.005), (sampleRate * 0.05 - i) / (sampleRate * 0.01), 1);
      data[offset + i] = value * envelope * 0.3;
    }

    return buffer;
  }

  /**
   * Create empty buffer as fallback
   */
  private createEmptyBuffer(): AudioBuffer {
    const ctx = new OfflineAudioContext(1, 1, 44100);
    return ctx.createBuffer(1, 1, 44100);
  }

  /**
   * Play a sound
   */
  play(soundName: string) {
    if (!this.enabled || !this.audioContext) return;

    const buffer = this.sounds.get(soundName);
    if (!buffer) {
      console.warn('Sound not found:', soundName);
      return;
    }

    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Set sound enabled state
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const soundService = new SoundService();
