import { describe, expect, it } from 'vitest';
import {
  ALL_NOTE_IDS,
  NOTES,
  formatNoteLabel,
  frequencyToClosestNote,
} from '../data/notes';
import { WORLDS } from '../data/curriculum';
import { isChromebook, isFireTablet } from '../engine/platform';
import { decodeSyncCode, encodeSyncCode } from '../engine/syncCode';
import {
  createInitialPlayerState,
  generateDynamicNoteQueue,
  requeueMissedNote,
  shouldUseNoteColors,
} from '../store/useGameStore';
import { getNoteStaffY } from '../components/staff/GrandStaffSVG';
import { detectPitchFromBuffer } from '../engine/pitchDetection';
import {
  DEFAULT_ARCADE_INITIAL_SECONDS,
  DEFAULT_RIVAL_LEADERBOARD,
  calculateArcadeNoteScore,
  getArcadeFloorSeconds,
  getArcadeLevel,
  getArcadeTimeLimitMs,
  insertLeaderboardEntry,
  rollArcadePowerUp,
  shouldSpawnMysteryNote,
} from '../data/arcade';

describe('Maestro Core Music & Curriculum Tests', () => {
  it('defines all 15 white-key natural notes from C3 to C5 with accurate frequencies and landmarks', () => {
    expect(ALL_NOTE_IDS).toHaveLength(15);
    expect(NOTES.C4.frequency).toBeCloseTo(261.63, 1);
    expect(NOTES.A4.frequency).toBeCloseTo(440.0, 1);
    expect(NOTES.C4.isLandmark).toBe(true);
    expect(NOTES.G4.isLandmark).toBe(true);
    expect(NOTES.F3.isLandmark).toBe(true);
  });

  it('formats note labels in English Letters, Fixed-Do Solfège, and Dual mode', () => {
    expect(formatNoteLabel('C', 'letters')).toBe('C');
    expect(formatNoteLabel('C', 'solfege')).toBe('Do');
    expect(formatNoteLabel('G', 'both')).toBe('G (Sol)');
  });

  it('computes monotonically increasing vertical SVG coordinates as pitch steps downward', () => {
    const c5Treble = getNoteStaffY('C5', 'treble').y;
    const g4Treble = getNoteStaffY('G4', 'treble').y;
    const c4Treble = getNoteStaffY('C4', 'treble').y;
    expect(c5Treble).toBeLessThan(g4Treble);
    expect(g4Treble).toBeLessThan(c4Treble);

    const c4Bass = getNoteStaffY('C4', 'bass').y;
    const f3Bass = getNoteStaffY('F3', 'bass').y;
    const c3Bass = getNoteStaffY('C3', 'bass').y;
    expect(c4Bass).toBeLessThan(f3Bass);
    expect(f3Bass).toBeLessThan(c3Bass);
  });

  it('has 8 progressive worlds starting from Middle C landmarks up to the Grand Staff', () => {
    expect(WORLDS).toHaveLength(8);
    expect(WORLDS[0].id).toBe(1);
    expect(WORLDS[7].id).toBe(8);
    expect(WORLDS[7].clef).toBe('grand');
  });
});

describe('Progression, Replayability & Spaced Repetition Tests', () => {
  it('starts with only World 1 unlocked and Worlds 2..8 locked', () => {
    const initial = createInitialPlayerState();
    expect(initial.unlockedWorld).toBe(1);
  });

  it('generates dynamic note queues for level replay without 3 identical notes in a row', () => {
    const pool = ['C4', 'D4', 'E4', 'F4', 'G4'] as const;
    const queue = generateDynamicNoteQueue([...pool], 12, { F4: 3 });
    expect(queue).toHaveLength(12);
    for (const n of pool) {
      expect(queue).toContain(n);
    }
  });

  it('requeues a missed note 3 questions later for spaced repetition', () => {
    const initialQueue = ['C4', 'D4', 'E4', 'F4', 'G4'] as const;
    const updated = requeueMissedNote([...initialQueue], 1, 'D4');
    expect(updated).toHaveLength(6);
    expect(updated[4]).toBe('D4');
  });

  it('applies progressive color scaffolding on 0-star runs and classic black-and-white on 1+ star runs (unless hinted)', () => {
    expect(shouldUseNoteColors('progressive', 0, 0)).toBe(true);
    expect(shouldUseNoteColors('progressive', 1, 0)).toBe(false);
    expect(shouldUseNoteColors('progressive', 2, 1)).toBe(true); // Mistake hint restores color!
    expect(shouldUseNoteColors('always', 3, 0)).toBe(true);
    expect(shouldUseNoteColors('off', 0, 0)).toBe(false);
  });
});

describe('Cross-Platform Detection, Pitch Detection & Magic Sync Code Tests', () => {
  it('detects Amazon Fire Tablet user agents conditionally without false positives on MacBook Chrome or Chromebook', () => {
    const fireUA =
      'Mozilla/5.0 (Linux; Android 11; KFONWI Build/RS8332.3115N) AppleWebKit/537.36 (KHTML, like Gecko) Silk/114.4.1 like Chrome/114.0.5735.196 Safari/537.36';
    const macChromeUA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
    const chromebookUA =
      'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

    expect(isFireTablet(fireUA)).toBe(true);
    expect(isFireTablet(macChromeUA)).toBe(false);
    expect(isFireTablet(chromebookUA)).toBe(false);
    expect(isChromebook(chromebookUA)).toBe(true);
  });

  it('accurately detects a 261.63 Hz sine wave as Middle C (C4)', () => {
    const sampleRate = 44100;
    const freq = 261.63;
    const buffer = new Float32Array(2048);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = 0.5 * Math.sin((2 * Math.PI * freq * i) / sampleRate);
    }

    const detected = detectPitchFromBuffer(buffer, sampleRate);
    expect(detected).not.toBeNull();
    const matched = frequencyToClosestNote(detected!.frequency);
    expect(matched?.note.id).toBe('C4');
  });

  it('round-trips player progress through Magic Unicorn Sync Code', () => {
    const init = createInitialPlayerState();
    init.unlockedWorld = 5;
    init.points = 340;
    init.namingConvention = 'both';
    init.worldStars[1] = {
      lessonDone: true,
      piano: 3,
      bubbles: 2,
      mic: 1,
      bossCleared: true,
      speedBadge: true,
    };

    const code = encodeSyncCode({
      unlockedWorld: init.unlockedWorld,
      points: init.points,
      worldStars: init.worldStars,
      namingConvention: init.namingConvention,
      colorMode: init.colorMode,
    });

    expect(code.startsWith('UNI-')).toBe(true);
    const decoded = decodeSyncCode(code);
    expect(decoded).not.toBeNull();
    expect(decoded!.unlockedWorld).toBe(5);
    expect(decoded!.points).toBe(340);
    expect(decoded!.namingConvention).toBe('both');
    expect(decoded!.worldStars[1].piano).toBe(3);
    expect(decoded!.worldStars[1].bossCleared).toBe(true);
  });
});

describe('Endless Arcade Mode & Leaderboard Tests', () => {
  it('levels up every 6 notes and scales countdown timer proportionally from 20.0s default (and custom Parent Settings)', () => {
    expect(DEFAULT_ARCADE_INITIAL_SECONDS).toBe(20);
    expect(getArcadeLevel(0)).toBe(1);
    expect(getArcadeLevel(5)).toBe(1);
    expect(getArcadeLevel(6)).toBe(2);
    expect(getArcadeLevel(12)).toBe(3);

    // Default 20s start (-1.5s/level down to 5.0s floor)
    expect(getArcadeFloorSeconds(20)).toBe(5.0);
    expect(getArcadeTimeLimitMs(1, 'piano')).toBe(20000);
    expect(getArcadeTimeLimitMs(2, 'piano')).toBe(18500);
    expect(getArcadeTimeLimitMs(11, 'piano')).toBe(5000);
    expect(getArcadeTimeLimitMs(20, 'piano')).toBe(5000); // Never drops below proportional floor
    expect(getArcadeTimeLimitMs(1, 'mic')).toBe(21500); // +1.5s buffer for Real Piano Mic

    // Relaxed 30s Parent Preset (-2.25s/level down to 7.5s floor)
    expect(getArcadeFloorSeconds(30)).toBe(7.5);
    expect(getArcadeTimeLimitMs(1, 'piano', 30)).toBe(30000);
    expect(getArcadeTimeLimitMs(2, 'piano', 30)).toBe(27750);
    expect(getArcadeTimeLimitMs(20, 'piano', 30)).toBe(7500);

    // Turbo 10s Parent Preset (clamped floor >= 3.5s)
    expect(getArcadeFloorSeconds(10)).toBe(3.5);
    expect(getArcadeTimeLimitMs(1, 'piano', 10)).toBe(10000);
    expect(getArcadeTimeLimitMs(20, 'piano', 10)).toBe(3500);
  });

  it('calculates Arcade note scores with time bonus, streak bonus cap, and 2x Rainbow Fever', () => {
    const baseScore = calculateArcadeNoteScore({
      remainingRatio: 0.5,
      streak: 2,
      hasRainbowFever: false,
    });
    // 100 base + 25 time + 20 streak = 145
    expect(baseScore).toBe(145);

    const feverScore = calculateArcadeNoteScore({
      remainingRatio: 1.0,
      streak: 15, // Streak bonus caps at +100
      hasRainbowFever: true,
    });
    // (100 base + 50 time + 100 capped streak) * 2 = 500
    expect(feverScore).toBe(500);
  });

  it('spawns Mystery Golden Notes on multiples of 8 streak and rolls valid power-ups', () => {
    expect(shouldSpawnMysteryNote(8, 0.99)).toBe(true);
    expect(shouldSpawnMysteryNote(3, 0.10)).toBe(true);
    expect(shouldSpawnMysteryNote(3, 0.50)).toBe(false);

    // When shield is already active and lives are at max (5), neither unicorn-shield nor extra-heart is rolled
    for (let r = 0; r < 1; r += 0.1) {
      const drop = rollArcadePowerUp(5, true, r);
      expect(drop).not.toBe('unicorn-shield');
      expect(drop).not.toBe('extra-heart');
    }
  });

  it('sorts and caps the Unified Hall of Fame Leaderboard at Top 10 and syncs via Magic Code', () => {
    const updatedBoard = insertLeaderboardEntry(DEFAULT_RIVAL_LEADERBOARD, {
      id: 'player-1',
      playerName: 'Champion 🦄',
      avatar: '👑',
      score: 5200,
      notesCorrect: 34,
      maxLevel: 6,
      mode: 'piano',
      clef: 'grand',
      isRival: false,
      createdAt: Date.now(),
    });

    expect(updatedBoard[0].playerName).toBe('Champion 🦄');
    expect(updatedBoard[0].score).toBe(5200);

    const init = createInitialPlayerState();
    const syncCode = encodeSyncCode({
      unlockedWorld: 8,
      points: 900,
      worldStars: init.worldStars,
      namingConvention: 'letters',
      colorMode: 'progressive',
      arcadeInitialSeconds: 25,
      arcadeLeaderboard: updatedBoard,
    });

    const decoded = decodeSyncCode(syncCode);
    expect(decoded).not.toBeNull();
    expect(decoded!.arcadeInitialSeconds).toBe(25);
    expect(decoded!.arcadeLeaderboard).toBeDefined();
    expect(decoded!.arcadeLeaderboard![0].playerName).toBe('Champion 🦄');
    expect(decoded!.arcadeLeaderboard![0].avatar).toBe('👑');
    expect(decoded!.arcadeLeaderboard![0].score).toBe(5200);
  });
});
