import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react';
import { WorldDefinition } from '../data/curriculum';
import { NamingConvention, NOTES, NoteId, formatNoteDisplayName } from '../data/notes';
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
  const [mistakeMade, setMistakeMade] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const slide = world.lessonSlides[slideIdx];
  const isQuiz = Boolean(slide.isQuizSlide);
  const activeBubbleText =
    feedbackMsg ||
    (sandboxCleared
      ? '✨ Great job! Tap Next!'
      : `${slide.speechText} (${slide.tryItPrompt})`);

  // Play the target note chime on slide change (Voiceover speaks ONLY when she taps 🔊 or makes a mistake!)
  useEffect(() => {
    setSandboxCleared(!slide.tryItNote);
    setMistakeMade(false);
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
        setFeedbackMsg(`✨ Yay! That is ${label}! Tap Next!`);
      } else {
        audioEngine.playGentleHintSound();
        setMistakeMade(true);
        const targetNote = NOTES[slide.tryItNote];
        const targetLabel = formatNoteDisplayName(slide.tryItNote, namingConvention);
        const hint = `${targetNote.landmarkHint.explanation} Tap glowing ${targetLabel}!`;
        setFeedbackMsg(`💡 ${hint}`);
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
      {/* Unified Top Bar: Map + Step Dots + Next Button */}
      <div className="flex items-center justify-between gap-2 bg-white/95 px-4 py-2.5 rounded-2xl shadow-sm border-2 border-purple-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-xs sm:text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Map
          </button>

          {slideIdx > 0 && (
            <button
              type="button"
              onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              title="Previous Slide"
            >
              ⬅
            </button>
          )}
        </div>

        {/* Center Title + Visual Step Dots */}
        <div className="flex items-center gap-2.5">
          <h2 className="hidden sm:block text-base font-black text-slate-800">
            {world.emoji} {slide.title}
          </h2>
          <div className="flex items-center gap-1.5">
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

        {/* Prominent Next / Play Game Button */}
        <button
          type="button"
          disabled={!sandboxCleared}
          onClick={handleNext}
          className={`px-5 py-2 rounded-xl font-black text-xs sm:text-base shadow-md flex items-center gap-1.5 transition ${
            sandboxCleared
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-105 animate-pulse cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>
            {slideIdx < world.lessonSlides.length - 1 ? 'Next' : 'Play!'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Side-by-Side Mascot Coach + Interactive Music Staff (Single-focus, zero duplicate text bars!) */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <MaestroUnicorn
          sideDock
          mood={sandboxCleared ? 'excited' : mistakeMade ? 'encouraging' : 'happy'}
          speechBubble={activeBubbleText}
          onReplaySpeech={() => speechNarrator.speak(activeBubbleText)}
          equipped={equipped}
        />

        <div className="relative flex-1 w-full">
          <GrandStaffSVG
            clefMode={slide.clef}
            activeNotes={slide.highlightNotes}
            targetNote={slide.tryItNote}
            useColors={!isQuiz || mistakeMade || sandboxCleared}
            hintLevel={isQuiz && mistakeMade ? 1 : 0}
            namingConvention={namingConvention}
            showLabelsOnAll={!isQuiz || mistakeMade || sandboxCleared}
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

      {/* Dynamic 1-or-2 Octave Piano Keyboard (On Quiz Slide, only highlights if she slips!) */}
      <PianoKeyboard
        onSelectNote={handlePianoSelect}
        useColors={!isQuiz || mistakeMade || sandboxCleared}
        namingConvention={namingConvention}
        highlightedNote={!isQuiz || mistakeMade ? slide.tryItNote : null}
        activeClef={slide.clef}
      />
    </div>
  );
};
