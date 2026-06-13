export class ProceduralAudio {
  private ctx: AudioContext | null = null;
  private sequencerTimer: any = null;
  private bpm = 135;
  private currentStep = 0;
  private nextNoteTime = 0;
  private scheduleAheadTime = 0.1;
  private isMusicPlaying = false;
  private masterGain: GainNode | null = null;
  private level = 1;

  constructor() {}

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public setLevel(lvl: number) {
    this.level = lvl;
    this.bpm = 135 + (lvl - 1) * 10; // Speed up music on higher levels
  }

  public resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playLaser() {
    if (!this.ctx || this.ctx.state === "suspended") return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playMissile() {
    if (!this.ctx || this.ctx.state === "suspended") return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(660, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    // Layer with low-pass filtered noise for exhaust
    this.playNoise(0.25, 400, 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playExplosion(isBoss = false) {
    if (!this.ctx || this.ctx.state === "suspended") return;
    const duration = isBoss ? 1.4 : 0.45;
    const filterFreq = isBoss ? 250 : 800;
    const vol = isBoss ? 0.45 : 0.28;
    this.playNoise(duration, filterFreq, vol);

    // Add deep sub bass hum for bosses
    if (isBoss) {
      const now = this.ctx.currentTime;
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(80, now);
      subOsc.frequency.linearRampToValueAtTime(20, now + 1.2);
      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain || this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.3);
    }
  }

  public playModeChange() {
    if (!this.ctx || this.ctx.state === "suspended") return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.15, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx!.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.22);
    });
  }

  public playPickup() {
    if (!this.ctx || this.ctx.state === "suspended") return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playSpecial() {
    if (!this.ctx || this.ctx.state === "suspended") return;
    const now = this.ctx.currentTime;
    const duration = 1.8;
    // Massive detuned square sweep
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(150 + i * 4, now);
      osc.frequency.linearRampToValueAtTime(40, now + duration);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.1);
    }
  }

  public playGameOver() {
    if (!this.ctx || this.ctx.state === "suspended") return;
    const now = this.ctx.currentTime;
    const freqs = [196.00, 155.56, 130.81]; // G minor chord descending
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      osc.frequency.linearRampToValueAtTime(60, now + idx * 0.1 + 0.8);

      gain.gain.setValueAtTime(0.25, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx!.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.85);
    });
  }

  private playNoise(duration: number, filterFreq: number, volume: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.frequency.exponentialRampToValueAtTime(20, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + duration);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + duration + 0.05);
  }

  public startMusic() {
    if (this.isMusicPlaying) return;
    this.init();
    this.resume();
    this.isMusicPlaying = true;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime;
    }
    this.currentStep = 0;
    this.sequencerLoop();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.sequencerTimer) {
      clearTimeout(this.sequencerTimer);
      this.sequencerTimer = null;
    }
  }

  private sequencerLoop() {
    if (!this.isMusicPlaying || !this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      const secondsPerBeat = 60.0 / this.bpm;
      const stepDuration = secondsPerBeat / 4; // 16th note steps
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 16;
    }
    this.sequencerTimer = setTimeout(() => this.sequencerLoop(), 25);
  }

  private scheduleNote(step: number, time: number) {
    if (!this.ctx) return;

    // --- 1. Kick Drum ---
    if (step === 0 || step === 4 || step === 8 || step === 12) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.09);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.11);
    }

    // --- 2. Snare Drum ---
    if (step === 4 || step === 12) {
      const snareFilter = this.ctx.createBiquadFilter();
      snareFilter.type = "bandpass";
      snareFilter.frequency.setValueAtTime(1000, time);

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.18, time);
      snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

      // Programmatic short noise burst
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      noise.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(this.masterGain || this.ctx.destination);

      noise.start(time);
      noise.stop(time + 0.13);
    }

    // --- 3. Bassline ---
    // A classic pulsing synthwave bassline
    const bassScale = [110, 110, 130.81, 130.81, 98.0, 98.0, 146.83, 146.83]; // A2, C3, G2, D3
    const bassIdx = Math.floor(step / 2) % bassScale.length;
    const bassFreq = bassScale[bassIdx];
    
    // Play on alternate eighth notes
    if (step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(bassFreq, time);

      gain.gain.setValueAtTime(0.14, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, time);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.16);
    }

    // --- 4. Arpeggiated Melody Lead ---
    // Schedules rising and falling retro arpeggios that change depending on level
    const arpPatterns = [
      [220, 261.63, 329.63, 392.0, 440, 523.25, 659.25, 783.99], // Lvl 1 & 2: A Minor Arp
      [293.66, 349.23, 440.0, 523.25, 587.33, 698.46, 880.0, 1046.50]  // Lvl 3+: D Minor Arp
    ];
    const activePattern = this.level >= 3 ? arpPatterns[1] : arpPatterns[0];
    const melodyIndex = step % activePattern.length;
    const melodyFreq = activePattern[melodyIndex];

    // Play melody notes on steps 2, 6, 10, 14
    if (step === 2 || step === 6 || step === 10 || step === 14) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(melodyFreq, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.2);
    }
  }
}
export const audio = new ProceduralAudio();
