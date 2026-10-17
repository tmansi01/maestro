import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Flame,
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
  const [queue, setQueue] = useState<NoteId[]>(() =>
    generateDynamicNoteQueue(notePool, 10, trickyNotesCount)
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
    'Look at the note on the staff! Find your nearest Landmark note if you need a clue!'
  );
  const [unicornMood, setUnicornMood] = useState<'happy' | 'excited' | 'encouraging' | 'listening'>(
    initialMode === 'mic' ? 'listening' : 'happy'
  );

  const currentNoteId = queue[currentIndex] || notePool[0] || 'C4';
  const currentNote = NOTES[currentNoteId];
  const useColors = shouldUseNoteColors(colorMode, currentModeStars, mistakeCount);

  const startFreshRound = useCallback(
    (selectedMode: GameMode, isSpeed = speedChallenge) => {
      const freshQueue = generateDynamicNoteQueue(notePool, 10, trickyNotesCount);
      setMode(selectedMode);
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
          ? 'Play the note on your real piano! My magic horn is listening!'
          : 'Can you spot this note on the staff?'
      );
    },
    [notePool, trickyNotesCount, speedChallenge]
  );

  useEffect(() => {
    return () => speechNarrator.stop();
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    audioEngine.playNote(currentNoteId);
    const wasFirstTry = mistakeCount === 0;
    const nextStreak = wasFirstTry ? streak + 1 : 1;
    audioEngine.playSuccessSparkle(nextStreak);

    const pointsGain = (wasFirstTry ? 15 : 8) + (nextStreak >= 3 ? 10 : 0) + (speedChallenge ? 5 : 0);
    const nextPoints = sessionPoints + pointsGain;
    const nextFirstTry = wasFirstTry ? firstTryCount + 1 : firstTryCount;

    setStreak(nextStreak);
    setSessionPoints(nextPoints);
    setFirstTryCount(nextFirstTry);
    setUnicornMood('excited');

    const friendlyName = formatNoteDisplayName(currentNoteId, namingConvention);
    if (nextStreak >= 3) {
      setUnicornMessage(`🌈 ${nextStreak}x Rainbow Streak! Yes, that is ${friendlyName}! (+${pointsGain} pts)`);
    } else {
      setUnicornMessage(`✨ Great job! That is ${friendlyName}! (+${pointsGain} pts)`);
    }

    if (currentIndex + 1 >= queue.length) {
      // Round complete!
      const accuracy = nextFirstTry / queue.length;
      const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.75 ? 2 : 1;
      setEarnedStars(stars);
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
      }, 480);
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
        // 1st Mistake: Trigger Landmark Hint + Requeue note 3 questions later for Spaced Repetition!
        setMistakeCount(1);
        setMissedNotes((prev) => (prev.includes(currentNoteId) ? prev : [...prev, currentNoteId]));
        setQueue((prevQueue) => requeueMissedNote(prevQueue, currentIndex, currentNoteId));

        const hintMsg = `Hint: ${currentNote.landmarkHint.explanation}`;
        setUnicornMessage(hintMsg);
        speechNarrator.speak(currentNote.landmarkHint.explanation);
      } else {
        // 2nd Mistake: Highlight the exact key/bubble and read the answer aloud so she never gets stuck!
        setMistakeCount(2);
        const friendlyName = formatNoteDisplayName(currentNoteId, namingConvention);
        const revealMsg = `Let’s do it together! This note is ${friendlyName}. Tap the glowing yellow button!`;
        setUnicornMessage(revealMsg);
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
    return (
      <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-purple-300 text-center flex flex-col items-center gap-5">
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
            ? 'Unicorn Superstar! 3 Stars!'
            : earnedStars === 2
            ? 'Awesome Job! 2 Stars!'
            : 'Level Complete! 1 Star!'}
        </h2>

        <p className="text-slate-600 font-semibold text-base">
          You earned <span className="text-purple-700 font-black">+{sessionPoints} Sparkle Points</span> and got{' '}
          <span className="text-emerald-600 font-black">
            {firstTryCount} of {queue.length}
          </span>{' '}
          notes on the first try!
        </p>

        <div className="flex flex-wrap justify-center gap-3 w-full pt-2">
          <button
            type="button"
            onClick={() => startFreshRound(mode, speedChallenge)}
            className="px-5 py-3 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-black flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            Replay with New Notes
          </button>

          {onStartBossConcert && (
            <button
              type="button"
              onClick={onStartBossConcert}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white font-black shadow-lg hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              Play Boss Melody Concert!
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-2xl bg-slate-800 text-white font-bold cursor-pointer"
          >
            Back to World Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 max-w-5xl mx-auto w-full">
      {/* Top Status & Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/95 px-4 py-2.5 rounded-2xl shadow-sm border-2 border-purple-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs sm:text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Map
          </button>
          <div>
            <h2 className="font-black text-slate-800 text-sm sm:text-base">{title}</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
              <span>
                Note {currentIndex + 1} of {queue.length}
              </span>
              {queue.length > 10 && (
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[11px]">
                  +Review Bonus
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 Game Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-purple-50 p-1 rounded-xl border border-purple-200">
          <button
            type="button"
            onClick={() => startFreshRound('piano')}
            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs sm:text-sm transition cursor-pointer ${
              mode === 'piano'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            🎹 Magic Piano
          </button>
          <button
            type="button"
            onClick={() => startFreshRound('bubbles')}
            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs sm:text-sm transition cursor-pointer ${
              mode === 'bubbles'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            🏷️ Note Bubbles
          </button>
          <button
            type="button"
            onClick={() => startFreshRound('mic')}
            className={`px-3 py-1.5 rounded-lg font-extrabold text-xs sm:text-sm transition cursor-pointer ${
              mode === 'mic'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-800 hover:bg-purple-100'
            }`}
          >
            🎤 Real Piano Mic
          </button>
        </div>

        {/* Streak, Points & Optional Rainbow Dash Speed Toggle */}
        <div className="flex items-center gap-2.5">
          {canSpeedChallenge && (
            <button
              type="button"
              onClick={() => startFreshRound(mode, !speedChallenge)}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer border ${
                speedChallenge
                  ? 'bg-yellow-300 border-yellow-500 text-slate-900'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}
              title="Rainbow Dash Speed Mode!"
            >
              <Zap className="w-3.5 h-3.5" />
              Dash
            </button>
          )}

          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-black text-xs sm:text-sm animate-bounce">
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

      {/* Progress Bar */}
      <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden border border-purple-200">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / queue.length) * 100)}%` }}
        />
      </div>

      {/* Maestro Unicorn & Helpful Speech Bubble */}
      <MaestroUnicorn
        compact
        mood={unicornMood}
        speechBubble={unicornMessage}
        onReplaySpeech={() => speechNarrator.speak(unicornMessage)}
        equipped={equipped}
        micVolume={micVol}
      />

      {/* Interactive Music Staff with Progressive Landmark Hints */}
      <div className="relative">
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
          className="absolute top-3 right-4 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          Hear Note
        </button>
      </div>

      {/* Active Game Input Mode (Mode 1: Piano, Mode 2: Bubbles, Mode 3: Real Piano Mic) */}
      <div className="pt-1">
        {mode === 'piano' && (
          <PianoKeyboard
            onSelectNote={onPianoSelect}
            useColors={useColors}
            namingConvention={namingConvention}
            highlightedNote={mistakeCount >= 2 ? currentNoteId : null}
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
            onSwitchModeFallback={() => startFreshRound('piano')}
          />
        )}
      </div>
    </div>
  );
};
