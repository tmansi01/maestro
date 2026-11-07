import { ClefType, NoteId } from './notes';

export type ArcadeGameMode = 'piano' | 'bubbles' | 'mic';

export type ArcadePowerUpType =
  | 'extra-heart'
  | 'ice-freeze'
  | 'rainbow-fever'
  | 'unicorn-shield'
  | 'sparkle-chest';

export interface ArcadePowerUpDefinition {
  type: ArcadePowerUpType;
  title: string;
  emoji: string;
  description: string;
  badgeColor: string;
}

export interface ArcadeLeaderboardEntry {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  notesCorrect: number;
  maxLevel: number;
  mode: ArcadeGameMode;
  clef: ClefType;
  isRival?: boolean;
  createdAt: number;
}

export interface ArcadeSetupConfig {
  clef: ClefType;
  selectedNotes: NoteId[];
  mode: ArcadeGameMode;
}

export const ARCADE_INITIAL_LIVES = 3;
export const ARCADE_MAX_LIVES = 5;
export const ARCADE_NOTES_PER_LEVEL = 6;
export const ARCADE_PAUSE_LEARN_MS = 2000;
export const DEFAULT_ARCADE_INITIAL_SECONDS = 20;
export const MIN_ARCADE_INITIAL_SECONDS = 8;
export const MAX_ARCADE_INITIAL_SECONDS = 35;

export const ARCADE_AVATARS: string[] = [
  '🦄',
  '👧',
  '👑',
  '🌟',
  '🎹',
  '🦋',
  '🦊',
  '🚀',
  '🐬',
  '🐉',
];

export const ARCADE_POWER_UPS: Record<ArcadePowerUpType, ArcadePowerUpDefinition> = {
  'extra-heart': {
    type: 'extra-heart',
    title: 'Extra Heart!',
    emoji: '❤️',
    description: '+1 Life Heart restored!',
    badgeColor: '#f43f5e',
  },
  'ice-freeze': {
    type: 'ice-freeze',
    title: 'Ice Freeze!',
    emoji: '❄️',
    description: 'Timer moves at half speed for 3 notes!',
    badgeColor: '#06b6d4',
  },
  'rainbow-fever': {
    type: 'rainbow-fever',
    title: '2x Rainbow Fever!',
    emoji: '🌈',
    description: 'Double Arcade points for the next 5 notes!',
    badgeColor: '#d946ef',
  },
  'unicorn-shield': {
    type: 'unicorn-shield',
    title: 'Unicorn Shield!',
    emoji: '🛡️',
    description: 'Blocks your next mistake or timeout!',
    badgeColor: '#8b5cf6',
  },
  'sparkle-chest': {
    type: 'sparkle-chest',
    title: 'Boutique Sparkle Chest!',
    emoji: '🎁',
    description: '+50 Boutique Sparkles unlocked!',
    badgeColor: '#f59e0b',
  },
};

export const DEFAULT_RIVAL_LEADERBOARD: ArcadeLeaderboardEntry[] = [
  {
    id: 'rival-1',
    playerName: 'Maestro Starlight',
    avatar: '🦄',
    score: 4500,
    notesCorrect: 28,
    maxLevel: 5,
    mode: 'piano',
    clef: 'grand',
    isRival: true,
    createdAt: 1700000005,
  },
  {
    id: 'rival-2',
    playerName: 'DJ Pegasus',
    avatar: '🦋',
    score: 3000,
    notesCorrect: 20,
    maxLevel: 4,
    mode: 'piano',
    clef: 'treble',
    isRival: true,
    createdAt: 1700000004,
  },
  {
    id: 'rival-3',
    playerName: 'Crystal Dragon',
    avatar: '🐉',
    score: 1800,
    notesCorrect: 13,
    maxLevel: 3,
    mode: 'bubbles',
    clef: 'bass',
    isRival: true,
    createdAt: 1700000003,
  },
  {
    id: 'rival-4',
    playerName: 'Treble Dolphin',
    avatar: '🐬',
    score: 1000,
    notesCorrect: 8,
    maxLevel: 2,
    mode: 'bubbles',
    clef: 'treble',
    isRival: true,
    createdAt: 1700000002,
  },
  {
    id: 'rival-5',
    playerName: 'Whisker Cat',
    avatar: '🐱',
    score: 400,
    notesCorrect: 4,
    maxLevel: 1,
    mode: 'piano',
    clef: 'treble',
    isRival: true,
    createdAt: 1700000001,
  },
];

/**
 * Computes the Arcade level (1+) based on how many notes have been answered right so far.
 * Advances +1 level every 6 correct notes!
 */
export function getArcadeLevel(notesCorrect: number): number {
  return Math.floor(Math.max(0, notesCorrect) / ARCADE_NOTES_PER_LEVEL) + 1;
}

/**
 * Computes the fastest high-level floor in seconds for a given Level 1 starting duration.
 * Scales proportionally to 25% of starting time (rounded to nearest 0.5s, bounded >= 3.5s).
 */
export function getArcadeFloorSeconds(
  initialSeconds = DEFAULT_ARCADE_INITIAL_SECONDS
): number {
  const clampedStart = Math.min(
    MAX_ARCADE_INITIAL_SECONDS,
    Math.max(MIN_ARCADE_INITIAL_SECONDS, initialSeconds)
  );
  return Math.max(3.5, Math.round(clampedStart * 0.25 * 2) / 2);
}

/**
 * Computes the per-note countdown duration in milliseconds for a given Arcade level, mode,
 * and parent-configured Level 1 starting time (defaults to 20s).
 * Decreases by 7.5% of starting time per level (e.g. -1.5s/level at 20s) down to `getArcadeFloorSeconds`.
 * Adds +1.5s acoustic pitch-detection buffer when playing in Real Piano Mic mode.
 */
export function getArcadeTimeLimitMs(
  level: number,
  mode: ArcadeGameMode = 'piano',
  initialSeconds = DEFAULT_ARCADE_INITIAL_SECONDS
): number {
  const clampedLevel = Math.max(1, level);
  const clampedStart = Math.min(
    MAX_ARCADE_INITIAL_SECONDS,
    Math.max(MIN_ARCADE_INITIAL_SECONDS, initialSeconds)
  );
  const stepPerLevel = Math.max(0.75, clampedStart * 0.075);
  const floorSeconds = getArcadeFloorSeconds(clampedStart);
  const baseSeconds = Math.max(
    floorSeconds,
    clampedStart - (clampedLevel - 1) * stepPerLevel
  );
  const micBonusSeconds = mode === 'mic' ? 1.5 : 0;
  return Math.round((baseSeconds + micBonusSeconds) * 1000);
}

/**
 * Calculates Arcade points earned for a single correct note.
 */
export function calculateArcadeNoteScore(params: {
  remainingRatio: number; // 0.0 to 1.0
  streak: number; // current consecutive streak (1+)
  hasRainbowFever: boolean;
}): number {
  const clampedRatio = Math.min(1, Math.max(0, params.remainingRatio));
  const basePoints = 100;
  const timeBonus = Math.round(clampedRatio * 50); // 0..50
  const streakBonus = Math.min(100, Math.max(0, params.streak) * 10); // 10..100
  const multiplier = params.hasRainbowFever ? 2 : 1;
  return (basePoints + timeBonus + streakBonus) * multiplier;
}

/**
 * Rolls whether the next note in Arcade Mode should be a shimmering Mystery Golden Note.
 * Guaranteed on every multiple of 8 streak, otherwise ~18% random chance.
 */
export function shouldSpawnMysteryNote(nextStreakPotential: number, randomVal = Math.random()): boolean {
  if (nextStreakPotential > 0 && nextStreakPotential % 8 === 0) {
    return true;
  }
  return randomVal < 0.18;
}

/**
 * Picks a random Mystery Power-Up, smartly avoiding redundant drops when possible
 * (e.g., if shield is already active, picks from the other power-ups).
 */
export function rollArcadePowerUp(
  currentLives: number,
  hasShield: boolean,
  randomVal = Math.random()
): ArcadePowerUpType {
  const pool: ArcadePowerUpType[] = [];

  // Weight extra-heart higher if player is low on lives!
  if (currentLives < ARCADE_INITIAL_LIVES) {
    pool.push('extra-heart', 'extra-heart');
  } else if (currentLives < ARCADE_MAX_LIVES) {
    pool.push('extra-heart');
  }

  pool.push('ice-freeze', 'rainbow-fever', 'sparkle-chest');

  if (!hasShield) {
    pool.push('unicorn-shield');
  }

  const index = Math.min(pool.length - 1, Math.floor(randomVal * pool.length));
  return pool[index];
}

/**
 * Inserts a new Leaderboard entry, sorts descending by score (then notesCorrect),
 * and keeps the Top 10 Hall of Fame entries.
 */
export function insertLeaderboardEntry(
  existing: ArcadeLeaderboardEntry[],
  entry: ArcadeLeaderboardEntry,
  maxEntries = 10
): ArcadeLeaderboardEntry[] {
  const combined = [...existing, entry];
  combined.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.notesCorrect - a.notesCorrect;
  });
  return combined.slice(0, maxEntries);
}
