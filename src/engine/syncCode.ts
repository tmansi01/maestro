import { ClefType, ColorMode, NamingConvention } from '../data/notes';
import {
  ArcadeGameMode,
  ArcadeLeaderboardEntry,
  DEFAULT_ARCADE_INITIAL_SECONDS,
  DEFAULT_RIVAL_LEADERBOARD,
  MAX_ARCADE_INITIAL_SECONDS,
  MIN_ARCADE_INITIAL_SECONDS,
  insertLeaderboardEntry,
} from '../data/arcade';

export interface SyncableProgress {
  unlockedWorld: number; // 1..8
  points: number;
  worldStars: Record<number, { piano: number; bubbles: number; mic: number; bossCleared: boolean; lessonDone: boolean }>;
  namingConvention: NamingConvention;
  colorMode: ColorMode;
  arcadeInitialSeconds?: number;
  arcadeLeaderboard?: ArcadeLeaderboardEntry[];
}

function toUtf8Base64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromUtf8Base64Url(b64Url: string): string {
  const raw = b64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = raw + '='.repeat((4 - (raw.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Encodes player progress (including custom Arcade Hall of Fame scores) into a compact Magic Unicorn Code
 * so she can transfer progress between her Amazon Fire Tablet, Google Chromebook, and MacBook!
 */
export function encodeSyncCode(state: SyncableProgress): string {
  const customEntries = (state.arcadeLeaderboard || [])
    .filter((e) => !e.isRival)
    .slice(0, 8)
    .map((e) => [
      e.playerName.slice(0, 14),
      e.avatar,
      e.score,
      e.notesCorrect,
      e.maxLevel,
      e.mode === 'bubbles' ? 1 : e.mode === 'mic' ? 2 : 0,
      e.clef === 'bass' ? 1 : e.clef === 'grand' ? 2 : 0,
    ]);

  const payload: Record<string, unknown> = {
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

  if (
    typeof state.arcadeInitialSeconds === 'number' &&
    state.arcadeInitialSeconds !== DEFAULT_ARCADE_INITIAL_SECONDS
  ) {
    payload.at = state.arcadeInitialSeconds;
  }

  if (customEntries.length > 0) {
    payload.lb = customEntries;
  }

  const json = JSON.stringify(payload);
  return `UNI-${toUtf8Base64Url(json)}`;
}

export function decodeSyncCode(code: string): SyncableProgress | null {
  try {
    const trimmed = code.trim();
    if (!trimmed.startsWith('UNI-')) return null;
    const json = fromUtf8Base64Url(trimmed.slice(4));
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

    let arcadeLeaderboard: ArcadeLeaderboardEntry[] | undefined;
    if (Array.isArray(parsed.lb)) {
      let board = [...DEFAULT_RIVAL_LEADERBOARD];
      parsed.lb.forEach((item: unknown, idx: number) => {
        if (Array.isArray(item) && item.length >= 7) {
          const mode: ArcadeGameMode =
            item[5] === 1 ? 'bubbles' : item[5] === 2 ? 'mic' : 'piano';
          const clef: ClefType =
            item[6] === 1 ? 'bass' : item[6] === 2 ? 'grand' : 'treble';
          board = insertLeaderboardEntry(board, {
            id: `sync-${Date.now()}-${idx}`,
            playerName: String(item[0] || 'Maestro'),
            avatar: String(item[1] || '🦄'),
            score: Math.max(0, Number(item[2]) || 0),
            notesCorrect: Math.max(0, Number(item[3]) || 0),
            maxLevel: Math.max(1, Number(item[4]) || 1),
            mode,
            clef,
            isRival: false,
            createdAt: Date.now() + idx,
          });
        }
      });
      arcadeLeaderboard = board;
    }

    const arcadeInitialSeconds =
      typeof parsed.at === 'number'
        ? Math.min(
            MAX_ARCADE_INITIAL_SECONDS,
            Math.max(MIN_ARCADE_INITIAL_SECONDS, Math.round(parsed.at))
          )
        : undefined;

    return {
      unlockedWorld: Math.min(8, Math.max(1, parsed.u)),
      points: Math.max(0, parsed.p),
      worldStars,
      namingConvention,
      colorMode,
      arcadeInitialSeconds,
      arcadeLeaderboard,
    };
  } catch {
    return null;
  }
}
