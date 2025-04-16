export default function soundPlayer() {
  let audioContext: AudioContext | null = null;
  let NOTE_DURATION = 50; // ms
  const VOLUME = 0.005;
  const MIN_FREQUENCY = 200;
  const MAX_FREQUENCY = 600;

  try {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  } catch (e) {
    console.error("Web Audio API is not supported in this browser", e);
  }

  const play = (frequency: number) => {
    try {
      if (!audioContext) {
        console.warn("AudioContext not available");
        return;
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = frequency;

      gainNode.gain.value = VOLUME;

      oscillator.connect(gainNode).connect(audioContext.destination);
      oscillator.start();

      // Stop the oscillator after the duration
      setTimeout(() => {
        oscillator.stop();
      }, NOTE_DURATION);
    } catch (e) {
      console.error("Error playing sound", e);
    }
  };

  const valueToFrequency = (
    value: number,
    minValue: number,
    maxValue: number
  ) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    return MIN_FREQUENCY + normalized * (MAX_FREQUENCY - MIN_FREQUENCY);
  };

  const setDuration = (duration: number) => {
    NOTE_DURATION = duration;
  };

  return {
    play,
    valueToFrequency,
    setDuration,
  };
}
