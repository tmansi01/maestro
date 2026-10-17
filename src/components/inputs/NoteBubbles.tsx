import React from 'react';
import {
  LETTER_COLORS,
  NamingConvention,
  NOTE_LETTERS,
  NoteLetter,
  formatNoteLabel,
} from '../../data/notes';

interface NoteBubblesProps {
  onSelectLetter: (letter: NoteLetter) => void;
  useColors: boolean;
  namingConvention: NamingConvention;
  highlightedLetter?: NoteLetter | null;
  disabled?: boolean;
}

/**
 * Mode 2: Large, touch-friendly Rainbow Bubble buttons (`C D E F G A B` or `Do Re Mi Fa Sol La Si`).
 * Designed with >= 64px height so it is effortless to tap on both Chromebook and Fire Kids Tablet!
 */
export const NoteBubbles: React.FC<NoteBubblesProps> = ({
  onSelectLetter,
  useColors,
  namingConvention,
  highlightedLetter,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {NOTE_LETTERS.map((letter) => {
          const colors = LETTER_COLORS[letter];
          const isHighlighted = highlightedLetter === letter;

          return (
            <button
              key={letter}
              type="button"
              disabled={disabled}
              onClick={() => onSelectLetter(letter)}
              style={{
                backgroundColor: isHighlighted
                  ? '#fef08a'
                  : useColors
                  ? colors.main
                  : '#ffffff',
                borderColor: isHighlighted
                  ? '#eab308'
                  : useColors
                  ? colors.main
                  : '#7c3aed',
                color: isHighlighted
                  ? '#1e1b4b'
                  : useColors
                  ? '#ffffff'
                  : '#1e1b4b',
              }}
              className={`min-h-16 sm:min-h-20 rounded-2xl border-b-6 px-2 py-3 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isHighlighted ? 'animate-bounce ring-4 ring-yellow-400' : 'hover:-translate-y-0.5'
              }`}
            >
              <span className="text-lg sm:text-2xl font-black tracking-tight drop-shadow-xs">
                {formatNoteLabel(letter, namingConvention)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
