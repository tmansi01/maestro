import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Music, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { WorldDefinition } from '../data/curriculum';
import { ColorMode, NamingConvention, NOTES, NoteId, formatNoteDisplayName } from '../data/notes';
import { EquippedAccessories } from '../store/useGameStore';
import { GrandStaffSVG } from '../components/staff/GrandStaffSVG';
import { MaestroUnicorn } from '../components/mascot/MaestroUnicorn';
import { PianoKeyboard } from '../components/inputs/PianoKeyboard';
import { audioEngine } from '../engine/audio';
import { speechNarrator } from '../engine/speech';

interface BossConcertViewProps {
  world: WorldDefinition;
  colorMode: ColorMode;
  namingConvention: NamingConvention;
  equipped: EquippedAccessories;
  onConcertComplete: (pointsEarned: number) => void;
  onNextWorld?: () => void;
  onBack: () => void;
}

export const BossConcertView: React.FC<BossConcertViewProps> = ({
  world,
  colorMode,
  namingConvention,
  equipped,
  onConcertComplete,
  onNextWorld,
  onBack,
}) => {
  const melody = world.bossMelody.notes;
  const [noteIdx, setNoteIdx] = useState(0);
  const [mistakeOnStep, setMistakeOnStep] = useState(false);
  const [concertDone, setConcertDone] = useState(false);

  const currentItem = melody[noteIdx] || melody[0];
  // Classic black-and-white sheet music for the Boss Concert finale (unless 'always' in Parent Settings or she slips!)
  const useColors = colorMode === 'always' || mistakeOnStep;

  useEffect(() => {
    speechNarrator.stop();
    return () => speechNarrator.stop();
  }, [world]);

  const playFullDemo = () => {
    melody.forEach((m, idx) => {
      setTimeout(() => {
        audioEngine.playNote(m.noteId, 0.55);
      }, idx * 380);
    });
  };

  const handlePianoNote = (playedId: NoteId) => {
    audioEngine.playNote(playedId);

    if (playedId === currentItem.noteId) {
      setMistakeOnStep(false);
      if (noteIdx + 1 >= melody.length) {
        setConcertDone(true);
        audioEngine.playFanfare();
        confetti({
          particleCount: 110,
          spread: 90,
          origin: { y: 0.55 },
        });
        onConcertComplete(100);
      } else {
        setNoteIdx((i) => i + 1);
      }
    } else {
      audioEngine.playGentleHintSound();
      setMistakeOnStep(true);
      const targetNote = NOTES[currentItem.noteId];
      const friendly = formatNoteDisplayName(currentItem.noteId, namingConvention);
      speechNarrator.speak(`${targetNote.landmarkHint.explanation} Tap glowing ${friendly}!`);
    }
  };

  if (concertDone) {
    return (
      <div className="max-w-lg mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-300 text-center flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-inner">
          <Trophy className="w-12 h-12" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-purple-900">
          🎉 World {world.id} Complete!
        </h2>

        {world.id < 8 && (
          <p className="text-sm sm:text-base font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full">
            🔓 World {world.id + 1} Unlocked!
          </p>
        )}

        <div className="flex items-center gap-2 bg-fuchsia-100 text-fuchsia-900 px-5 py-1.5 rounded-2xl font-black text-lg">
          <Sparkles className="w-5 h-5 text-fuchsia-600" />
          +100 Sparkles!
        </div>

        {/* 1-Tap Next World Primary CTA */}
        {world.id < 8 && onNextWorld && (
          <button
            type="button"
            onClick={onNextWorld}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-base sm:text-lg shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>🚀 Start World {world.id + 1}!</span>
          </button>
        )}

        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setNoteIdx(0);
              setConcertDone(false);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Play Song Again
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

  const windowNotes = melody.slice(noteIdx, noteIdx + 4).map((m) => m.noteId);
  const friendlyTarget = formatNoteDisplayName(currentItem.noteId, namingConvention);
  const bubbleText = mistakeOnStep
    ? `💡 ${NOTES[currentItem.noteId].landmarkHint.explanation} (Tap ${friendlyTarget}!)`
    : `🎵 Play "${currentItem.lyric}"! (${noteIdx + 1}/${melody.length})`;

  return (
    <div className="flex flex-col gap-2.5 max-w-5xl mx-auto w-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white px-4 py-2.5 rounded-2xl shadow-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 font-black text-xs sm:text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Map
        </button>

        <h2 className="text-base sm:text-xl font-black flex items-center gap-1.5">
          <span>👑</span>
          <span>{world.bossMelody.title}</span>
        </h2>

        <button
          type="button"
          onClick={playFullDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-orange-600 font-black text-xs sm:text-sm shadow-xs hover:scale-105 transition cursor-pointer"
        >
          <Play className="w-4 h-4 fill-orange-600" />
          Listen
        </button>
      </div>

      {/* Lyrics Ribbon */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white/90 px-3 py-2 rounded-2xl border-2 border-amber-200">
        <Music className="w-4 h-4 text-amber-600" />
        {melody.map((m, i) => (
          <span
            key={i}
            className={`px-2 py-0.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              i === noteIdx
                ? 'bg-amber-400 text-slate-900 scale-110 shadow-xs'
                : i < noteIdx
                ? 'bg-emerald-100 text-emerald-700 opacity-60'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {m.lyric}
          </span>
        ))}
      </div>

      {/* Side-by-Side Mascot Coach + 4-Note Scrolling Staff (Zero vertical scroll!) */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <MaestroUnicorn
          sideDock
          mood={mistakeOnStep ? 'encouraging' : 'excited'}
          speechBubble={bubbleText}
          onReplaySpeech={() => speechNarrator.speak(bubbleText)}
          equipped={equipped}
        />

        <div className="flex-1 w-full">
          <GrandStaffSVG
            clefMode={world.clef}
            activeNotes={windowNotes}
            targetNote={currentItem.noteId}
            useColors={useColors}
            hintLevel={mistakeOnStep ? 1 : 0}
            namingConvention={namingConvention}
          />
        </div>
      </div>

      {/* Adaptive 1-or-2 Octave Piano Keyboard */}
      <PianoKeyboard
        onSelectNote={handlePianoNote}
        useColors={useColors}
        namingConvention={namingConvention}
        highlightedNote={mistakeOnStep ? currentItem.noteId : null}
        activeClef={world.clef}
      />
    </div>
  );
};
