import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Music, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { WorldDefinition } from '../data/curriculum';
import { NamingConvention, NoteId, formatNoteLabel, NOTES } from '../data/notes';
import { EquippedAccessories } from '../store/useGameStore';
import { GrandStaffSVG } from '../components/staff/GrandStaffSVG';
import { MaestroUnicorn } from '../components/mascot/MaestroUnicorn';
import { PianoKeyboard } from '../components/inputs/PianoKeyboard';
import { audioEngine } from '../engine/audio';
import { speechNarrator } from '../engine/speech';

interface BossConcertViewProps {
  world: WorldDefinition;
  namingConvention: NamingConvention;
  equipped: EquippedAccessories;
  onConcertComplete: (pointsEarned: number) => void;
  onBack: () => void;
}

export const BossConcertView: React.FC<BossConcertViewProps> = ({
  world,
  namingConvention,
  equipped,
  onConcertComplete,
  onBack,
}) => {
  const melody = world.bossMelody.notes;
  const [noteIdx, setNoteIdx] = useState(0);
  const [mistakeOnStep, setMistakeOnStep] = useState(false);
  const [concertDone, setConcertDone] = useState(false);

  const currentItem = melody[noteIdx] || melody[0];

  useEffect(() => {
    speechNarrator.speak(world.bossMelody.introSpeech);
    return () => speechNarrator.stop();
  }, [world]);

  // Listen to full song demo
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
    }
  };

  if (concertDone) {
    return (
      <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-300 text-center flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-inner">
          <Trophy className="w-12 h-12" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-purple-900">
          🎉 World {world.id} Boss Concert Complete!
        </h2>

        <p className="text-slate-700 font-semibold text-base">
          Bravo! You performed <span className="font-black text-pink-600">{world.bossMelody.title}</span> and earned{' '}
          <span className="font-black text-purple-700">+100 Sparkle Points!</span>
          {world.id < 8 && ' The next World is now unlocked on your Adventure Map!'}
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setNoteIdx(0);
              setConcertDone(false);
            }}
            className="px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            Play Song Again
          </button>

          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black shadow-lg cursor-pointer"
          >
            Continue to World Map
          </button>
        </div>
      </div>
    );
  }

  // Show a window of up to 4 upcoming notes on the staff so it looks like real sheet music!
  const windowNotes = melody.slice(noteIdx, noteIdx + 4).map((m) => m.noteId);

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white px-5 py-3 rounded-2xl shadow-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 font-bold text-xs sm:text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider opacity-90 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            World {world.id} Boss Melody Concert
          </span>
          <h2 className="text-lg sm:text-xl font-black">{world.bossMelody.title}</h2>
        </div>

        <button
          type="button"
          onClick={playFullDemo}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-orange-600 font-black text-xs sm:text-sm shadow-xs hover:scale-105 transition cursor-pointer"
        >
          <Play className="w-4 h-4 fill-orange-600" />
          Listen to Song
        </button>
      </div>

      {/* Maestro Unicorn */}
      <MaestroUnicorn
        compact
        mood={mistakeOnStep ? 'encouraging' : 'excited'}
        speechBubble={
          mistakeOnStep
            ? `Hint: Look for ${formatNoteLabel(NOTES[currentItem.noteId].letter, namingConvention)} (${currentItem.noteId}) glowing in yellow on the piano!`
            : `Play the first note on the left for "${currentItem.lyric}"! (${noteIdx + 1} of ${melody.length})`
        }
        equipped={equipped}
      />

      {/* Lyrics Ribbon */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-white/90 px-4 py-2.5 rounded-2xl border-2 border-amber-200">
        <Music className="w-4 h-4 text-amber-600" />
        {melody.map((m, i) => (
          <span
            key={i}
            className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              i === noteIdx
                ? 'bg-amber-400 text-slate-900 scale-110 shadow-xs'
                : i < noteIdx
                ? 'bg-emerald-100 text-emerald-700 line-through opacity-70'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {m.lyric}
          </span>
        ))}
      </div>

      {/* Staff showing 4-note scrolling window */}
      <GrandStaffSVG
        clefMode={world.clef}
        activeNotes={windowNotes}
        targetNote={currentItem.noteId}
        useColors={true}
        hintLevel={mistakeOnStep ? 2 : 0}
        namingConvention={namingConvention}
      />

      {/* Piano Keyboard */}
      <PianoKeyboard
        onSelectNote={handlePianoNote}
        useColors={true}
        namingConvention={namingConvention}
        highlightedNote={mistakeOnStep ? currentItem.noteId : null}
      />
    </div>
  );
};
