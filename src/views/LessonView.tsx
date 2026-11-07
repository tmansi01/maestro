import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';
import { WorldDefinition } from '../data/curriculum';
import { NamingConvention, NoteId, formatNoteDisplayName } from '../data/notes';
import { EquippedAccessories } from '../store/useGameStore';
import { GrandStaffSVG } from '../components/staff/GrandStaffSVG';
import { MaestroUnicorn } from '../components/mascot/MaestroUnicorn';
import { PianoKeyboard } from '../components/inputs/PianoKeyboard';
import { audioEngine } from '../engine/audio';
import { speechNarrator } from '../engine/speech';

interface LessonViewProps {
  world: WorldDefinition;
  namingConvention: NamingConvention;
  equipped: EquippedAccessories;
  onFinishLesson: () => void;
  onBack: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  world,
  namingConvention,
  equipped,
  onFinishLesson,
  onBack,
}) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [sandboxCleared, setSandboxCleared] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const slide = world.lessonSlides[slideIdx];
  const activeBubbleText = feedbackMsg || slide.speechText;

  // Play the target note chime on slide change (Voiceover speaks ONLY when she taps 🔊 or makes a mistake!)
  useEffect(() => {
    setSandboxCleared(!slide.tryItNote);
    setFeedbackMsg(null);
    speechNarrator.stop();
    if (slide.highlightNotes.length > 0) {
      const firstNote = slide.highlightNotes[slide.highlightNotes.length - 1];
      setTimeout(() => audioEngine.playNote(firstNote), 250);
    }
    return () => speechNarrator.stop();
  }, [slideIdx, slide]);

  const handlePianoSelect = (noteId: NoteId) => {
    audioEngine.playNote(noteId);

    if (slide.tryItNote) {
      if (noteId === slide.tryItNote) {
        audioEngine.playSuccessSparkle(2);
        setSandboxCleared(true);
        const label = formatNoteDisplayName(noteId, namingConvention);
        setFeedbackMsg(`✨ Yay! That is ${label}!`);
      } else {
        const targetLabel = formatNoteDisplayName(slide.tryItNote, namingConvention);
        const hint = `Tap the glowing yellow key for ${targetLabel}!`;
        setFeedbackMsg(hint);
        speechNarrator.speak(hint);
      }
    }
  };

  const handleNext = () => {
    if (slideIdx < world.lessonSlides.length - 1) {
      setSlideIdx((i) => i + 1);
    } else {
      audioEngine.playFanfare();
      onFinishLesson();
    }
  };

  return (
    <div className="flex flex-col gap-2.5 max-w-5xl mx-auto w-full">
      {/* Compact Top Bar */}
      <div className="flex items-center justify-between bg-white/95 px-4 py-2.5 rounded-2xl shadow-sm border-2 border-purple-200">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-xs sm:text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Map
        </button>

        <h2 className="text-base sm:text-xl font-black text-slate-800">
          {world.emoji} {slide.title}
        </h2>

        {/* Visual Step Dots */}
        <div className="flex items-center gap-2">
          {world.lessonSlides.map((_, i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-transform ${
                i === slideIdx
                  ? 'bg-purple-600 scale-125'
                  : i < slideIdx
                  ? 'bg-emerald-400'
                  : 'bg-purple-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Side-by-Side Mascot Coach + Interactive Music Staff (Zero vertical scroll!) */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <MaestroUnicorn
          sideDock
          mood={sandboxCleared ? 'excited' : 'happy'}
          speechBubble={activeBubbleText}
          onReplaySpeech={() => speechNarrator.speak(activeBubbleText)}
          equipped={equipped}
        />

        <div className="relative flex-1 w-full">
          <GrandStaffSVG
            clefMode={slide.clef}
            activeNotes={slide.highlightNotes}
            targetNote={slide.tryItNote}
            useColors={true}
            hintLevel={0}
            namingConvention={namingConvention}
            showLabelsOnAll={true}
            onNoteClick={(n) => audioEngine.playNote(n)}
          />
          {slide.tryItNote && (
            <button
              type="button"
              onClick={() => audioEngine.playNote(slide.tryItNote!)}
              className="absolute top-2.5 right-3 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              Hear
            </button>
          )}
        </div>
      </div>

      {/* Compact Action Strip: Prompt on Left + Next Button on Right */}
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2 rounded-2xl border-2 transition-all ${
          sandboxCleared
            ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
            : 'bg-amber-50 border-amber-400 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {sandboxCleared ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
          )}
          <span className="font-black text-xs sm:text-base">
            {sandboxCleared ? 'Great job! Tap Next!' : slide.tryItPrompt}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {slideIdx > 0 && (
            <button
              type="button"
              onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className={`px-5 py-2 rounded-xl font-black text-sm sm:text-base shadow-md flex items-center gap-1.5 cursor-pointer transition ${
              sandboxCleared
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-105'
                : 'bg-purple-200 text-purple-900 hover:bg-purple-300'
            }`}
          >
            <span>
              {slideIdx < world.lessonSlides.length - 1 ? 'Next' : 'Play Game!'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 15-Key Piano Keyboard with Active Clef Context */}
      <PianoKeyboard
        onSelectNote={handlePianoSelect}
        useColors={true}
        namingConvention={namingConvention}
        highlightedNote={slide.tryItNote}
        activeClef={slide.clef}
      />
    </div>
  );
};
