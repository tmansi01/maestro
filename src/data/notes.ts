export type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type SolfegeName = 'Do' | 'Re' | 'Mi' | 'Fa' | 'Sol' | 'La' | 'Si';
export type NoteId =
  | 'C3' | 'D3' | 'E3' | 'F3' | 'G3' | 'A3' | 'B3'
  | 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A4' | 'B4'
  | 'C5';

export type ClefType = 'treble' | 'bass' | 'grand';
export type NamingConvention = 'letters' | 'solfege' | 'both';
export type ColorMode = 'progressive' | 'always' | 'off';

export interface NoteDefinition {
  id: NoteId;
  letter: NoteLetter;
  solfege: SolfegeName;
  octave: 3 | 4 | 5;
  midi: number;
  frequency: number;
  primaryClef: 'treble' | 'bass';
  /**
   * Staff step index relative to Middle C (C4 = 0).
   * Each diatonic step (line-to-space or space-to-line) is +1 or -1:
   * C3=-7, D3=-6, E3=-5, F3=-4, G3=-3, A3=-2, B3=-1,
   * C4=0, D4=+1, E4=+2, F4=+3, G4=+4, A4=+5, B4=+6, C5=+7
   */
  diatonicStepFromC4: number;
  /**
   * Standard Boomwhacker / Prodigies rainbow color hex
   */
  color: string;
  lightColor: string;
  isLandmark: boolean;
  landmarkHint: {
    nearestLandmark: NoteId;
    stepsDelta: number; // e.g., +1 means 1 step UP from nearestLandmark
    explanation: string;
  };
}

export const LETTER_TO_SOLFEGE: Record<NoteLetter, SolfegeName> = {
  C: 'Do',
  D: 'Re',
  E: 'Mi',
  F: 'Fa',
  G: 'Sol',
  A: 'La',
  B: 'Si',
};

export const LETTER_COLORS: Record<NoteLetter, { main: string; light: string }> = {
  C: { main: '#ef4444', light: '#fee2e2' }, // Red
  D: { main: '#f97316', light: '#ffedd5' }, // Orange
  E: { main: '#eab308', light: '#fef9c3' }, // Sunny Yellow/Gold
  F: { main: '#22c55e', light: '#dcfce7' }, // Green
  G: { main: '#06b6d4', light: '#cffafe' }, // Teal / Cyan-Blue
  A: { main: '#6366f1', light: '#e0e7ff' }, // Indigo
  B: { main: '#d946ef', light: '#fae8ff' }, // Purple / Magenta
};

export const NOTES: Record<NoteId, NoteDefinition> = {
  C3: {
    id: 'C3',
    letter: 'C',
    solfege: 'Do',
    octave: 3,
    midi: 48,
    frequency: 130.81,
    primaryClef: 'bass',
    diatonicStepFromC4: -7,
    color: LETTER_COLORS.C.main,
    lightColor: LETTER_COLORS.C.light,
    isLandmark: true,
    landmarkHint: {
      nearestLandmark: 'F3',
      stepsDelta: -3,
      explanation: 'Bass C sits nicely in the 2nd space from the bottom—3 steps down from Landmark F!',
    },
  },
  D3: {
    id: 'D3',
    letter: 'D',
    solfege: 'Re',
    octave: 3,
    midi: 50,
    frequency: 146.83,
    primaryClef: 'bass',
    diatonicStepFromC4: -6,
    color: LETTER_COLORS.D.main,
    lightColor: LETTER_COLORS.D.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'F3',
      stepsDelta: -2,
      explanation: 'D is on the middle line of the Bass staff—2 steps (a skip) down from the F dots line!',
    },
  },
  E3: {
    id: 'E3',
    letter: 'E',
    solfege: 'Mi',
    octave: 3,
    midi: 52,
    frequency: 164.81,
    primaryClef: 'bass',
    diatonicStepFromC4: -5,
    color: LETTER_COLORS.E.main,
    lightColor: LETTER_COLORS.E.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'F3',
      stepsDelta: -1,
      explanation: 'E is in the space right below the F line—just 1 step down from Landmark F!',
    },
  },
  F3: {
    id: 'F3',
    letter: 'F',
    solfege: 'Fa',
    octave: 3,
    midi: 53,
    frequency: 174.61,
    primaryClef: 'bass',
    diatonicStepFromC4: -4,
    color: LETTER_COLORS.F.main,
    lightColor: LETTER_COLORS.F.light,
    isLandmark: true,
    landmarkHint: {
      nearestLandmark: 'F3',
      stepsDelta: 0,
      explanation: 'Landmark Bass F! The two magic dots of the Bass Clef hug this exact line!',
    },
  },
  G3: {
    id: 'G3',
    letter: 'G',
    solfege: 'Sol',
    octave: 3,
    midi: 55,
    frequency: 196.00,
    primaryClef: 'bass',
    diatonicStepFromC4: -3,
    color: LETTER_COLORS.G.main,
    lightColor: LETTER_COLORS.G.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'F3',
      stepsDelta: 1,
      explanation: 'G sits in the top space right above the F line—just 1 step UP from Landmark F!',
    },
  },
  A3: {
    id: 'A3',
    letter: 'A',
    solfege: 'La',
    octave: 3,
    midi: 57,
    frequency: 220.00,
    primaryClef: 'bass',
    diatonicStepFromC4: -2,
    color: LETTER_COLORS.A.main,
    lightColor: LETTER_COLORS.A.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'F3',
      stepsDelta: 2,
      explanation: 'A sits on the very top line of the Bass staff—2 steps UP from Landmark F!',
    },
  },
  B3: {
    id: 'B3',
    letter: 'B',
    solfege: 'Si',
    octave: 3,
    midi: 59,
    frequency: 246.94,
    primaryClef: 'bass',
    diatonicStepFromC4: -1,
    color: LETTER_COLORS.B.main,
    lightColor: LETTER_COLORS.B.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'C4',
      stepsDelta: -1,
      explanation: 'B sits right on top of the Bass staff—just 1 step DOWN from Middle C!',
    },
  },
  C4: {
    id: 'C4',
    letter: 'C',
    solfege: 'Do',
    octave: 4,
    midi: 60,
    frequency: 261.63,
    primaryClef: 'treble',
    diatonicStepFromC4: 0,
    color: LETTER_COLORS.C.main,
    lightColor: LETTER_COLORS.C.light,
    isLandmark: true,
    landmarkHint: {
      nearestLandmark: 'C4',
      stepsDelta: 0,
      explanation: 'Landmark Middle C! Look for its special little whisker line (ledger line) in the middle!',
    },
  },
  D4: {
    id: 'D4',
    letter: 'D',
    solfege: 'Re',
    octave: 4,
    midi: 62,
    frequency: 293.66,
    primaryClef: 'treble',
    diatonicStepFromC4: 1,
    color: LETTER_COLORS.D.main,
    lightColor: LETTER_COLORS.D.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'C4',
      stepsDelta: 1,
      explanation: 'D hangs right under the bottom line of the Treble staff—1 step UP from Middle C!',
    },
  },
  E4: {
    id: 'E4',
    letter: 'E',
    solfege: 'Mi',
    octave: 4,
    midi: 64,
    frequency: 329.63,
    primaryClef: 'treble',
    diatonicStepFromC4: 2,
    color: LETTER_COLORS.E.main,
    lightColor: LETTER_COLORS.E.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'G4',
      stepsDelta: -2,
      explanation: 'E is on the very bottom line of the Treble staff—2 steps down from Landmark G!',
    },
  },
  F4: {
    id: 'F4',
    letter: 'F',
    solfege: 'Fa',
    octave: 4,
    midi: 65,
    frequency: 349.23,
    primaryClef: 'treble',
    diatonicStepFromC4: 3,
    color: LETTER_COLORS.F.main,
    lightColor: LETTER_COLORS.F.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'G4',
      stepsDelta: -1,
      explanation: 'F sits in the 1st space at the bottom—1 step DOWN from the Treble G swirl line!',
    },
  },
  G4: {
    id: 'G4',
    letter: 'G',
    solfege: 'Sol',
    octave: 4,
    midi: 67,
    frequency: 392.00,
    primaryClef: 'treble',
    diatonicStepFromC4: 4,
    color: LETTER_COLORS.G.main,
    lightColor: LETTER_COLORS.G.light,
    isLandmark: true,
    landmarkHint: {
      nearestLandmark: 'G4',
      stepsDelta: 0,
      explanation: 'Landmark Treble G! The curly swirl of the Treble Clef wraps right around this 2nd line!',
    },
  },
  A4: {
    id: 'A4',
    letter: 'A',
    solfege: 'La',
    octave: 4,
    midi: 69,
    frequency: 440.00,
    primaryClef: 'treble',
    diatonicStepFromC4: 5,
    color: LETTER_COLORS.A.main,
    lightColor: LETTER_COLORS.A.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'G4',
      stepsDelta: 1,
      explanation: 'A sits in the 2nd space right above the G line—1 step UP from Landmark G!',
    },
  },
  B4: {
    id: 'B4',
    letter: 'B',
    solfege: 'Si',
    octave: 4,
    midi: 71,
    frequency: 493.88,
    primaryClef: 'treble',
    diatonicStepFromC4: 6,
    color: LETTER_COLORS.B.main,
    lightColor: LETTER_COLORS.B.light,
    isLandmark: false,
    landmarkHint: {
      nearestLandmark: 'G4',
      stepsDelta: 2,
      explanation: 'B is on the middle line of the Treble staff—2 steps UP from Landmark G!',
    },
  },
  C5: {
    id: 'C5',
    letter: 'C',
    solfege: 'Do',
    octave: 5,
    midi: 72,
    frequency: 523.25,
    primaryClef: 'treble',
    diatonicStepFromC4: 7,
    color: LETTER_COLORS.C.main,
    lightColor: LETTER_COLORS.C.light,
    isLandmark: true,
    landmarkHint: {
      nearestLandmark: 'G4',
      stepsDelta: 3,
      explanation: 'High Treble C! It shines in the 3rd space up—3 steps UP from Landmark G!',
    },
  },
};

export const ALL_NOTE_IDS: NoteId[] = [
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
  'C5',
];

export const NOTE_LETTERS: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * Formats a note label according to the user's selected convention (Letters, Solfège, or Both).
 */
export function formatNoteLabel(letter: NoteLetter, convention: NamingConvention): string {
  const solfege = LETTER_TO_SOLFEGE[letter];
  if (convention === 'solfege') return solfege;
  if (convention === 'both') return `${letter} (${solfege})`;
  return letter;
}

/**
 * Formats a full NoteId (with octave subtle hint if needed) or its friendly name.
 */
export function formatNoteDisplayName(noteId: NoteId, convention: NamingConvention): string {
  const note = NOTES[noteId];
  const base = formatNoteLabel(note.letter, convention);
  if (noteId === 'C4') return `Middle ${base}`;
  if (noteId === 'C5') return `High ${base}`;
  if (noteId === 'C3') return `Bass ${base}`;
  return base;
}

/**
 * Finds the closest NoteId in `C3..C5` for a detected microphone frequency in Hz.
 * Returns null if the frequency is outside a reasonable tolerance (~45 cents) or out of range.
 */
export function frequencyToClosestNote(freqHz: number): { note: NoteDefinition; centsOff: number } | null {
  if (freqHz < 115 || freqHz > 580) return null;

  let bestNote: NoteDefinition | null = null;
  let minAbsCents = Infinity;
  let signedCents = 0;

  for (const id of ALL_NOTE_IDS) {
    const note = NOTES[id];
    const cents = 1200 * Math.log2(freqHz / note.frequency);
    const absCents = Math.abs(cents);
    if (absCents < minAbsCents) {
      minAbsCents = absCents;
      signedCents = cents;
      bestNote = note;
    }
  }

  // Accept within 55 cents (half a semitone is 50 cents)
  if (bestNote && minAbsCents <= 55) {
    return { note: bestNote, centsOff: Math.round(signedCents) };
  }
  return null;
}
