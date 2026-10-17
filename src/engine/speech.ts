import { isFireTablet } from './platform';

class SpeechNarrator {
  private enabled = true;
  private activeTimeout: ReturnType<typeof setTimeout> | null = null;

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public stop(): void {
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore Silk browser TTS errors
      }
    }
  }

  /**
   * Speaks kid-friendly instructions aloud.
   * Conditional safeguard: On Amazon Fire Tablet (`isFireTablet()`) or if no TTS voices exist,
   * ensures non-blocking execution so the app never stalls on a silent TTS callback.
   */
  public speak(text: string, onComplete?: () => void): void {
    this.stop();

    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onComplete?.();
      return;
    }

    const fireDevice = isFireTablet();

    try {
      const voices = window.speechSynthesis.getVoices();
      // If on Fire Tablet and Silk returns no voices, trigger fallback immediately
      if (fireDevice && (!voices || voices.length === 0)) {
        onComplete?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.96; // Clear, friendly storytelling pace for a 7-year-old
      utterance.pitch = 1.12; // Cheerful Maestro Unicorn tone

      if (voices && voices.length > 0) {
        const preferred =
          voices.find((v) => /Samantha|Victoria|Karen|Google US English|Moira|Tessa/i.test(v.name) && v.lang.startsWith('en')) ||
          voices.find((v) => v.lang.startsWith('en-US')) ||
          voices.find((v) => v.lang.startsWith('en'));
        if (preferred) {
          utterance.voice = preferred;
        }
      }

      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        if (this.activeTimeout) {
          clearTimeout(this.activeTimeout);
          this.activeTimeout = null;
        }
        onComplete?.();
      };

      utterance.onend = done;
      utterance.onerror = done;

      // Conditional safety timeout (especially important on Fire Tablet Silk Browser)
      const maxWaitMs = fireDevice ? 4500 : 12000;
      this.activeTimeout = setTimeout(done, maxWaitMs);

      window.speechSynthesis.speak(utterance);
    } catch {
      onComplete?.();
    }
  }
}

export const speechNarrator = new SpeechNarrator();
