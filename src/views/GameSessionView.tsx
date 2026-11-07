import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  ClefType,
  ColorMode,
  NamingConvention,
  NOTES,
  NoteId,
  NoteLetter,
  formatNoteDisplayName,
} from '../data/notes';
import {
  EquippedAccessories,
  GameMode,
  generateDynamicNoteQueue,
  requeueMissedNote,
  shouldUseNoteColors,
} from '../store/useGameStore';
import { GrandStaffSVG } from '../components/staff/GrandStaffSVG';
import { MaestroUnicorn } from '../components/mascot/MaestroUnicorn';
import { PianoKeyboard } from '../components/inputs/PianoKeyboard';
import { NoteBubbles } from '../components/inputs/NoteBubbles';
import { MicListener } from '../components/inputs/MicListener';
import { audioEngine } from '../engine/audio';
import { speechNarrator } from '../engine/speech';

interface GameSessionViewProps {
  title: string;
  worldId?: number;
  clefMode: ClefType;
  notePool: NoteId[];
  roundLength?: number;
  initialMode: GameMode;
  currentModeStars: number;
  canSpeedChallenge: boolean;
  colorMode: ColorMode;
  namingConvention: NamingConvention;
  micSensitivity: number;
  equipped: EquippedAccessories;
  trickyNotesCount: Partial<Record<NoteId, number>>;
  onCompleteRound: (
    mode: GameMode,
    stars: number,
    pointsEarned: number,
    missedNotes: NoteId[],
    wasSpeedChallenge: boolean
  ) => void;
  onStartBossConcert?: () => void;
  onBack: () => void;
}

export const GameSessionView: React.FC<GameSessionViewProps> = ({
  title,
  clefMode,
  notePool,
  roundLength = 10,
  initialMode,
  currentModeStars,
  canSpeedChallenge,
  colorMode,
  namingConvention,
  micSensitivity,
  equipped,
  trickyNotesCount,
  onCompleteRound,
  onStartBossConcert,
  onBack,
}) => {
  const [mode, setMode] = useState<GameMode>(initialMode);
  // Track her current star tier across consecutive rounds so she progresses Star 1 (🌈) -> Star 2 (🎵) -> Star 3 (🏆)
  const [activeTierStars, setActiveTierStars] = useState<number>(currentModeStars);

  const computeQueueLength = (tierStars: number) =>
    tierStars >= 2 ? Math.max(12, roundLength) : roundLength;

  const [queue, setQueue] = useState<NoteId[]>(() =>
    generateDynamicNoteQueue(
      notePool,
      computeQueueLength(currentModeStars),
      trickyNotesCount
    )
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakeCount, setMistakeCount] = useState<0 | 1 | 2>(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [missedNotes, setMissedNotes] = useState<NoteId[]>([]);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [speedChallenge, setSpeedChallenge] = useState(false);
  const [micVol, setMicVol] = useState(0);
  const [unicornMessage, setUnicornMessage] = useState(
    initialMode === 'mic'
      ? 'Play this note on your piano! 🎤'
      : currentModeStars === 0
      ? '🌈 Rainbow Notes! Which note is this?'
      : '🎵 Real Notes! Count from your Landmark!'
  );
  const [unicornMood, setUnicornMood] = useState<'happy' | 'excited' | 'encouraging' | 'listening'>(
    initialMode === 'mic' ? 'listening' : 'happy'
  );

  const currentNoteId = queue[currentIndex] || notePool[0] || 'C4';
  const currentNote = NOTES[currentNoteId];
  // Progressive color scaffolding: ON for Star 1 (0 stars), OFF (classic black-and-white) for Star 2 & Star 3!
  const useColors = shouldUseNoteColors(colorMode, activeTierStars, mistakeCount);

  const tierInfo =
    activeTierStars === 0
      ? { badge: '🌈 ⭐1 Rainbow', color: 'bg-pink-100 text-pink-900 border-pink-300' }
      : activeTierStars === 1
      ? { badge: '🎵 ⭐2 Real Notes', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' }
      : { badge: '🏆 ⭐3 Master', color: 'bg-amber-100 text-amber-900 border-amber-300' };

  const startFreshRound = useCallback(
    (selectedMode: GameMode, nextTierStars = activeTierStars, isSpeed = speedChallenge) => {
      const freshQueue = generateDynamicNoteQueue(
        notePool,
        computeQueueLength(nextTierStars),
        trickyNotesCount
      );
      setMode(selectedMode);
      setActiveTierStars(nextTierStars);
      setSpeedChallenge(isSpeed);
      setQueue(freshQueue);
      setCurrentIndex(0);
      setMistakeCount(0);
      setFirstTryCount(0);
      setStreak(0);
      setSessionPoints(0);
      setMissedNotes([]);
      setIsRoundFinished(false);
      setUnicornMood(selectedMode === 'mic' ? 'listening' : 'happy');
      setUnicornMessage(
        selectedMode === 'mic'
          ? 'Play this note on your piano! 🎤'
          : nextTierStars === 0
          ? '🌈 Rainbow Notes! Which note is this?'
          : '🎵 Real Notes! Count from your Landmark!'
      );
    },
    [notePool, trickyNotesCount, activeTierStars, speedChallenge, roundLength]
  );

  useEffect(() => {
    return () => speechNarrator.stop();
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    audioEngine.playNote(currentNoteId);
    const wasFirstTry = mistakeCount === 0;
    const nextStreak = wasFirstTry ? streak + 1 : 1;
    audioEngine.playSuccessSparkle(nextStreak);

    const pointsGain =
      (wasFirstTry ? 15 : 8) +
      (nextStreak >= 3 ? 10 : 0) +
      (speedChallenge ? 5 : 0);
    const nextPoints = sessionPoints + pointsGain;
    const nextFirstTry = wasFirstTry ? firstTryCount + 1 : firstTryCount;

    setStreak(nextStreak);
    setSessionPoints(nextPoints);
    setFirstTryCount(nextFirstTry);
    setUnicornMood('excited');

    const friendlyName = formatNoteDisplayName(currentNoteId, namingConvention);
    if (nextStreak >= 3) {
      setUnicornMessage(`🌈 ${nextStreak}x! Yes, ${friendlyName}!`);
    } else {
      setUnicornMessage(`✨ Yes! ${friendlyName}!`);
    }

    if (currentIndex + 1 >= queue.length) {
      const accuracy = nextFirstTry / queue.length;
      // Progressive 3-Tier Star Award:
      // - Star 1 (activeTierStars === 0, Rainbow Colors ON): caps at 1 Star ⭐ so she must play Star 2 in Black & White!
      // - Star 2 (activeTierStars === 1, Black & White): awards 2 Stars ⭐⭐ at >= 75% accuracy (unlocking Boss Song!)
      // - Star 3 (activeTierStars >= 2, Black & White 12+ notes): awards 3 Stars ⭐⭐⭐ at >= 85% accuracy!
      let stars = 1;
      if (activeTierStars === 0) {
        stars = 1;
      } else if (activeTierStars === 1) {
        stars = accuracy >= 0.75 ? 2 : 1;
      } else {
        stars = accuracy >= 0.85 ? 3 : accuracy >= 0.75 ? 2 : 1;
      }

      const newBestStars = Math.max(activeTierStars, stars);
      setEarnedStars(newBestStars);
      setIsRoundFinished(true);
      audioEngine.playFanfare();
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
      onCompleteRound(mode, stars, nextPoints, missedNotes, speedChallenge);
    } else {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setMistakeCount(0);
        setUnicornMood(mode === 'mic' ? 'listening' : 'happy');
      }, 450);
    }
  }, [
    currentNoteId,
    mistakeCount,
    streak,
    speedChallenge,
    sessionPoints,
    firstTryCount,
    namingConvention,
    currentIndex,
    queue.length,
    activeTierStars,
    onCompleteRound,
    mode,
    missedNotes,
  ]);

  const handleWrongAnswer = useCallback(
    (playedNoteId?: NoteId) => {
      if (playedNoteId) {
        audioEngine.playNote(playedNoteId, 0.5);
      }
      audioEngine.playGentleHintSound();
      setStreak(0);
      setUnicornMood('encouraging');

      if (mistakeCount === 0) {
        // 1st Mistake: Trigger short Landmark Hint + Read aloud + Requeue note 3 questions later!
        setMistakeCount(1);
        setMissedNotes((prev) =>
          prev.includes(currentNoteId) ? prev : [...prev, currentNoteId]
        );
        setQueue((prevQueue) =>
          requeueMissedNote(prevQueue, currentIndex, currentNoteId)
        );

        const hintMsg = currentNote.landmarkHint.explanation;
        setUnicornMessage(`💡 ${hintMsg}`);
        speechNarrator.speak(hintMsg);
      } else {
        // 2nd Mistake: Highlight the exact key/bubble and read the answer aloud!
        setMistakeCount(2);
        const friendlyName = formatNoteDisplayName(currentNoteId, namingConvention);
        const revealMsg = `Tap glowing yellow ${friendlyName}!`;
        setUnicornMessage(`💛 ${revealMsg}`);
        speechNarrator.speak(revealMsg);
      }
    },
    [mistakeCount, currentNoteId, currentIndex, currentNote, namingConvention]
  );

  const onPianoSelect = (selectedNoteId: NoteId) => {
    if (selectedNoteId === currentNoteId) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer(selectedNoteId);
    }
  };

  const onBubbleSelect = (selectedLetter: NoteLetter) => {
    if (selectedLetter === currentNote.letter) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  if (isRoundFinished) {
    const canUnlockBossNow = earnedStars >= 2 && Boolean(onStartBossConcert);

    return (
      <div className="max-w-lg mx-auto w-full bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-4 border-purple-300 text-center flex flex-col items-center gap-4">
        {/* 3 Giant Animated Stars */}
        <div className="flex gap-3">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-14 h-14 transition-transform duration-500 ${
                s <= earnedStars
                  ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md'
                  : 'text-slate-200 fill-slate-200'
              }`}
            />
          ))}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-purple-900">
          {earnedStars === 3
            ? '🏆 World Master! 3 Stars!'
            : earnedStars === 2
            ? '🎵 2 Stars! Song Unlocked!'
            : '🌈 1 Star! Great Start!'}
        </h2>

        {/* Visual 3-Step Progress Pill */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
            🌈 ⭐1
          </span>
          <span className="text-slate-300">➔</span>
          <span
            className={`px-3 py-1 rounded-full ${
              earnedStars >= 2
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-indigo-100 text-indigo-900 ring-2 ring-indigo-300'
            }`}
          >
            🎵 ⭐2 Real Notes
          </span>
          <span className="text-slate-300">➔</span>
          <span
            className={`px-3 py-1 rounded-full ${
              earnedStars >= 2
                ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-300'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            👑 Song
          </span>
        </div>

        <div className="flex items-center gap-2 bg-fuchsia-100 text-fuchsia-900 px-5 py-1.5 rounded-2xl font-black text-base">
          <Sparkles className="w-5 h-5 text-fuchsia-600" />
          +{sessionPoints} Sparkles
        </div>

        {/* 1 GIANT PRIMARY NEXT-STEP BUTTON */}
        <div className="w-full pt-1">
          {earnedStars === 1 ? (
            <button
              type="button"
              onClick={() => startFreshRound(mode, 1, speedChallenge)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-base sm:text-lg shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Next: 🎵 Star 2 (Real Notes)!</span>
            </button>
          ) : canUnlockBossNow ? (
            <button
              type="button"
              onClick={onStartBossConcert}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white font-black text-base sm:text-lg shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-6 h-6" />
              <span>👑 Play Boss Song!</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startFreshRound(mode, earnedStars, speedChallenge)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base sm:text-lg shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Play Again!</span>
            </button>
          )}
        </div>

        {/* Compact Secondary Actions Row */}
        <div className="flex items-center justify-center gap-3 w-full">
          {earnedStars === 2 && (
            <button
              type="button"
              onClick={() => startFreshRound(mode, 2, speedChallenge)}
              className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              Try for 3rd Star
            </button>
          )}

          <button
            type="button"
            onClick={() => startFreshRound(mode, earnedStars, speedChallenge)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Replay
          </button>

          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-black text-xs sm:text-sm cursor-pointer"
          >
            🗺️ Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 max-w-5xl mx-auto w-full">
      {/* Clean Top Bar: Map + Star Badge + Visual Dot Trail + Inline Mode Pill + Score */}
      <div className="flex items-center justify-between gap-2 bg-white/95 px-4 py-2.5 rounded-2xl shadow-sm border-2 border-purple-200">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-xs sm:text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Map
          </button>

          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-xl border text-xs font-black ${tierInfo.color}`}
          >
            {tierInfo.badge}
          </span>
        </div>

        {/* Visual Dot Progress Trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1" title={title}>
          {queue.map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all shrink-0 ${
                i < currentIndex
                  ? 'bg-emerald-400'
                  : i === currentIndex
                  ? 'bg-purple-600 scale-125 ring-2 ring-purple-300'
                  : 'bg-purple-100'
              }`}
            />
          ))}
        </div>

        {/* Inline Mode Switcher (🎹 | 🫧 | 🎤) + Streak & Points */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {(
              [
                { id: 'piano' as const, emoji: '🎹', title: 'Piano' },
                { id: 'bubbles' as const, emoji: '🫧', title: 'Bubbles' },
                { id: 'mic' as const, emoji: '🎤', title: 'Real Piano Mic' },
              ]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => startFreshRound(m.id, activeTierStars, speedChallenge)}
                title={m.title}
                className={`px-2 py-1 rounded-lg text-xs font-black cursor-pointer transition ${
                  mode === m.id ? 'bg-white shadow-xs scale-105' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>

          {canSpeedChallenge && (
            <button
              type="button"
              onClick={() => startFreshRound(mode, activeTierStars, !speedChallenge)}
              className={`px-2.5 py-1 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer border ${
                speedChallenge
                  ? 'bg-yellow-300 border-yellow-500 text-slate-900'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}
              title="Fast Dash Mode!"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}

          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-black text-xs sm:text-sm animate-bounce">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              {streak}x
            </div>
          )}

          <div className="flex items-center gap-1 bg-fuchsia-100 text-fuchsia-900 px-3 py-1 rounded-full font-black text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-fuchsia-600" />
            +{sessionPoints}
          </div>
        </div>
      </div>

      {/* Side-by-Side Mascot Coach + Music Staff (Zero vertical scroll!) */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <MaestroUnicorn
          sideDock
          mood={unicornMood}
          speechBubble={unicornMessage}
          onReplaySpeech={() => speechNarrator.speak(unicornMessage)}
          equipped={equipped}
          micVolume={micVol}
        />

        <div className="relative flex-1 w-full">
          <GrandStaffSVG
            clefMode={clefMode}
            activeNotes={[currentNoteId]}
            targetNote={currentNoteId}
            useColors={useColors}
            hintLevel={mistakeCount}
            namingConvention={namingConvention}
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

      {/* Active Game Input Mode (Mode 1: Adaptive 1-or-2 Octave Piano, Mode 2: Bubbles, Mode 3: Real Piano Mic) */}
      <div className="pt-0.5">
        {mode === 'piano' && (
          <PianoKeyboard
            onSelectNote={onPianoSelect}
            useColors={useColors}
            namingConvention={namingConvention}
            highlightedNote={mistakeCount >= 2 ? currentNoteId : null}
            activeClef={clefMode}
          />
        )}

        {mode === 'bubbles' && (
          <NoteBubbles
            onSelectLetter={onBubbleSelect}
            useColors={useColors}
            namingConvention={namingConvention}
            highlightedLetter={mistakeCount >= 2 ? currentNote.letter : null}
          />
        )}

        {mode === 'mic' && (
          <MicListener
            targetNote={currentNoteId}
            onNoteMatched={() => handleCorrectAnswer()}
            namingConvention={namingConvention}
            sensitivity={micSensitivity}
            onVolumeChange={setMicVol}
            onSwitchModeFallback={() => startFreshRound('piano', activeTierStars)}
          />
        )}
      </div>
    </div>
  );
};
