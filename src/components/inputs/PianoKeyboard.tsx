import React, { useEffect, useState } from 'react';
import {
  ALL_NOTE_IDS,
  ClefType,
  NamingConvention,
  NOTES,
  NoteId,
  formatNoteLabel,
} from '../../data/notes';

interface PianoKeyboardProps {
  onSelectNote: (noteId: NoteId) => void;
  useColors: boolean;
  namingConvention: NamingConvention;
  highlightedNote?: NoteId | null;
  activeClef?: ClefType;
  disabled?: boolean;
}

/**
 * 2-Octave Interactive Piano Keyboard (C3 to C5 = 15 White Keys + Decorative Black Keys for visual context).
 * Also supports physical keyboard keys on MacBook and Google Chromebook!
 */
export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  onSelectNote,
  useColors,
  namingConvention,
  highlightedNote,
  activeClef = 'grand',
  disabled = false,
}) => {
  const [pressedKey, setPressedKey] = useState<NoteId | null>(null);

  // Physical keyboard support for MacBook & Chromebook (keys C, D, E, F, G, A, B or number/QWERTY keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || e.repeat) return;
      const key = e.key.toUpperCase();
      if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(key)) {
        // If highlightedNote matches that letter, pick that exact octave; otherwise default to octave 4
        if (highlightedNote && NOTES[highlightedNote].letter === key) {
          onSelectNote(highlightedNote);
        } else {
          const fallbackId = `${key}4` as NoteId;
          if (NOTES[fallbackId]) onSelectNote(fallbackId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, highlightedNote, onSelectNote]);

  // Which white keys have a black key immediately to their right?
  const hasBlackKeyRight = (noteId: NoteId) => {
    if (noteId === 'C5') return false;
    const letter = NOTES[noteId].letter;
    return letter === 'C' || letter === 'D' || letter === 'F' || letter === 'G' || letter === 'A';
  };

  const handleTap = (noteId: NoteId) => {
    if (disabled) return;
    setPressedKey(noteId);
    onSelectNote(noteId);
    setTimeout(() => setPressedKey(null), 220);
  };

  return (
    <div className="w-full max-w-4xl mx-auto select-none">
      {/* Kid-Friendly Hand & Landmark Orientation Bar */}
      <div className="flex justify-between items-center text-[11px] sm:text-xs font-black px-2 mb-1">
        <span
          className={`px-2.5 py-0.5 rounded-full transition-opacity ${
            activeClef === 'treble'
              ? 'bg-emerald-50 text-emerald-700 opacity-60'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          🤚 Left Hand (𝄢 Low)
        </span>
        <span className="bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
          🦄 Middle C
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full transition-opacity ${
            activeClef === 'bass'
              ? 'bg-cyan-50 text-cyan-700 opacity-60'
              : 'bg-cyan-100 text-cyan-800'
          }`}
        >
          ✋ Right Hand (𝄞 High)
        </span>
      </div>

      {/* Piano Frame */}
      <div className="relative bg-slate-900 p-2 sm:p-2.5 rounded-3xl shadow-xl border-4 border-purple-400">
        <div className="relative flex w-full h-32 sm:h-40 gap-1">
          {ALL_NOTE_IDS.map((noteId) => {
            const note = NOTES[noteId];
            const isHighlighted = highlightedNote === noteId;
            const isPressed = pressedKey === noteId;
            const isMiddleC = noteId === 'C4';

            // Gently dim the inactive side when practicing a single clef so all 15 keys stay for context
            const isOutsideActiveClef =
              !isHighlighted &&
              ((activeClef === 'treble' && note.midi < NOTES.C4.midi) ||
                (activeClef === 'bass' && note.midi > NOTES.C4.midi));

            return (
              <div
                key={noteId}
                className={`relative flex-1 h-full transition-opacity ${
                  isOutsideActiveClef ? 'opacity-65 hover:opacity-100' : 'opacity-100'
                }`}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTap(noteId)}
                  style={{
                    backgroundColor: isHighlighted
                      ? '#fef08a'
                      : useColors
                      ? note.lightColor
                      : '#ffffff',
                    borderColor: isHighlighted
                      ? '#eab308'
                      : useColors
                      ? note.color
                      : '#cbd5e1',
                  }}
                  className={`w-full h-full rounded-b-2xl rounded-t-md border-b-8 border-x-2 flex flex-col items-center justify-end pb-2 transition-all cursor-pointer active:translate-y-1 active:border-b-2 ${
                    isPressed ? 'translate-y-1 border-b-2 brightness-95' : ''
                  } ${isHighlighted ? 'animate-pulse ring-4 ring-yellow-400 z-10' : ''}`}
                  aria-label={`Piano key ${noteId}`}
                >
                  {/* Visual Landmark Icons (No confusing octave numbers!) */}
                  {noteId === 'C3' && (
                    <span className="text-xs sm:text-sm mb-0.5" title="Low C">
                      💎
                    </span>
                  )}
                  {noteId === 'F3' && (
                    <span className="text-xs font-black text-emerald-700 mb-0.5" title="Two Dots F">
                      ••
                    </span>
                  )}
                  {isMiddleC && (
                    <span className="text-base sm:text-lg mb-0.5" title="Middle C">
                      🦄
                    </span>
                  )}
                  {noteId === 'G4' && (
                    <span className="text-xs sm:text-sm mb-0.5" title="Swirl G">
                      🌀
                    </span>
                  )}
                  {noteId === 'C5' && (
                    <span className="text-xs sm:text-sm mb-0.5" title="High C">
                      ⭐
                    </span>
                  )}

                  {/* Color dot */}
                  <span
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full mb-1 shadow-xs"
                    style={{
                      backgroundColor: useColors || isHighlighted ? note.color : '#94a3b8',
                    }}
                  />

                  {/* Big Clean Note Label (C, D, E or Do, Re, Mi — no '4' or '3' digits!) */}
                  <span className="font-black text-sm sm:text-base text-slate-900 leading-none">
                    {formatNoteLabel(note.letter, namingConvention)}
                  </span>
                </button>

                {/* Decorative Black Key (non-interactive for natural-note worlds so she doesn't mis-tap) */}
                {hasBlackKeyRight(noteId) && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 -right-[28%] w-[54%] h-[58%] bg-gradient-to-b from-slate-800 to-slate-950 rounded-b-xl border-x border-b-4 border-slate-700 z-20 shadow-md"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
