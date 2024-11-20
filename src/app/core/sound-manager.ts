export class SoundManager {
  private audioContext: AudioContext;
  private oscillator?: OscillatorNode;
  private isPlaying: boolean = false;

  constructor() {
    this.audioContext = new AudioContext();
  }

  playSound(): void {
    if (!this.isPlaying) {
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = "square";
      this.oscillator.frequency.setValueAtTime(
        440,
        this.audioContext.currentTime
      ); // A4 note

      this.oscillator.connect(this.audioContext.destination);
      this.oscillator.start();
      this.isPlaying = true;
    }
  }

  stopSound(): void {
    if (this.isPlaying && this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.isPlaying = false;
    }
  }
}
