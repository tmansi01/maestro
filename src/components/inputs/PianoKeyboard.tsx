import React, { useEffect, useState } from 'react';
import {
  ALL_NOTE_IDS,
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
      {/* Octave orientation bar */}
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider px-2 mb-1 text-purple-800">
        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
          𝄢 Bass Clef Side (Left Hand: C3–B3)
        </span>
        <span className="bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
          🦄 Middle C (C4)
        </span>
        <span className="bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full">
          𝄞 Treble Clef Side (Right Hand: C4–C5)
        </span>
      </div>

      {/* Piano Frame */}
      <div className="relative bg-slate-900 p-2 sm:p-3 rounded-3xl shadow-xl border-4 border-purple-400">
        <div className="relative flex w-full h-36 sm:h-44 gap-1">
          {ALL_NOTE_IDS.map((noteId) => {
            const note = NOTES[noteId];
            const isHighlighted = highlightedNote === noteId;
            const isPressed = pressedKey === noteId;
            const isMiddleC = noteId === 'C4';

            return (
              <div key={noteId} className="relative flex-1 h-full">
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
                  className={`w-full h-full rounded-b-2xl rounded-t-md border-b-8 border-x-2 flex flex-col items-center justify-end pb-2.5 transition-all cursor-pointer active:translate-y-1 active:border-b-2 ${
                    isPressed ? 'translate-y-1 border-b-2 brightness-95' : ''
                  } ${isHighlighted ? 'animate-pulse ring-4 ring-yellow-400 z-10' : ''}`}
                  aria-label={`Piano key ${noteId}`}
                >
                  {/* Landmark Badge on Middle C, Bass F, Treble G */}
                  {isMiddleC && (
                    <span className="text-sm sm:text-base mb-0.5" title="Middle C">
                      🦄
                    </span>
                  )}
                  {noteId === 'F3' && (
                    <span className="text-[11px] font-extrabold text-emerald-700 mb-0.5">
                      ••
                    </span>
                  )}
                  {noteId === 'G4' && (
                    <span className="text-[11px] font-extrabold text-cyan-700 mb-0.5">
                      𝄞
                    </span>
                  )}

                  {/* Color dot */}
                  <span
                    className="w-3.5 h-3.5 rounded-full mb-1 shadow-xs"
                    style={{
                      backgroundColor: useColors || isHighlighted ? note.color : '#94a3b8',
                    }}
                  />

                  {/* Note Label */}
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                    {formatNoteLabel(note.letter, namingConvention)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {noteId}
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
