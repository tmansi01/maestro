import { ColorMode, NamingConvention } from '../data/notes';

export interface SyncableProgress {
  unlockedWorld: number; // 1..8
  points: number;
  worldStars: Record<number, { piano: number; bubbles: number; mic: number; bossCleared: boolean; lessonDone: boolean }>;
  namingConvention: NamingConvention;
  colorMode: ColorMode;
}

/**
 * Encodes player progress into a compact, kid-and-parent-friendly Magic Unicorn Code
 * so she can transfer her progress between her Amazon Fire Tablet, Google Chromebook, and MacBook!
 */
export function encodeSyncCode(state: SyncableProgress): string {
  const payload = {
    u: state.unlockedWorld,
    p: state.points,
    n: state.namingConvention === 'solfege' ? 1 : state.namingConvention === 'both' ? 2 : 0,
    c: state.colorMode === 'always' ? 1 : state.colorMode === 'off' ? 2 : 0,
    s: Object.entries(state.worldStars).map(([w, data]) => [
      Number(w),
      data.piano,
      data.bubbles,
      data.mic,
      data.bossCleared ? 1 : 0,
      data.lessonDone ? 1 : 0,
    ]),
  };

  const json = JSON.stringify(payload);
  const base64 = btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `UNI-${base64}`;
}

export function decodeSyncCode(code: string): SyncableProgress | null {
  try {
    const trimmed = code.trim();
    if (!trimmed.startsWith('UNI-')) return null;
    const raw = trimmed.slice(4).replace(/-/g, '+').replace(/_/g, '/');
    const padded = raw + '='.repeat((4 - (raw.length % 4)) % 4);
    const json = atob(padded);
    const parsed = JSON.parse(json);

    if (typeof parsed.u !== 'number' || typeof parsed.p !== 'number' || !Array.isArray(parsed.s)) {
      return null;
    }

    const worldStars: SyncableProgress['worldStars'] = {};
    for (let w = 1; w <= 8; w++) {
      worldStars[w] = { piano: 0, bubbles: 0, mic: 0, bossCleared: false, lessonDone: false };
    }

    for (const row of parsed.s) {
      if (Array.isArray(row) && row.length >= 6) {
        const w = Number(row[0]);
        if (w >= 1 && w <= 8) {
          worldStars[w] = {
            piano: Math.min(3, Math.max(0, Number(row[1]) || 0)),
            bubbles: Math.min(3, Math.max(0, Number(row[2]) || 0)),
            mic: Math.min(3, Math.max(0, Number(row[3]) || 0)),
            bossCleared: Boolean(row[4]),
            lessonDone: Boolean(row[5]),
          };
        }
      }
    }

    const namingConvention: NamingConvention =
      parsed.n === 1 ? 'solfege' : parsed.n === 2 ? 'both' : 'letters';
    const colorMode: ColorMode =
      parsed.c === 1 ? 'always' : parsed.c === 2 ? 'off' : 'progressive';

    return {
      unlockedWorld: Math.min(8, Math.max(1, parsed.u)),
      points: Math.max(0, parsed.p),
      worldStars,
      namingConvention,
      colorMode,
    };
  } catch {
    return null;
  }
}
