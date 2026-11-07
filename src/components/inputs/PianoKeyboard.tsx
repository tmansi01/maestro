import React, { useEffect, useMemo, useState } from 'react';
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
  /**
   * Determines which octave(s) to render:
   * - 'treble' -> 1 Octave: Right Hand C4..C5 (8 wide keys)
   * - 'bass'   -> 1 Octave: Left Hand C3..C4 (8 wide keys)
   * - 'grand'  -> 2 Octaves: Both Hands C3..C5 (15 keys)
   */
  activeClef?: ClefType;
  disabled?: boolean;
}

const TREBLE_OCTAVE_NOTES: NoteId[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const BASS_OCTAVE_NOTES: NoteId[] = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];

/**
 * Adaptive 1-or-2 Octave Interactive Piano Keyboard.
 * - Shows 1 Octave (8 wide keys) in Treble Worlds (C4–C5) or Bass Worlds (C3–C4)
 * - Shows 2 Octaves (15 keys, C3–C5) when playing Grand Staff (Both Hands)
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

  const visibleNotes = useMemo(() => {
    if (activeClef === 'treble') return TREBLE_OCTAVE_NOTES;
    if (activeClef === 'bass') return BASS_OCTAVE_NOTES;
    return ALL_NOTE_IDS;
  }, [activeClef]);

  const isSingleOctave = activeClef === 'treble' || activeClef === 'bass';

  // Physical keyboard support for MacBook & Chromebook (keys C, D, E, F, G, A, B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || e.repeat) return;
      const key = e.key.toUpperCase();
      if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(key)) {
        if (highlightedNote && NOTES[highlightedNote].letter === key) {
          onSelectNote(highlightedNote);
          return;
        }
        const defaultOctave = activeClef === 'bass' ? 3 : 4;
        const candidate = `${key}${defaultOctave}` as NoteId;
        if (visibleNotes.includes(candidate)) {
          onSelectNote(candidate);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, highlightedNote, activeClef, visibleNotes, onSelectNote]);

  // Which white keys have a black key immediately to their right?
  const hasBlackKeyRight = (noteId: NoteId, isLastVisibleKey: boolean) => {
    if (isLastVisibleKey) return false;
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
    <div
      className={`w-full ${
        isSingleOctave ? 'max-w-2xl' : 'max-w-4xl'
      } mx-auto select-none`}
    >
      {/* Dynamic Octave & Landmark Orientation Bar */}
      <div className="flex justify-between items-center text-[11px] sm:text-xs font-black px-2 mb-1">
        {activeClef === 'treble' && (
          <>
            <span className="bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
              🦄 Middle C
            </span>
            <span className="bg-cyan-100 text-cyan-800 px-3 py-0.5 rounded-full">
              ✋ Right Hand • 𝄞 Treble Octave (8 Keys)
            </span>
            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              ⭐ High C
            </span>
          </>
        )}

        {activeClef === 'bass' && (
          <>
            <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
              💎 Low C
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full">
              🤚 Left Hand • 𝄢 Bass Octave (8 Keys)
            </span>
            <span className="bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
              🦄 Middle C
            </span>
          </>
        )}

        {activeClef === 'grand' && (
          <>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              🤚 Left Hand (𝄢 Low)
            </span>
            <span className="bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
              🦄 Middle C
            </span>
            <span className="bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full">
              ✋ Right Hand (𝄞 High)
            </span>
          </>
        )}
      </div>

      {/* Piano Frame */}
      <div className="relative bg-slate-900 p-2 sm:p-2.5 rounded-3xl shadow-xl border-4 border-purple-400">
        <div
          className={`relative flex w-full h-32 sm:h-40 ${
            isSingleOctave ? 'gap-1.5 sm:gap-2' : 'gap-1'
          }`}
        >
          {visibleNotes.map((noteId, idx) => {
            const note = NOTES[noteId];
            const isHighlighted = highlightedNote === noteId;
            const isPressed = pressedKey === noteId;
            const isMiddleC = noteId === 'C4';
            const isLastKey = idx === visibleNotes.length - 1;

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
                  {/* Visual Landmark Icons */}
                  {noteId === 'C3' && (
                    <span className="text-xs sm:text-sm mb-0.5" title="Low C">
                      💎
                    </span>
                  )}
                  {noteId === 'F3' && (
                    <span className="text-xs sm:text-sm font-black text-emerald-700 mb-0.5" title="Two Dots F">
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
                    className={`${
                      isSingleOctave ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-3 h-3 sm:w-3.5 sm:h-3.5'
                    } rounded-full mb-1 shadow-xs`}
                    style={{
                      backgroundColor: useColors || isHighlighted ? note.color : '#94a3b8',
                    }}
                  />

                  {/* Big Clean Note Label */}
                  <span
                    className={`font-black ${
                      isSingleOctave ? 'text-base sm:text-xl' : 'text-sm sm:text-base'
                    } text-slate-900 leading-none`}
                  >
                    {formatNoteLabel(note.letter, namingConvention)}
                  </span>
                </button>

                {/* Decorative Black Key */}
                {hasBlackKeyRight(noteId, isLastKey) && (
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
