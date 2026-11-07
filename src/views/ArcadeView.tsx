import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Flame,
  Heart,
  Play,
  RotateCcw,
  Settings,
  Shield,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Timer,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';
import { WORLDS } from '../data/curriculum';
import {
  ALL_NOTE_IDS,
  ClefType,
  ColorMode,
  NamingConvention,
  NOTES,
  NoteId,
  NoteLetter,
  formatNoteDisplayName,
  formatNoteLabel,
} from '../data/notes';
import {
  ARCADE_AVATARS,
  ARCADE_INITIAL_LIVES,
  ARCADE_MAX_LIVES,
  ARCADE_NOTES_PER_LEVEL,
  ARCADE_PAUSE_LEARN_MS,
  ARCADE_POWER_UPS,
  ArcadeGameMode,
  ArcadeLeaderboardEntry,
  ArcadePowerUpDefinition,
  DEFAULT_ARCADE_INITIAL_SECONDS,
  calculateArcadeNoteScore,
  getArcadeLevel,
  getArcadeTimeLimitMs,
  rollArcadePowerUp,
  shouldSpawnMysteryNote,
} from '../data/arcade';
import { PlayerState } from '../store/useGameStore';
import { GrandStaffSVG } from '../components/staff/GrandStaffSVG';
import { MaestroUnicorn } from '../components/mascot/MaestroUnicorn';
import { PianoKeyboard } from '../components/inputs/PianoKeyboard';
import { NoteBubbles } from '../components/inputs/NoteBubbles';
import { MicListener } from '../components/inputs/MicListener';
import { audioEngine } from '../engine/audio';
import { speechNarrator } from '../engine/speech';

interface ArcadeViewProps {
  playerState: PlayerState;
  onSaveArcadeRun: (params: {
    sparklesEarned: number;
    missedNotes: NoteId[];
    leaderboardEntry?: Omit<ArcadeLeaderboardEntry, 'id' | 'createdAt'>;
  }) => void;
  onOpenParentSettings: () => void;
  onBack: () => void;
}

type ArcadePhase = 'setup' | 'playing' | 'gameover';
type ArcadePresetId = 'my-notes' | 'treble' | 'bass' | 'grand';

export const ArcadeView: React.FC<ArcadeViewProps> = ({
  playerState,
  onSaveArcadeRun,
  onOpenParentSettings,
  onBack,
}) => {
  const initialSeconds =
    playerState.arcadeInitialSeconds ?? DEFAULT_ARCADE_INITIAL_SECONDS;

  const unlockedWorldNotes = useMemo(() => {
    const set = new Set<NoteId>();
    for (const w of WORLDS) {
      if (w.id <= playerState.unlockedWorld) {
        w.notePool.forEach((n) => set.add(n));
      }
    }
    const list = ALL_NOTE_IDS.filter((n) => set.has(n));
    return list.length >= 2 ? list : (['B3', 'C4', 'D4'] as NoteId[]);
  }, [playerState.unlockedWorld]);

  const unlockedClef: ClefType = useMemo(() => {
    const hasBass = unlockedWorldNotes.some((n) => NOTES[n].midi < NOTES.C4.midi);
    const hasTreble = unlockedWorldNotes.some((n) => NOTES[n].midi > NOTES.C4.midi);
    if (hasBass && hasTreble) return 'grand';
    if (hasBass) return 'bass';
    return 'treble';
  }, [unlockedWorldNotes]);

  // Setup configuration state (defaults to 1-tap "My Notes" preset from her unlocked worlds!)
  const [preset, setPreset] = useState<ArcadePresetId>('my-notes');
  const [clef, setClef] = useState<ClefType>(unlockedClef);
  const [selectedNotes, setSelectedNotes] = useState<NoteId[]>(unlockedWorldNotes);
  const [mode, setMode] = useState<ArcadeGameMode>('piano');
  const [showCustomNotes, setShowCustomNotes] = useState(false);

  // Active phase
  const [phase, setPhase] = useState<ArcadePhase>('setup');

  // Gameplay session state
  const [currentNoteId, setCurrentNoteId] = useState<NoteId>('C4');
  const [isMysteryNote, setIsMysteryNote] = useState(false);
  const [lives, setLives] = useState(ARCADE_INITIAL_LIVES);
  const [score, setScore] = useState(0);
  const [notesCorrect, setNotesCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bonusSparkles, setBonusSparkles] = useState(0);
  const [missedNotes, setMissedNotes] = useState<NoteId[]>([]);

  // Active Power-Ups & Non-Shifting Floating Overlay Toast
  const [hasShield, setHasShield] = useState(false);
  const [freezeNotesLeft, setFreezeNotesLeft] = useState(0);
  const [feverNotesLeft, setFeverNotesLeft] = useState(0);
  const [activeDropBanner, setActiveDropBanner] = useState<ArcadePowerUpDefinition | null>(null);
  const [floatingCallout, setFloatingCallout] = useState<{
    id: number;
    text: string;
    variant: 'score' | 'levelup' | 'powerup';
  } | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const calloutTimerRef = useRef<number | null>(null);

  // Timer & Pause-and-Learn Flash state
  const [timeLimitMs, setTimeLimitMs] = useState(() =>
    getArcadeTimeLimitMs(1, 'piano', initialSeconds)
  );
  const [remainingMs, setRemainingMs] = useState(() =>
    getArcadeTimeLimitMs(1, 'piano', initialSeconds)
  );
  const [isFlashingMistake, setIsFlashingMistake] = useState(false);
  const [isTransitioningNext, setIsTransitioningNext] = useState(false);
  const [micVol, setMicVol] = useState(0);
  const [unicornMessage, setUnicornMessage] = useState('Which note is this? 🎵');
  const [unicornMood, setUnicornMood] = useState<'happy' | 'excited' | 'encouraging' | 'listening'>('happy');

  // Game Over / Leaderboard submission state
  const [playerName, setPlayerName] = useState(playerState.lastArcadePlayerName || '');
  const [playerAvatar, setPlayerAvatar] = useState(playerState.lastArcadeAvatar || '🦄');
  const [runSaved, setRunSaved] = useState(false);

  // Refs for endless note generation & spaced repetition without stale closures
  const historyRef = useRef<NoteId[]>([]);
  const spacedRepQueueRef = useRef<Array<{ noteId: NoteId; dueIn: number }>>([]);
  const lastTickRef = useRef<number>(0);
  const timeoutTriggeredRef = useRef<boolean>(false);

  const currentLevel = getArcadeLevel(notesCorrect);
  const currentNote = NOTES[currentNoteId];

  // Classic black-and-white notes in Arcade Mode for real sight-reading reinforcement,
  // turning on color + Landmark hints during the 2s Pause & Learn Flash (or if Always On in Parent Settings).
  const useColors =
    isFlashingMistake || (playerState.colorMode as ColorMode) === 'always';

  const pickNextNote = useCallback(
    (pool: NoteId[], trickyCounts: Partial<Record<NoteId, number>>): NoteId => {
      if (pool.length === 0) return 'C4';
      if (pool.length === 1) return pool[0];

      // Check spaced-repetition priority queue first
      const dueIdx = spacedRepQueueRef.current.findIndex((item) => item.dueIn <= 0);
      if (dueIdx !== -1) {
        const [dueItem] = spacedRepQueueRef.current.splice(dueIdx, 1);
        spacedRepQueueRef.current.forEach((item) => {
          item.dueIn -= 1;
        });
        historyRef.current = [...historyRef.current.slice(-3), dueItem.noteId];
        return dueItem.noteId;
      }

      spacedRepQueueRef.current.forEach((item) => {
        item.dueIn -= 1;
      });

      // Weighted pool slightly favoring previously missed tricky notes
      const weighted: NoteId[] = [];
      for (const n of pool) {
        const w = 2 + Math.min(3, trickyCounts[n] || 0);
        for (let i = 0; i < w; i++) {
          weighted.push(n);
        }
      }

      const prev1 = historyRef.current[historyRef.current.length - 1];
      const prev2 = historyRef.current[historyRef.current.length - 2];

      let chosen = weighted[Math.floor(Math.random() * weighted.length)];
      if (chosen === prev1 && chosen === prev2) {
        const others = pool.filter((n) => n !== chosen);
        chosen = others[Math.floor(Math.random() * others.length)];
      } else if (pool.length >= 3 && chosen === prev1 && Math.random() < 0.65) {
        // Keep variety lively!
        const others = pool.filter((n) => n !== chosen);
        chosen = others[Math.floor(Math.random() * others.length)];
      }

      historyRef.current = [...historyRef.current.slice(-3), chosen];
      return chosen;
    },
    []
  );

  const applyArcadePreset = (presetId: ArcadePresetId) => {
    setPreset(presetId);
    if (presetId === 'my-notes') {
      setClef(unlockedClef);
      setSelectedNotes(unlockedWorldNotes);
    } else if (presetId === 'treble') {
      setClef('treble');
      setSelectedNotes(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']);
    } else if (presetId === 'bass') {
      setClef('bass');
      setSelectedNotes(['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']);
    } else {
      setClef('grand');
      setSelectedNotes(ALL_NOTE_IDS);
    }
  };

  const getNoteLandmarkBadge = (nId: NoteId) => {
    if (nId === 'C4') return '🦄';
    if (nId === 'G4') return '🌀';
    if (nId === 'F3') return '••';
    if (nId === 'C5') return '⭐';
    if (nId === 'C3') return '💎';
    return '';
  };

  const toggleNoteSelection = (noteId: NoteId) => {
    setSelectedNotes((prev) => {
      if (prev.includes(noteId)) {
        // Require at least 2 notes in Arcade Mode so single-note mashing cannot exploit the Leaderboard
        return prev.length > 2 ? prev.filter((n) => n !== noteId) : prev;
      }
      return [...prev, noteId];
    });
  };

  const startArcadeRun = () => {
    speechNarrator.stop();
    historyRef.current = [];
    spacedRepQueueRef.current = [];
    timeoutTriggeredRef.current = false;

    const firstNote = pickNextNote(selectedNotes, playerState.trickyNotesCount);
    const initialLimit = getArcadeTimeLimitMs(1, mode, initialSeconds);

    setCurrentNoteId(firstNote);
    setIsMysteryNote(false);
    setLives(ARCADE_INITIAL_LIVES);
    setScore(0);
    setNotesCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setBonusSparkles(0);
    setMissedNotes([]);
    setHasShield(false);
    setFreezeNotesLeft(0);
    setFeverNotesLeft(0);
    setActiveDropBanner(null);
    setFloatingCallout(null);
    setTimeLimitMs(initialLimit);
    setRemainingMs(initialLimit);
    setIsFlashingMistake(false);
    setIsTransitioningNext(false);
    setRunSaved(false);
    setUnicornMood(mode === 'mic' ? 'listening' : 'happy');
    setUnicornMessage(
      mode === 'mic' ? 'Play this note! 🎤' : 'Which note is this? 🎵'
    );
    setPhase('playing');
  };

  const advanceToNextNote = useCallback(
    (nextCorrectTotal: number, nextStreakVal: number) => {
      const nextLvl = getArcadeLevel(nextCorrectTotal);
      const nextLimit = getArcadeTimeLimitMs(nextLvl, mode, initialSeconds);
      const nextNote = pickNextNote(selectedNotes, playerState.trickyNotesCount);
      const spawnGolden = shouldSpawnMysteryNote(nextStreakVal + 1);

      timeoutTriggeredRef.current = false;
      setCurrentNoteId(nextNote);
      setIsMysteryNote(spawnGolden);
      setTimeLimitMs(nextLimit);
      setRemainingMs(nextLimit);
      setIsFlashingMistake(false);
      setIsTransitioningNext(false);
      setUnicornMood(mode === 'mic' ? 'listening' : 'happy');
    },
    [mode, initialSeconds, pickNextNote, selectedNotes, playerState.trickyNotesCount]
  );

  // Sync setup preview timer if Parent Settings updates arcadeInitialSeconds while on Setup screen
  useEffect(() => {
    if (phase === 'setup') {
      const updatedLimit = getArcadeTimeLimitMs(1, mode, initialSeconds);
      setTimeLimitMs(updatedLimit);
      setRemainingMs(updatedLimit);
    }
  }, [phase, mode, initialSeconds]);

  // Triggered on wrong note tap OR countdown timeout
  const handleMistakeOrTimeout = useCallback(
    (reason: 'wrong' | 'timeout', tappedNoteId?: NoteId) => {
      if (isFlashingMistake || isTransitioningNext || phase !== 'playing') return;
      timeoutTriggeredRef.current = true;
      setIsFlashingMistake(true);
      setActiveDropBanner(null);

      if (tappedNoteId) {
        audioEngine.playNote(tappedNoteId, 0.35);
      }

      // Play the true target note after a tiny beat so her ear connects the staff position to its real pitch!
      setTimeout(() => {
        audioEngine.playNote(currentNoteId, 1.1);
      }, 180);

      // Queue this tricky note 3 turns ahead for immediate spaced repetition
      if (!spacedRepQueueRef.current.some((q) => q.noteId === currentNoteId)) {
        spacedRepQueueRef.current.push({ noteId: currentNoteId, dueIn: 3 });
      }
      const updatedMissed = missedNotes.includes(currentNoteId)
        ? missedNotes
        : [...missedNotes, currentNoteId];
      setMissedNotes(updatedMissed);
      setStreak(0);

      const friendlyName = formatNoteDisplayName(currentNoteId, playerState.namingConvention);
      let nextLives = lives;

      if (hasShield) {
        // Unicorn Shield absorbs the mistake!
        setHasShield(false);
        audioEngine.playShieldPop();
        setUnicornMood('encouraging');
        const msg = `🛡️ Saved! This is ${friendlyName}!`;
        setUnicornMessage(msg);
        speechNarrator.speak(`Shield saved you! This is ${friendlyName}. ${currentNote.landmarkHint.explanation}`);
      } else {
        nextLives = lives - 1;
        setLives(nextLives);
        audioEngine.playGentleHintSound();
        setUnicornMood('encouraging');
        const prefix = reason === 'timeout' ? '⏰ Time’s up!' : '💡 Look:';
        const msg = `${prefix} ${friendlyName}! (${currentNote.landmarkHint.explanation})`;
        setUnicornMessage(msg);
        speechNarrator.speak(`This is ${friendlyName}. ${currentNote.landmarkHint.explanation}`);
      }

      // 2-Second Pause & Learn Flash before continuing (or Game Over if 0 hearts left)
      setTimeout(() => {
        if (nextLives <= 0) {
          audioEngine.playArcadeGameOver();
          setPhase('gameover');
          setIsFlashingMistake(false);
        } else {
          advanceToNextNote(notesCorrect, 0);
        }
      }, ARCADE_PAUSE_LEARN_MS);
    },
    [
      isFlashingMistake,
      isTransitioningNext,
      phase,
      currentNoteId,
      missedNotes,
      playerState.namingConvention,
      lives,
      hasShield,
      currentNote,
      advanceToNextNote,
      notesCorrect,
    ]
  );

  // Smooth countdown timer effect during active 'playing' phase
  useEffect(() => {
    if (phase !== 'playing' || isFlashingMistake || isTransitioningNext) {
      return;
    }

    lastTickRef.current = performance.now();
    const intervalId = window.setInterval(() => {
      const now = performance.now();
      const rawDelta = now - lastTickRef.current;
      lastTickRef.current = now;

      // Ice Freeze slows countdown drain by 50%!
      const effectiveDelta = freezeNotesLeft > 0 ? rawDelta * 0.5 : rawDelta;

      setRemainingMs((prev) => {
        const next = Math.max(0, prev - effectiveDelta);
        if (next <= 0 && !timeoutTriggeredRef.current) {
          timeoutTriggeredRef.current = true;
          setTimeout(() => handleMistakeOrTimeout('timeout'), 0);
        }
        return next;
      });
    }, 50);

    return () => window.clearInterval(intervalId);
  }, [phase, isFlashingMistake, isTransitioningNext, freezeNotesLeft, handleMistakeOrTimeout]);

  useEffect(() => {
    return () => {
      speechNarrator.stop();
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
      if (calloutTimerRef.current) window.clearTimeout(calloutTimerRef.current);
    };
  }, []);

  const triggerFloatingCallout = useCallback(
    (text: string, variant: 'score' | 'levelup' | 'powerup', durationMs = 1100) => {
      if (calloutTimerRef.current) {
        window.clearTimeout(calloutTimerRef.current);
      }
      setFloatingCallout({ id: Date.now(), text, variant });
      calloutTimerRef.current = window.setTimeout(() => {
        setFloatingCallout(null);
      }, durationMs);
    },
    []
  );

  const triggerDropOverlay = useCallback((powerDef: ArcadePowerUpDefinition) => {
    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
    }
    setActiveDropBanner(powerDef);
    bannerTimerRef.current = window.setTimeout(() => {
      setActiveDropBanner(null);
    }, 2400);
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    if (isFlashingMistake || isTransitioningNext || phase !== 'playing') return;
    setIsTransitioningNext(true);

    audioEngine.playNote(currentNoteId, 0.9);
    const nextStreak = streak + 1;
    const nextBestStreak = Math.max(bestStreak, nextStreak);
    const nextCorrect = notesCorrect + 1;

    const remainingRatio = timeLimitMs > 0 ? remainingMs / timeLimitMs : 0.5;
    const feverActive = feverNotesLeft > 0;
    let gainedScore = calculateArcadeNoteScore({
      remainingRatio,
      streak: nextStreak,
      hasRainbowFever: feverActive,
    });

    // Decrement temporary note-based buffs
    if (freezeNotesLeft > 0) setFreezeNotesLeft((n) => Math.max(0, n - 1));
    if (feverNotesLeft > 0) setFeverNotesLeft((n) => Math.max(0, n - 1));

    const friendlyName = formatNoteDisplayName(currentNoteId, playerState.namingConvention);
    let message = `✨ Yes! ${friendlyName}!`;

    // Roll Mystery Golden Note Reward!
    if (isMysteryNote) {
      const rolledType = rollArcadePowerUp(lives, hasShield);
      const powerDef = ARCADE_POWER_UPS[rolledType];
      triggerDropOverlay(powerDef);
      audioEngine.playPowerUp();

      if (rolledType === 'extra-heart') {
        if (lives < ARCADE_MAX_LIVES) {
          setLives((l) => Math.min(ARCADE_MAX_LIVES, l + 1));
          message = `❤️ Mystery Note unlocked +1 Extra Heart!`;
        } else {
          gainedScore += 150;
          message = `💖 Max Hearts Bonus: +150 Extra Arcade Points!`;
        }
      } else if (rolledType === 'ice-freeze') {
        setFreezeNotesLeft((n) => n + 3);
        message = `❄️ Ice Freeze active! Half-speed timer for 3 notes!`;
      } else if (rolledType === 'rainbow-fever') {
        setFeverNotesLeft((n) => n + 5);
        message = `🌈 2x Rainbow Fever active for the next 5 notes!`;
      } else if (rolledType === 'unicorn-shield') {
        setHasShield(true);
        message = `🛡️ Unicorn Shield active! Protects your next slip!`;
      } else if (rolledType === 'sparkle-chest') {
        setBonusSparkles((s) => s + 50);
        message = `🎁 Boutique Chest unlocked: +50 Sparkles!`;
      }
    } else {
      audioEngine.playSuccessSparkle(nextStreak);
    }

    // Check if she just leveled up!
    const prevLevel = getArcadeLevel(notesCorrect);
    const newLevel = getArcadeLevel(nextCorrect);
    if (newLevel > prevLevel) {
      audioEngine.playLevelUp();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
      });
      triggerFloatingCallout(`⚡ LEVEL ${newLevel}! Faster Beat! +${gainedScore}`, 'levelup', 1800);
      message = `⚡ Level ${newLevel} unlocked! The beat gets a little faster!`;
    } else {
      const streakTag = nextStreak >= 3 ? ` 🔥${nextStreak}x` : '';
      const feverTag = feverActive ? ' 🌈2x' : '';
      triggerFloatingCallout(`+${gainedScore} pts!${streakTag}${feverTag}`, 'score', 950);
    }

    setScore((s) => s + gainedScore);
    setNotesCorrect(nextCorrect);
    setStreak(nextStreak);
    setBestStreak(nextBestStreak);
    setUnicornMood('excited');
    setUnicornMessage(message);

    setTimeout(() => {
      advanceToNextNote(nextCorrect, nextStreak);
    }, 320);
  }, [
    isFlashingMistake,
    isTransitioningNext,
    phase,
    currentNoteId,
    streak,
    bestStreak,
    notesCorrect,
    timeLimitMs,
    remainingMs,
    feverNotesLeft,
    freezeNotesLeft,
    playerState.namingConvention,
    isMysteryNote,
    lives,
    hasShield,
    triggerDropOverlay,
    triggerFloatingCallout,
    advanceToNextNote,
  ]);

  const onPianoSelect = (selectedId: NoteId) => {
    if (isFlashingMistake || isTransitioningNext) return;
    if (selectedId === currentNoteId) {
      handleCorrectAnswer();
    } else {
      handleMistakeOrTimeout('wrong', selectedId);
    }
  };

  const onBubbleSelect = (selectedLetter: NoteLetter) => {
    if (isFlashingMistake || isTransitioningNext) return;
    if (selectedLetter === currentNote.letter) {
      handleCorrectAnswer();
    } else {
      handleMistakeOrTimeout('wrong');
    }
  };

  // Total Boutique Sparkles earned from this Arcade run
  const totalRunSparkles =
    (score > 0 ? Math.max(5, Math.floor(score / 25)) : 0) + bonusSparkles;

  const qualifiesForTop10 =
    score > 0 &&
    (playerState.arcadeLeaderboard.length < 10 ||
      score >
        playerState.arcadeLeaderboard[playerState.arcadeLeaderboard.length - 1].score);

  const commitRunAndSaveLeaderboard = (includeLeaderboard: boolean) => {
    if (runSaved) return;
    setRunSaved(true);
    if (includeLeaderboard && score > 0) {
      confetti({
        particleCount: 95,
        spread: 85,
        origin: { y: 0.55 },
      });
      audioEngine.playFanfare();
    }
    onSaveArcadeRun({
      sparklesEarned: totalRunSparkles,
      missedNotes,
      leaderboardEntry:
        includeLeaderboard && score > 0
          ? {
              playerName: playerName.trim() || 'Super Pianist',
              avatar: playerAvatar,
              score,
              notesCorrect,
              maxLevel: currentLevel,
              mode,
              clef,
              isRival: false,
            }
          : undefined,
    });
  };

  const renderLeaderboardCard = (highlightTopScore?: number) => (
    <div className="bg-white rounded-3xl p-5 shadow-xl border-4 border-amber-300 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            Unicorn Hall of Fame
          </h3>
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
          Top 10
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
        {playerState.arcadeLeaderboard.map((entry, idx) => {
          const rank = idx + 1;
          const medal =
            rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
          const isHighlighted =
            !entry.isRival && highlightTopScore !== undefined && entry.score === highlightTopScore;

          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl border-2 transition ${
                isHighlighted
                  ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300'
                  : rank <= 3
                  ? 'bg-gradient-to-r from-amber-50/80 to-pink-50/60 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 text-center font-black text-sm sm:text-base shrink-0">
                  {medal}
                </span>
                <span className="text-xl shrink-0">{entry.avatar}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-800 text-sm truncate">
                      {entry.playerName}
                    </span>
                    {entry.isRival && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md shrink-0">
                        Rival
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Lvl {entry.maxLevel} • {entry.notesCorrect} notes •{' '}
                    {entry.mode === 'piano' ? '🎹' : entry.mode === 'bubbles' ? '🏷️' : '🎤'}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-black text-purple-700 text-sm sm:text-base">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold uppercase text-slate-400">pts</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ============================================================================
  // PHASE 1: 1-TAP ARCADE LAUNCHPAD & HALL OF FAME HUB
  // ============================================================================
  if (phase === 'setup') {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
        {/* Clean Top Bar */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 sm:px-5 py-3 rounded-3xl shadow-md">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 font-black text-xs sm:text-sm cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>

          <div className="text-center">
            <h1 className="text-lg sm:text-2xl font-black">
              🕹️ Arcade
            </h1>
            <p className="text-[11px] sm:text-xs text-white/90 font-bold">
              ❤️❤️❤️ • {initialSeconds}s Timer
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenParentSettings}
            title="Parent Settings (Timer, Notes & Sync)"
            aria-label="Parent Settings"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 font-bold text-xs sm:text-sm cursor-pointer transition"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{initialSeconds}s</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* Left 7 Cols: 1-Tap Visual Preset Cards + Big Play Button */}
          <div className="lg:col-span-7 bg-white/95 rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-purple-300 flex flex-col gap-4">
            {/* 1. 4 Big Visual Preset Cards */}
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    id: 'my-notes' as const,
                    emoji: '⭐',
                    title: 'My Notes',
                    sub: `World 1–${playerState.unlockedWorld}`,
                  },
                  {
                    id: 'treble' as const,
                    emoji: '✋',
                    title: 'Right Hand',
                    sub: 'Treble 𝄞',
                  },
                  {
                    id: 'bass' as const,
                    emoji: '🤚',
                    title: 'Left Hand',
                    sub: 'Bass 𝄢',
                  },
                  {
                    id: 'grand' as const,
                    emoji: '👑',
                    title: 'Both Hands',
                    sub: 'All Notes',
                  },
                ]
              ).map((card) => {
                const active = preset === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => applyArcadePreset(card.id)}
                    className={`p-4 rounded-2xl border-3 flex flex-col items-center text-center gap-1 transition cursor-pointer ${
                      active
                        ? 'bg-purple-600 text-white border-purple-800 shadow-md scale-[1.02]'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{card.emoji}</span>
                    <span className="font-black text-base">{card.title}</span>
                    <span
                      className={`text-xs font-bold ${
                        active ? 'text-purple-100' : 'text-slate-500'
                      }`}
                    >
                      {card.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2. Mode Pills + Giant Pulsing Play Button */}
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'piano' as const, emoji: '🎹', label: 'Piano' },
                  { id: 'bubbles' as const, emoji: '🫧', label: 'Bubbles' },
                  { id: 'mic' as const, emoji: '🎤', label: 'Mic' },
                ]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`py-2.5 px-3 rounded-2xl font-black text-sm sm:text-base border-2 flex items-center justify-center gap-1.5 cursor-pointer transition ${
                    mode === m.id
                      ? 'bg-pink-600 text-white border-pink-700 shadow-xs'
                      : 'bg-pink-50 text-pink-900 border-pink-200 hover:bg-pink-100'
                  }`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={startArcadeRun}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-black text-xl shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer transition"
            >
              <Play className="w-6 h-6 fill-white" />
              Play Arcade!
            </button>

            {/* Optional Collapsible Custom Note Picker */}
            <div className="border-t border-slate-200 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomNotes((v) => !v)}
                className="text-xs font-extrabold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Pick Specific Notes ({selectedNotes.length} active)</span>
                {showCustomNotes ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showCustomNotes && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {ALL_NOTE_IDS.map((nId) => {
                    const n = NOTES[nId];
                    const active = selectedNotes.includes(nId);
                    const badge = getNoteLandmarkBadge(nId);
                    return (
                      <button
                        key={nId}
                        type="button"
                        onClick={() => toggleNoteSelection(nId)}
                        style={{
                          backgroundColor: active ? n.color : '#f8fafc',
                          color: active ? '#ffffff' : '#475569',
                          borderColor: active ? n.color : '#cbd5e1',
                        }}
                        className="px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm border-2 cursor-pointer transition hover:scale-105"
                      >
                        {badge ? `${badge} ` : ''}
                        {formatNoteLabel(n.letter, playerState.namingConvention)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Hall of Fame Leaderboard */}
          <div className="lg:col-span-5">{renderLeaderboardCard()}</div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // PHASE 3: GAME OVER & LEADERBOARD ENTRY
  // ============================================================================
  if (phase === 'gameover') {
    return (
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-purple-300 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 text-white flex items-center justify-center shadow-md">
            <Trophy className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              Arcade Run Finished!
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mt-2">
              {score.toLocaleString()} pts
            </h2>
          </div>

          {/* Stats Pills */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3">
              <div className="text-xl font-black text-purple-800">{notesCorrect}</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Right Notes</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
              <div className="text-xl font-black text-amber-700">Lvl {currentLevel}</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Max Level</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3">
              <div className="text-xl font-black text-orange-600">{bestStreak}x</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Best Streak</div>
            </div>
          </div>

          {/* Sparkles Reward Notice */}
          {totalRunSparkles > 0 && (
            <div className="w-full bg-fuchsia-50 border-2 border-fuchsia-200 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 text-fuchsia-900 font-black text-sm">
              <Sparkles className="w-5 h-5 text-fuchsia-600" />
              +{totalRunSparkles} Boutique Sparkles Earned!
            </div>
          )}

          {/* High Score Name & Avatar Entry (if not yet saved and score > 0) */}
          {!runSaved && score > 0 ? (
            <div className="w-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col gap-3 text-left">
              <div className="text-center">
                <h4 className="font-black text-amber-900 text-base">
                  {qualifiesForTop10
                    ? '🎉 NEW TOP 10 HIGH SCORE! Enter Your Name:'
                    : '🌟 Save Your Score to the Leaderboard?'}
                </h4>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-amber-800 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Type your name..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-amber-300 font-black text-slate-800 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-amber-800 mb-1">
                  Pick Your Badge
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ARCADE_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setPlayerAvatar(av)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center cursor-pointer border-2 transition ${
                        playerAvatar === av
                          ? 'bg-amber-300 border-amber-600 scale-110 shadow-xs'
                          : 'bg-white border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => commitRunAndSaveLeaderboard(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white font-black text-base shadow-md hover:brightness-105 cursor-pointer"
              >
                🏆 Save Score & Claim Sparkles!
              </button>
            </div>
          ) : (
            runSaved && (
              <div className="text-emerald-700 font-black text-sm bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                ✅ Score & Sparkles saved! Check the Hall of Fame!
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 w-full pt-1">
            <button
              type="button"
              onClick={() => {
                if (!runSaved) commitRunAndSaveLeaderboard(false);
                startArcadeRun();
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black flex items-center gap-2 shadow-md hover:scale-105 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again!
            </button>

            <button
              type="button"
              onClick={() => {
                if (!runSaved) commitRunAndSaveLeaderboard(false);
                setPhase('setup');
              }}
              className="px-5 py-3 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-black cursor-pointer"
            >
              Change Notes / Mode
            </button>

            <button
              type="button"
              onClick={() => {
                if (!runSaved) commitRunAndSaveLeaderboard(false);
                onBack();
              }}
              className="px-5 py-3 rounded-2xl bg-slate-800 text-white font-bold cursor-pointer"
            >
              World Map
            </button>
          </div>
        </div>

        {/* Live Hall of Fame Leaderboard */}
        <div className="lg:col-span-5">
          {renderLeaderboardCard(runSaved ? score : undefined)}
        </div>
      </div>
    );
  }

  // ============================================================================
  // PHASE 2: ACTIVE ENDLESS ARCADE GAMEPLAY
  // ============================================================================
  const timerPct = timeLimitMs > 0 ? Math.max(0, Math.min(100, (remainingMs / timeLimitMs) * 100)) : 100;
  const secondsDisplay = (remainingMs / 1000).toFixed(1);
  const notesIntoCurrentLevel = notesCorrect % ARCADE_NOTES_PER_LEVEL;

  const timerBarClass =
    freezeNotesLeft > 0
      ? 'from-cyan-400 via-sky-400 to-blue-500'
      : timerPct > 50
      ? 'from-emerald-400 via-teal-500 to-cyan-500'
      : timerPct > 25
      ? 'from-amber-400 via-orange-500 to-amber-500'
      : 'from-rose-500 via-red-600 to-pink-600 animate-pulse';

  return (
    <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
      {/* Top Arcade HUD (Locked height so badges never shift the keyboard) */}
      <div className="min-h-14 flex items-center justify-between gap-2 bg-white/95 px-4 py-2 rounded-2xl shadow-sm border-2 border-purple-200 overflow-x-auto">
        {/* Exit + Level Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPhase('setup')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quit
          </button>

          <div className="flex items-center gap-1.5 bg-indigo-100 text-indigo-900 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm">
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            Level {currentLevel}
            <span className="text-[11px] font-bold text-indigo-600 ml-0.5">
              ({notesIntoCurrentLevel}/{ARCADE_NOTES_PER_LEVEL})
            </span>
          </div>
        </div>

        {/* Hearts / Lives + Shield */}
        <div
          className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl border-2 shrink-0 transition ${
            hasShield
              ? 'bg-violet-100 border-violet-400 ring-2 ring-violet-300'
              : 'bg-rose-50 border-rose-200'
          }`}
        >
          {Array.from({ length: Math.max(ARCADE_INITIAL_LIVES, lives) }).map((_, i) => {
            const filled = i < lives;
            return (
              <Heart
                key={i}
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
                  filled
                    ? 'text-rose-500 fill-rose-500 scale-105'
                    : 'text-rose-200 fill-rose-100 scale-90'
                }`}
              />
            );
          })}
          {hasShield && (
            <span className="ml-1 inline-flex items-center gap-1 text-xs font-black text-violet-800">
              <Shield className="w-4 h-4 text-violet-600 fill-violet-300" />
              Shield
            </span>
          )}
        </div>

        {/* Active Power-Up Badges, Streak & Score */}
        <div className="flex items-center gap-1.5 shrink-0">
          {freezeNotesLeft > 0 && (
            <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-900 px-2.5 py-1 rounded-full font-black text-xs">
              <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
              {freezeNotesLeft}
            </span>
          )}

          {feverNotesLeft > 0 && (
            <span className="inline-flex items-center gap-1 bg-fuchsia-100 text-fuchsia-900 px-2.5 py-1 rounded-full font-black text-xs">
              🌈 2x ({feverNotesLeft})
            </span>
          )}

          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-black text-xs sm:text-sm">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              {streak}x
            </div>
          )}

          <div className="bg-purple-700 text-white px-3.5 py-1.5 rounded-xl font-black text-sm sm:text-base shadow-xs">
            {score.toLocaleString()} pts
          </div>
        </div>
      </div>

      {/* Countdown Beat Timer Bar (Fixed h-11 so Mystery pill never shifts layout) */}
      <div className="h-11 flex items-center gap-3 bg-white/90 px-3.5 rounded-2xl border-2 border-purple-200">
        <div className="flex items-center gap-1 text-xs font-black text-slate-700 shrink-0 w-16">
          <Timer className="w-4 h-4 text-purple-600" />
          <span>{isFlashingMistake ? 'Learn!' : `${secondsDisplay}s`}</span>
        </div>
        <div className="flex-1 h-3.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${timerBarClass} transition-all duration-75`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
        {isMysteryNote && !isFlashingMistake && (
          <span className="text-xs font-black bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full shrink-0">
            ✨ Mystery Note!
          </span>
        )}
      </div>

      {/* Side-by-Side Mascot Coach + Interactive Music Staff (Zero vertical scroll & zero layout shift!) */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <MaestroUnicorn
          sideDock
          mood={unicornMood}
          speechBubble={unicornMessage}
          onReplaySpeech={() => speechNarrator.speak(unicornMessage)}
          equipped={playerState.equippedAccessories}
          micVolume={micVol}
        />

        <div className="relative flex-1 w-full">
          {/* Floating Score / Level-Up / Mystery Power-Up Overlays (Absolute + pointer-events-none = ZERO keyboard shift!) */}
          <div className="pointer-events-none absolute top-2.5 left-4 right-28 z-20 flex flex-wrap items-center gap-2">
            {floatingCallout && (
              <div
                key={floatingCallout.id}
                className={`px-3.5 py-1 rounded-full font-black text-xs sm:text-sm shadow-md border-2 transition-all animate-bounce ${
                  floatingCallout.variant === 'levelup'
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-yellow-300'
                    : 'bg-emerald-500 text-white border-emerald-200'
                }`}
              >
                {floatingCallout.text}
              </div>
            )}

            {activeDropBanner && (
              <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 border-2 border-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5">
                <span>{activeDropBanner.emoji}</span>
                <span>
                  {activeDropBanner.title} ({activeDropBanner.description})
                </span>
              </div>
            )}
          </div>

          <GrandStaffSVG
            clefMode={clef}
            activeNotes={[currentNoteId]}
            targetNote={currentNoteId}
            useColors={useColors}
            hintLevel={isFlashingMistake ? 2 : 0}
            isMysteryNote={isMysteryNote && !isFlashingMistake}
            namingConvention={playerState.namingConvention}
            onNoteClick={(n) => audioEngine.playNote(n)}
          />
          <button
            type="button"
            onClick={() => audioEngine.playNote(currentNoteId)}
            className="absolute top-2.5 right-3 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            Hear
          </button>
        </div>
      </div>

      {/* Input Controls */}
      <div className="pt-0.5">
        {mode === 'piano' && (
          <PianoKeyboard
            onSelectNote={onPianoSelect}
            useColors={useColors}
            namingConvention={playerState.namingConvention}
            highlightedNote={isFlashingMistake ? currentNoteId : null}
            activeClef={clef}
            disabled={isFlashingMistake || isTransitioningNext}
          />
        )}

        {mode === 'bubbles' && (
          <NoteBubbles
            onSelectLetter={onBubbleSelect}
            useColors={useColors}
            namingConvention={playerState.namingConvention}
            highlightedLetter={isFlashingMistake ? currentNote.letter : null}
            disabled={isFlashingMistake || isTransitioningNext}
          />
        )}

        {mode === 'mic' && (
          <MicListener
            targetNote={currentNoteId}
            onNoteMatched={() => handleCorrectAnswer()}
            namingConvention={playerState.namingConvention}
            sensitivity={playerState.micSensitivity}
            onVolumeChange={setMicVol}
            onSwitchModeFallback={() => setMode('piano')}
          />
        )}
      </div>
    </div>
  );
};
