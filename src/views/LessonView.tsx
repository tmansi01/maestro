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

  useEffect(() => {
    setSandboxCleared(!slide.tryItNote);
    setFeedbackMsg(null);
    speechNarrator.speak(slide.speechText);
    if (slide.highlightNotes.length > 0) {
      const firstNote = slide.highlightNotes[slide.highlightNotes.length - 1];
      setTimeout(() => audioEngine.playNote(firstNote), 300);
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
        const msg = `Yay! That is ${label}! You found it!`;
        setFeedbackMsg(msg);
        speechNarrator.speak(msg);
      } else {
        const targetLabel = formatNoteDisplayName(slide.tryItNote, namingConvention);
        setFeedbackMsg(`Almost! Look for the glowing yellow key for ${targetLabel}!`);
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
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white/90 px-4 py-3 rounded-2xl shadow-sm border-2 border-purple-200">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Map
        </button>

        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600">
            World {world.id} Story Lesson • Step {slideIdx + 1} of {world.lessonSlides.length}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-800">
            {slide.title}
          </h2>
        </div>

        <div className="flex gap-1.5">
          {world.lessonSlides.map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full ${
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

      {/* Maestro Unicorn Story Narrator */}
      <MaestroUnicorn
        mood={sandboxCleared ? 'excited' : 'happy'}
        speechBubble={feedbackMsg || slide.speechText}
        onReplaySpeech={() => speechNarrator.speak(slide.speechText)}
        equipped={equipped}
      />

      {/* Interactive Staff Display (Tap any note on the staff to hear it!) */}
      <div className="relative">
        <GrandStaffSVG
          clefMode={slide.clef}
          activeNotes={slide.highlightNotes}
          targetNote={slide.tryItNote}
          useColors={true}
          hintLevel={0}
          namingConvention={namingConvention}
          showLabelsOnAll={true}
          onNoteClick={(n) => {
            audioEngine.playNote(n);
          }}
        />
        <div className="text-center mt-1.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            <Volume2 className="w-3.5 h-3.5" />
            Tip: You can tap any note on the staff or piano below to hear it!
          </span>
        </div>
      </div>

      {/* "Try It" Interactive Sandbox Banner */}
      {slide.tryItNote && (
        <div
          className={`flex items-center justify-between px-5 py-3 rounded-2xl border-2 transition-all ${
            sandboxCleared
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
              : 'bg-amber-50 border-amber-400 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {sandboxCleared ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-600 animate-spin shrink-0" />
            )}
            <span className="font-extrabold text-sm sm:text-base">
              {sandboxCleared
                ? 'Awesome job! Click Next to continue!'
                : slide.tryItPrompt}
            </span>
          </div>

          {sandboxCleared && (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm sm:text-base shadow-md hover:brightness-105 flex items-center gap-2 cursor-pointer animate-bounce"
            >
              {slideIdx < world.lessonSlides.length - 1 ? 'Next Step' : 'Finish Lesson!'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Interactive Piano Sandbox */}
      <PianoKeyboard
        onSelectNote={handlePianoSelect}
        useColors={true}
        namingConvention={namingConvention}
        highlightedNote={slide.tryItNote}
      />

      {/* Bottom Navigation Buttons */}
      <div className="flex justify-between items-center pt-1">
        <button
          type="button"
          disabled={slideIdx === 0}
          onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
          className="px-4 py-2.5 rounded-xl bg-white border-2 border-purple-200 text-purple-700 font-bold text-sm disabled:opacity-40 cursor-pointer"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={`px-6 py-3 rounded-2xl font-black text-base shadow-lg flex items-center gap-2 cursor-pointer transition ${
            sandboxCleared
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105'
              : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
          }`}
        >
          {slideIdx < world.lessonSlides.length - 1 ? 'Next' : 'Start Playing Games!'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
