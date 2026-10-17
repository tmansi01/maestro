import { frequencyToClosestNote, NoteDefinition } from '../data/notes';

export interface PitchDetectionResult {
  note: NoteDefinition;
  frequency: number;
  centsOff: number;
  volume: number;
}

/**
 * Pure time-domain autocorrelation (normalized McLeod / YIN-style fundamental pitch detector)
 * tuned for piano fundamental pitches between C3 (130.81 Hz) and C5 (523.25 Hz).
 */
export function detectPitchFromBuffer(
  buffer: Float32Array,
  sampleRate: number,
  rmsThreshold = 0.018
): { frequency: number; rms: number } | null {
  const n = buffer.length;
  let sumSquares = 0;
  for (let i = 0; i < n; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSquares / n);
  if (rms < rmsThreshold) {
    return null;
  }

  // Piano C3..C5 search range: 115 Hz to 580 Hz
  const minLag = Math.floor(sampleRate / 580);
  const maxLag = Math.min(Math.ceil(sampleRate / 115), Math.floor(n / 2));

  // Difference function d(tau) and cumulative mean normalized difference d'(tau) (YIN algorithm)
  const yinBuffer = new Float32Array(maxLag + 1);
  yinBuffer[0] = 1;
  let runningSum = 0;

  for (let tau = 1; tau <= maxLag; tau++) {
    let diff = 0;
    for (let i = 0; i < maxLag; i++) {
      const delta = buffer[i] - buffer[i + tau];
      diff += delta * delta;
    }
    runningSum += diff;
    yinBuffer[tau] = runningSum > 0 ? (diff * tau) / runningSum : 1;
  }

  // Find first dip below threshold in [minLag, maxLag]
  const yinThreshold = 0.18;
  let bestTau = -1;

  for (let tau = minLag; tau <= maxLag; tau++) {
    if (yinBuffer[tau] < yinThreshold) {
      while (tau + 1 <= maxLag && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      bestTau = tau;
      break;
    }
  }

  // Fallback to global minimum in [minLag, maxLag] if reasonably periodic
  if (bestTau === -1) {
    let minVal = Infinity;
    for (let tau = minLag; tau <= maxLag; tau++) {
      if (yinBuffer[tau] < minVal) {
        minVal = yinBuffer[tau];
        bestTau = tau;
      }
    }
    if (minVal > 0.32) {
      return null;
    }
  }

  // Parabolic interpolation around bestTau for sub-sample precision
  let refinedTau = bestTau;
  if (bestTau > 1 && bestTau < maxLag) {
    const s0 = yinBuffer[bestTau - 1];
    const s1 = yinBuffer[bestTau];
    const s2 = yinBuffer[bestTau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (Math.abs(denom) > 1e-6) {
      refinedTau = bestTau + (s2 - s0) / denom;
    }
  }

  const frequency = sampleRate / refinedTau;
  return { frequency, rms };
}

export class MicrophonePitchListener {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private rmsThreshold = 0.018;

  public setSensitivity(rmsThreshold: number): void {
    this.rmsThreshold = rmsThreshold;
  }

  public async start(
    onDetect: (result: PitchDetectionResult | null, volumeLevel: number) => void
  ): Promise<boolean> {
    this.stop();
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      const source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      const buffer = new Float32Array(this.analyser.fftSize);

      const loop = () => {
        if (!this.analyser || !this.audioCtx) return;
        this.analyser.getFloatTimeDomainData(buffer);

        let sumSq = 0;
        for (let i = 0; i < buffer.length; i++) {
          sumSq += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sumSq / buffer.length);
        const volumeLevel = Math.min(1, rms * 12);

        const detected = detectPitchFromBuffer(buffer, this.audioCtx.sampleRate, this.rmsThreshold);
        if (detected) {
          const matched = frequencyToClosestNote(detected.frequency);
          if (matched) {
            onDetect(
              {
                note: matched.note,
                frequency: detected.frequency,
                centsOff: matched.centsOff,
                volume: volumeLevel,
              },
              volumeLevel
            );
          } else {
            onDetect(null, volumeLevel);
          }
        } else {
          onDetect(null, volumeLevel);
        }

        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  public stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
  }
}
