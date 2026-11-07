import { NOTES, NoteId } from '../data/notes';

class PianoAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  /**
   * Synthesizes a warm, realistic acoustic grand piano tone with harmonic overtones
   * and soft felt hammer transient. Zero sample loading delay on MacBook, Chromebook, or Fire Tablet.
   */
  public playNote(noteId: NoteId, durationSeconds = 1.4): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const note = NOTES[noteId];
    if (!note) return;

    const now = ctx.currentTime;
    const freq = note.frequency;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.42, now + 0.012);
    masterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.25);
    masterGain.gain.exponentialRampToValueAtTime(0.0008, now + durationSeconds);

    // Warm low-pass filter to emulate piano soundboard warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 6.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 2.2, now + durationSeconds * 0.8);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Harmonic partials: fundamental (triangle) + 2nd, 3rd, 4th harmonics (sine) with slight piano inharmonicity
    const partials: Array<{ ratio: number; gain: number; type: OscillatorType; decayMult: number }> = [
      { ratio: 1.0, gain: 0.65, type: 'triangle', decayMult: 1.0 },
      { ratio: 2.001, gain: 0.25, type: 'sine', decayMult: 0.75 },
      { ratio: 3.003, gain: 0.10, type: 'sine', decayMult: 0.55 },
      { ratio: 4.006, gain: 0.04, type: 'sine', decayMult: 0.35 },
    ];

    for (const p of partials) {
      const osc = ctx.createOscillator();
      const pGain = ctx.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(freq * p.ratio, now);

      pGain.gain.setValueAtTime(p.gain, now);
      pGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds * p.decayMult);

      osc.connect(pGain);
      pGain.connect(filter);

      osc.start(now);
      osc.stop(now + durationSeconds);
    }
  }

  /**
   * Sparkle chime when she answers a note right!
   */
  public playSuccessSparkle(streak = 1): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreqs = streak >= 3 ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 880.0];
    baseFreqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.065);

      gain.gain.setValueAtTime(0.001, now + idx * 0.065);
      gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.065 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.35);
    });
  }

  /**
   * Gentle soft "boing" when she taps the wrong note (never a harsh buzzer).
   */
  public playGentleHintSound(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Celebratory fanfare when finishing a level or Boss Concert!
   */
  public playFanfare(): void {
    if (this.isMuted) return;
    const notes: NoteId[] = ['C4', 'E4', 'G4', 'C5'];
    notes.forEach((n, i) => {
      setTimeout(() => {
        this.playNote(n, i === notes.length - 1 ? 1.8 : 0.45);
      }, i * 140);
    });
  }

  /**
   * Arcade Level-Up chime (fast rising major arpeggio).
   */
  public playLevelUp(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.055);
      gain.gain.setValueAtTime(0.001, now + idx * 0.055);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.055 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.32);
    });
  }

  /**
   * Shimmering magic power-up reward sound for Mystery Golden Notes!
   */
  public playPowerUp(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [659.25, 880, 1174.66, 1567.98];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);
      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.42);
    });
  }

  /**
   * Protective bubble pop when Unicorn Shield absorbs a mistake!
   */
  public playShieldPop(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.16);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  /**
   * Friendly Arcade Game-Over cadence (warm descending piano notes).
   */
  public playArcadeGameOver(): void {
    if (this.isMuted) return;
    const notes: NoteId[] = ['G4', 'E4', 'D4', 'C4'];
    notes.forEach((n, i) => {
      setTimeout(() => {
        this.playNote(n, i === notes.length - 1 ? 1.5 : 0.4);
      }, i * 180);
    });
  }
}

export const audioEngine = new PianoAudioEngine();
