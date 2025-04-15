export class SoundPlayer {
  private audioContext: AudioContext | null = null;
  private NOTE_DURATION = 50; // ms
  private VOLUME = 0.005;

  // Frequency range (Hz)
  private MIN_FREQUENCY = 200;
  private MAX_FREQUENCY = 600;

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

      oscillator.type = "square";
      oscillator.frequency.value = frequency;

      gainNode.gain.value = this.VOLUME;

      oscillator.connect(gainNode).connect(this.audioContext.destination);
      oscillator.start();

      // Stop the oscillator after the duration
      setTimeout(() => {
        oscillator.stop();
      }, this.NOTE_DURATION);
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }

  /**
   * Convert a value directly to a frequency using linear mapping
   *
   * @param value - The value to convert to a frequency
   * @param minValue - The minimum possible value
   * @param maxValue - The maximum possible value
   * @returns The corresponding frequency
   */
  valueToFrequency(value: number, minValue: number, maxValue: number): number {
    // Linear mapping from value range to frequency range
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const frequency =
      this.MIN_FREQUENCY +
      normalizedValue * (this.MAX_FREQUENCY - this.MIN_FREQUENCY);

    return frequency;
  }

  // Customization methods
  setVolume(volume: number) {
    this.VOLUME = volume;
  }

  setDuration(duration: number) {
    this.NOTE_DURATION = duration;
  }

  setFrequencyRange(min: number, max: number) {
    this.MIN_FREQUENCY = min;
    this.MAX_FREQUENCY = max;
  }
}
