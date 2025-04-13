export class SoundPlayer {
  // Major pentatonic scale
  private scale = [
    196.0, // G3
    220.0, // A3
    246.94, // B3
    293.66, // D4
    329.63, // E4
    392.0, // G4
    440.0, // A4
    493.88, // B4
  ];

  private audioContext: AudioContext | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
    }
  }

  /**
   * Play a sound with the specified frequency
   *
   * @param frequency - The frequency of the sound to play (in Hz)
   */
  play(frequency: number) {
    try {
      if (!this.audioContext) {
        console.warn("AudioContext not available");
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );

      // Start with zero volume
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

      // Gradually increase volume (attack)
      gainNode.gain.linearRampToValueAtTime(
        0.07,
        this.audioContext.currentTime + 0.01
      );

      // Gradually decrease volume (release)
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.15
      );

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }

  /**
   * Map a value to a frequency in the musical scale
   *
   * @param value - The value to map
   * @param minValue - The minimum possible value
   * @param maxValue - The maximum possible value
   * @returns The corresponding frequency from the scale
   */
  mapValueToFrequency(
    value: number,
    minValue: number,
    maxValue: number
  ): number {
    // Map the value to an index in the scale array
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const scaleIndex = Math.floor(normalizedValue * (this.scale.length - 1));

    return this.scale[scaleIndex];
  }
}
