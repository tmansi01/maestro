import { useState, useEffect, useCallback } from 'react';
import { ClefType, ColorMode, NamingConvention, NoteId } from '../data/notes';
import { WORLDS } from '../data/curriculum';
import {
  ArcadeLeaderboardEntry,
  DEFAULT_ARCADE_INITIAL_SECONDS,
  DEFAULT_RIVAL_LEADERBOARD,
  insertLeaderboardEntry,
} from '../data/arcade';
import { decodeSyncCode, encodeSyncCode } from '../engine/syncCode';

export type GameMode = 'piano' | 'bubbles' | 'mic';

export interface WorldProgress {
  lessonDone: boolean;
  piano: number; // 0..3 stars
  bubbles: number; // 0..3 stars
  mic: number; // 0..3 stars
  bossCleared: boolean;
  speedBadge: boolean;
}

export interface EquippedAccessories {
  hat?: string;
  glasses?: string;
  neck?: string;
  wings?: string;
}

export interface PlayerState {
  unlockedWorld: number; // 1..8 (World 1 unlocked initially; Worlds 2..8 unlock sequentially)
  points: number;
  worldStars: Record<number, WorldProgress>;
  unlockedAccessories: string[];
  equippedAccessories: EquippedAccessories;
  unlockedStickers: string[];
  namingConvention: NamingConvention;
  colorMode: ColorMode;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  micSensitivity: number; // RMS threshold (default 0.018)
  arcadeInitialSeconds: number; // Level 1 Arcade timer in seconds (default 20s)
  trickyNotesCount: Partial<Record<NoteId, number>>;
  arcadeLeaderboard: ArcadeLeaderboardEntry[];
  lastArcadePlayerName: string;
  lastArcadeAvatar: string;
}

const STORAGE_KEY = 'maestro_unicorn_save_v1';

export function createInitialPlayerState(): PlayerState {
  const worldStars: Record<number, WorldProgress> = {};
  for (let w = 1; w <= 8; w++) {
    worldStars[w] = {
      lessonDone: false,
      piano: 0,
      bubbles: 0,
      mic: 0,
      bossCleared: false,
      speedBadge: false,
    };
  }

  return {
    unlockedWorld: 1,
    points: 50, // Starter welcome points!
    worldStars,
    unlockedAccessories: [],
    equippedAccessories: {},
    unlockedStickers: [],
    namingConvention: 'letters',
    colorMode: 'progressive',
    soundEnabled: true,
    voiceEnabled: true,
    micSensitivity: 0.018,
    arcadeInitialSeconds: DEFAULT_ARCADE_INITIAL_SECONDS,
    trickyNotesCount: {},
    arcadeLeaderboard: [...DEFAULT_RIVAL_LEADERBOARD],
    lastArcadePlayerName: '',
    lastArcadeAvatar: '🦄',
  };
}

/**
 * Generates a dynamic, balanced note queue for a game session.
 * Weights slightly toward notes she previously missed (`trickyNotesCount`)
 * and prevents more than 2 identical notes in a row.
 */
export function generateDynamicNoteQueue(
  notePool: NoteId[],
  length = 10,
  trickyNotesCount: Partial<Record<NoteId, number>> = {}
): NoteId[] {
  if (notePool.length === 0) return ['C4'];
  if (notePool.length === 1) return Array(length).fill(notePool[0]);

  const weightedPool: NoteId[] = [];
  for (const n of notePool) {
    const missCount = trickyNotesCount[n] || 0;
    const weight = 2 + Math.min(3, missCount);
    for (let i = 0; i < weight; i++) {
      weightedPool.push(n);
    }
  }

  const queue: NoteId[] = [];
  // Ensure every note in the pool appears at least once first
  const shuffledBase = [...notePool].sort(() => Math.random() - 0.5);
  for (const n of shuffledBase) {
    if (queue.length < length) {
      queue.push(n);
    }
  }

  while (queue.length < length) {
    const candidate = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    const prev1 = queue[queue.length - 1];
    const prev2 = queue[queue.length - 2];
    if (candidate === prev1 && candidate === prev2) {
      const alternatives = notePool.filter((n) => n !== candidate);
      queue.push(alternatives[Math.floor(Math.random() * alternatives.length)]);
    } else {
      queue.push(candidate);
    }
  }

  // Shuffle while avoiding 3 identical consecutive notes
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  return queue;
}

/**
 * Spaced Repetition helper: inserts a missed note 3 steps ahead in the queue
 * (or at the end of the queue if fewer than 3 questions remain) so she practices it again!
 */
export function requeueMissedNote(
  queue: NoteId[],
  currentIndex: number,
  missedNote: NoteId,
  maxQueueLength = 16
): NoteId[] {
  if (queue.length >= maxQueueLength) return queue;
  const insertAt = Math.min(queue.length, currentIndex + 3);
  const nextQueue = [...queue];
  nextQueue.splice(insertAt, 0, missedNote);
  return nextQueue;
}

/**
 * Determines whether color scaffolding should be active on the staff for a given world & mode.
 */
export function shouldUseNoteColors(
  colorMode: ColorMode,
  currentModeStars: number,
  mistakeCountOnCurrentNote: number
): boolean {
  // Always show color when a hint is triggered (1st or 2nd mistake)
  if (mistakeCountOnCurrentNote > 0) return true;
  if (colorMode === 'always') return true;
  if (colorMode === 'off') return false;
  // Progressive mode: show colors on 0-star runs (first time learning), then transition to classic black & white sheet music for 2nd/3rd star runs!
  return currentModeStars === 0;
}

export function useGameStore() {
  const [state, setState] = useState<PlayerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const init = createInitialPlayerState();
        return {
          ...init,
          ...parsed,
          worldStars: { ...init.worldStars, ...(parsed.worldStars || {}) },
          arcadeLeaderboard:
            Array.isArray(parsed.arcadeLeaderboard) && parsed.arcadeLeaderboard.length > 0
              ? parsed.arcadeLeaderboard
              : init.arcadeLeaderboard,
        };
      }
    } catch {
      // Fallback to initial state
    }
    return createInitialPlayerState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const completeLesson = useCallback((worldId: number) => {
    setState((prev) => {
      const current = prev.worldStars[worldId] || {
        lessonDone: false,
        piano: 0,
        bubbles: 0,
        mic: 0,
        bossCleared: false,
        speedBadge: false,
      };
      const bonus = current.lessonDone ? 10 : 30;
      return {
        ...prev,
        points: prev.points + bonus,
        worldStars: {
          ...prev.worldStars,
          [worldId]: {
            ...current,
            lessonDone: true,
          },
        },
      };
    });
  }, []);

  const recordGameResult = useCallback(
    (
      worldId: number,
      mode: GameMode,
      starsEarned: number,
      pointsEarned: number,
      missedNotes: NoteId[],
      wasSpeedChallenge = false
    ) => {
      setState((prev) => {
        const current = prev.worldStars[worldId] || {
          lessonDone: true,
          piano: 0,
          bubbles: 0,
          mic: 0,
          bossCleared: false,
          speedBadge: false,
        };

        const updatedTricky = { ...prev.trickyNotesCount };
        for (const n of missedNotes) {
          updatedTricky[n] = (updatedTricky[n] || 0) + 1;
        }

        const newModeStars = Math.max(current[mode], starsEarned);
        const newSpeedBadge = current.speedBadge || (wasSpeedChallenge && starsEarned >= 2);

        return {
          ...prev,
          points: prev.points + pointsEarned,
          trickyNotesCount: updatedTricky,
          worldStars: {
            ...prev.worldStars,
            [worldId]: {
              ...current,
              [mode]: newModeStars,
              speedBadge: newSpeedBadge,
            },
          },
        };
      });
    },
    []
  );

  const completeBossConcert = useCallback((worldId: number, pointsEarned: number) => {
    setState((prev) => {
      const current = prev.worldStars[worldId] || {
        lessonDone: true,
        piano: 1,
        bubbles: 0,
        mic: 0,
        bossCleared: false,
        speedBadge: false,
      };

      const nextWorldToUnlock = Math.min(WORLDS.length, Math.max(prev.unlockedWorld, worldId + 1));

      return {
        ...prev,
        unlockedWorld: nextWorldToUnlock,
        points: prev.points + pointsEarned,
        worldStars: {
          ...prev.worldStars,
          [worldId]: {
            ...current,
            bossCleared: true,
          },
        },
      };
    });
  }, []);

  /**
   * Credits Boutique Sparkles & updates tricky note weights at the end of an Arcade Run,
   * and optionally saves a new entry into the Top 10 Hall of Fame Leaderboard!
   */
  const recordArcadeRun = useCallback(
    (params: {
      sparklesEarned: number;
      missedNotes: NoteId[];
      leaderboardEntry?: Omit<ArcadeLeaderboardEntry, 'id' | 'createdAt'>;
    }) => {
      setState((prev) => {
        const updatedTricky = { ...prev.trickyNotesCount };
        for (const n of params.missedNotes) {
          updatedTricky[n] = (updatedTricky[n] || 0) + 1;
        }

        let nextLeaderboard = prev.arcadeLeaderboard;
        let nextName = prev.lastArcadePlayerName;
        let nextAvatar = prev.lastArcadeAvatar;

        if (params.leaderboardEntry) {
          const cleanName = params.leaderboardEntry.playerName.trim() || 'Super Pianist';
          nextName = cleanName;
          nextAvatar = params.leaderboardEntry.avatar;
          nextLeaderboard = insertLeaderboardEntry(prev.arcadeLeaderboard, {
            ...params.leaderboardEntry,
            playerName: cleanName,
            id: `player-${Date.now()}`,
            createdAt: Date.now(),
          });
        }

        return {
          ...prev,
          points: prev.points + Math.max(0, params.sparklesEarned),
          trickyNotesCount: updatedTricky,
          arcadeLeaderboard: nextLeaderboard,
          lastArcadePlayerName: nextName,
          lastArcadeAvatar: nextAvatar,
        };
      });
    },
    []
  );

  const resetArcadeLeaderboard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      arcadeLeaderboard: [...DEFAULT_RIVAL_LEADERBOARD],
    }));
  }, []);

  const buyOrEquipAccessory = useCallback(
    (accessoryId: string, category: 'hat' | 'glasses' | 'neck' | 'wings', cost: number) => {
      setState((prev) => {
        const isOwned = prev.unlockedAccessories.includes(accessoryId);
        if (!isOwned && prev.points < cost) return prev;

        const currentlyEquipped = prev.equippedAccessories[category] === accessoryId;
        const nextEquipped = {
          ...prev.equippedAccessories,
          [category]: currentlyEquipped ? undefined : accessoryId,
        };

        return {
          ...prev,
          points: isOwned ? prev.points : prev.points - cost,
          unlockedAccessories: isOwned
            ? prev.unlockedAccessories
            : [...prev.unlockedAccessories, accessoryId],
          equippedAccessories: nextEquipped,
        };
      });
    },
    []
  );

  const buySticker = useCallback((stickerId: string, cost: number) => {
    setState((prev) => {
      if (prev.unlockedStickers.includes(stickerId) || prev.points < cost) return prev;
      return {
        ...prev,
        points: prev.points - cost,
        unlockedStickers: [...prev.unlockedStickers, stickerId],
      };
    });
  }, []);

  const updateSettings = useCallback(
    (
      partial: Partial<
        Pick<
          PlayerState,
          | 'namingConvention'
          | 'colorMode'
          | 'soundEnabled'
          | 'voiceEnabled'
          | 'micSensitivity'
          | 'arcadeInitialSeconds'
          | 'unlockedWorld'
        >
      >
    ) => {
      setState((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const unlockAllWorlds = useCallback(() => {
    setState((prev) => ({
      ...prev,
      unlockedWorld: WORLDS.length,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = createInitialPlayerState();
    setState(fresh);
  }, []);

  const getSyncCode = useCallback(() => {
    return encodeSyncCode({
      unlockedWorld: state.unlockedWorld,
      points: state.points,
      worldStars: state.worldStars,
      namingConvention: state.namingConvention,
      colorMode: state.colorMode,
      arcadeInitialSeconds: state.arcadeInitialSeconds,
      arcadeLeaderboard: state.arcadeLeaderboard,
    });
  }, [state]);

  const applySyncCode = useCallback((code: string): boolean => {
    const decoded = decodeSyncCode(code);
    if (!decoded) return false;

    setState((prev) => {
      const mergedStars = { ...prev.worldStars };
      for (const [wStr, s] of Object.entries(decoded.worldStars)) {
        const w = Number(wStr);
        mergedStars[w] = {
          ...(mergedStars[w] || { speedBadge: false }),
          ...s,
        };
      }
      return {
        ...prev,
        unlockedWorld: decoded.unlockedWorld,
        points: decoded.points,
        worldStars: mergedStars,
        namingConvention: decoded.namingConvention,
        colorMode: decoded.colorMode,
        arcadeInitialSeconds:
          decoded.arcadeInitialSeconds ?? prev.arcadeInitialSeconds,
        arcadeLeaderboard: decoded.arcadeLeaderboard || prev.arcadeLeaderboard,
      };
    });
    return true;
  }, []);

  return {
    state,
    completeLesson,
    recordGameResult,
    completeBossConcert,
    recordArcadeRun,
    resetArcadeLeaderboard,
    buyOrEquipAccessory,
    buySticker,
    updateSettings,
    unlockAllWorlds,
    resetProgress,
    getSyncCode,
    applySyncCode,
  };
}

export interface FreePracticeConfig {
  clef: ClefType;
  selectedNotes: NoteId[];
  mode: GameMode;
}
