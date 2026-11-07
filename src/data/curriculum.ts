import { ClefType, NoteId } from './notes';

export interface LessonSlide {
  title: string;
  speechText: string;
  highlightNotes: NoteId[];
  clef: 'treble' | 'bass' | 'grand';
  showLandmarkBadge?: boolean;
  /**
   * When true, hides notehead labels and does NOT pre-highlight the piano key in yellow
   * (unless she makes a mistake), testing genuine staff reading at the end of the lesson!
   */
  isQuizSlide?: boolean;
  tryItNote?: NoteId;
  tryItPrompt?: string;
}

export interface MelodyNote {
  noteId: NoteId;
  lyric: string;
  beats: number;
}

export interface WorldDefinition {
  id: number;
  chapter: 1 | 2 | 3;
  title: string;
  subtitle: string;
  landmarkBadge: string;
  emoji: string;
  themeGradient: string;
  badgeColor: string;
  clef: ClefType;
  newNotes: NoteId[];
  notePool: NoteId[];
  roundLength: number;
  description: string;
  lessonSlides: LessonSlide[];
  bossMelody: {
    title: string;
    composerOrTrad: string;
    introSpeech: string;
    notes: MelodyNote[];
  };
}

export const WORLDS: WorldDefinition[] = [
  // ============================================================================
  // CHAPTER 1: RIGHT HAND • TREBLE CLEF (𝄞) • 1-OCTAVE KEYBOARD (C4–C5)
  // ============================================================================
  {
    id: 1,
    chapter: 1,
    title: 'Magic Whisker',
    subtitle: 'Middle C, D & E',
    landmarkBadge: '🦄 Landmark C',
    emoji: '🦄',
    themeGradient: 'from-pink-500 via-purple-500 to-indigo-500',
    badgeColor: '#ec4899',
    clef: 'treble',
    newNotes: ['C4', 'D4', 'E4'],
    notePool: ['C4', 'D4', 'E4'],
    roundLength: 8,
    description: 'Start at 🦄 Middle C and step UP to D and bottom-line E!',
    lessonSlides: [
      {
        title: 'Landmark 1: 🦄 Middle C!',
        speechText:
          'Look under the staff! Middle C has its own little whisker line right through its tummy.',
        highlightNotes: ['C4'],
        clef: 'treble',
        showLandmarkBadge: true,
        tryItNote: 'C4',
        tryItPrompt: 'Tap glowing 🦄 Middle C on the left of your keyboard!',
      },
      {
        title: 'Step Up 1 to D!',
        speechText:
          'When we climb UP 1 step from Middle C, we reach D! D hangs right under the bottom line.',
        highlightNotes: ['C4', 'D4'],
        clef: 'treble',
        tryItNote: 'D4',
        tryItPrompt: 'Step UP 1 key from C and tap D!',
      },
      {
        title: 'Step Up 2 to Bottom-Line E!',
        speechText:
          'Climb UP 1 more step onto the very bottom line (Line 1) to find E! Now you know C - D - E!',
        highlightNotes: ['C4', 'D4', 'E4'],
        clef: 'treble',
        tryItNote: 'E4',
        tryItPrompt: 'Tap E on the bottom line!',
      },
      {
        title: '🌟 Quick Check: Find E!',
        speechText:
          'Your turn without labels! Start at 🦄 Middle C and count UP 2 steps to Line 1. Which key is it?',
        highlightNotes: ['E4'],
        clef: 'treble',
        isQuizSlide: true,
        tryItNote: 'E4',
        tryItPrompt: 'Find and tap E on the piano!',
      },
    ],
    bossMelody: {
      title: 'Hot Cross Buns',
      composerOrTrad: 'Traditional',
      introSpeech: 'Let’s play Hot Cross Buns using E, D, and Middle C!',
      notes: [
        { noteId: 'E4', lyric: 'Hot', beats: 1 },
        { noteId: 'D4', lyric: 'Cross', beats: 1 },
        { noteId: 'C4', lyric: 'Buns!', beats: 2 },
        { noteId: 'E4', lyric: 'Hot', beats: 1 },
        { noteId: 'D4', lyric: 'Cross', beats: 1 },
        { noteId: 'C4', lyric: 'Buns!', beats: 2 },
        { noteId: 'C4', lyric: 'One', beats: 1 },
        { noteId: 'C4', lyric: 'a', beats: 1 },
        { noteId: 'D4', lyric: 'pen-', beats: 1 },
        { noteId: 'D4', lyric: 'ny,', beats: 1 },
        { noteId: 'E4', lyric: 'Hot', beats: 1 },
        { noteId: 'D4', lyric: 'Cross', beats: 1 },
        { noteId: 'C4', lyric: 'Buns!', beats: 2 },
      ],
    },
  },
  {
    id: 2,
    chapter: 1,
    title: 'Treble Swirl',
    subtitle: 'Landmark G & Space F',
    landmarkBadge: '🌀 Landmark G',
    emoji: '🌀',
    themeGradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    badgeColor: '#06b6d4',
    clef: 'treble',
    newNotes: ['G4', 'F4'],
    notePool: ['C4', 'D4', 'E4', 'F4', 'G4'],
    roundLength: 10,
    description: 'Use the curly 🌀 G swirl on Line 2 and connect C - D - E - F - G!',
    lessonSlides: [
      {
        title: 'Landmark 2: The Curly 🌀 G Line!',
        speechText:
          'Look at the curly Treble Clef! Its swirl wraps around Line 2 from the bottom. That line is ALWAYS G!',
        highlightNotes: ['G4'],
        clef: 'treble',
        showLandmarkBadge: true,
        tryItNote: 'G4',
        tryItPrompt: 'Tap glowing 🌀 Landmark G!',
      },
      {
        title: 'Step Down 1 to Bottom-Space F!',
        speechText:
          'Step DOWN 1 spot from the G line into the 1st space at the bottom. That space note is F!',
        highlightNotes: ['G4', 'F4'],
        clef: 'treble',
        tryItNote: 'F4',
        tryItPrompt: 'Step DOWN 1 from G and tap F!',
      },
      {
        title: 'Five Notes in a Row: C D E F G!',
        speechText:
          'Now all 5 notes connect from 🦄 Middle C up to 🌀 Landmark G: C, D, E, F, G!',
        highlightNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
        clef: 'treble',
        tryItNote: 'G4',
        tryItPrompt: 'Tap 🌀 G to test your 5 notes!',
      },
      {
        title: '🌟 Quick Check: 1 Step Below G!',
        speechText:
          'Look at this note in the 1st space, right below the 🌀 G swirl line. Which note is 1 step down from G?',
        highlightNotes: ['F4'],
        clef: 'treble',
        isQuizSlide: true,
        tryItNote: 'F4',
        tryItPrompt: 'Find and tap the note 1 step below G!',
      },
    ],
    bossMelody: {
      title: 'Mary Had a Little Lamb',
      composerOrTrad: 'Traditional',
      introSpeech: 'Let’s play Mary Had a Little Lamb!',
      notes: [
        { noteId: 'E4', lyric: 'Ma-', beats: 1 },
        { noteId: 'D4', lyric: 'ry', beats: 1 },
        { noteId: 'C4', lyric: 'had', beats: 1 },
        { noteId: 'D4', lyric: 'a', beats: 1 },
        { noteId: 'E4', lyric: 'lit-', beats: 1 },
        { noteId: 'E4', lyric: 'tle', beats: 1 },
        { noteId: 'E4', lyric: 'lamb,', beats: 2 },
        { noteId: 'D4', lyric: 'lit-', beats: 1 },
        { noteId: 'D4', lyric: 'tle', beats: 1 },
        { noteId: 'D4', lyric: 'lamb,', beats: 2 },
        { noteId: 'E4', lyric: 'lit-', beats: 1 },
        { noteId: 'G4', lyric: 'tle', beats: 1 },
        { noteId: 'G4', lyric: 'lamb!', beats: 2 },
      ],
    },
  },
  {
    id: 3,
    chapter: 1,
    title: 'Rainbow Climb',
    subtitle: 'A, B & Landmark High C',
    landmarkBadge: '⭐ Landmark High C',
    emoji: '🌈',
    themeGradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    badgeColor: '#a855f7',
    clef: 'treble',
    newNotes: ['A4', 'B4', 'C5'],
    notePool: ['C4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    roundLength: 10,
    description: 'Climb UP from 🌀 G to A, middle-line B, and ⭐ High C!',
    lessonSlides: [
      {
        title: 'Step Up Above 🌀 G to A!',
        speechText:
          'Start on the 🌀 G line (Line 2). When we step UP 1 spot into Space 2, the musical alphabet starts over at A!',
        highlightNotes: ['G4', 'A4'],
        clef: 'treble',
        tryItNote: 'A4',
        tryItPrompt: 'Step UP 1 from G and tap A!',
      },
      {
        title: 'Middle Line B!',
        speechText:
          'Climb UP 1 more step onto the middle line (Line 3) of the staff to find B!',
        highlightNotes: ['G4', 'A4', 'B4'],
        clef: 'treble',
        tryItNote: 'B4',
        tryItPrompt: 'Tap B on the middle line!',
      },
      {
        title: 'Landmark 3: ⭐ High C!',
        speechText:
          'Right above B in Space 3 shines ⭐ High C! It is at the top of your Right-Hand keyboard!',
        highlightNotes: ['G4', 'A4', 'B4', 'C5'],
        clef: 'treble',
        showLandmarkBadge: true,
        tryItNote: 'C5',
        tryItPrompt: 'Tap glowing ⭐ High C on the far right!',
      },
      {
        title: '🌟 Quick Check: Space Above G!',
        speechText:
          'Look at this note sitting in Space 2, just 1 step UP from the 🌀 G line. Which note is it?',
        highlightNotes: ['A4'],
        clef: 'treble',
        isQuizSlide: true,
        tryItNote: 'A4',
        tryItPrompt: 'Find and tap the note 1 step above G!',
      },
    ],
    bossMelody: {
      title: 'Twinkle, Twinkle',
      composerOrTrad: 'Traditional',
      introSpeech: 'Let’s play Twinkle, Twinkle, Little Star!',
      notes: [
        { noteId: 'C4', lyric: 'Twin-', beats: 1 },
        { noteId: 'C4', lyric: 'kle', beats: 1 },
        { noteId: 'G4', lyric: 'twin-', beats: 1 },
        { noteId: 'G4', lyric: 'kle', beats: 1 },
        { noteId: 'A4', lyric: 'lit-', beats: 1 },
        { noteId: 'A4', lyric: 'tle', beats: 1 },
        { noteId: 'G4', lyric: 'star,', beats: 2 },
        { noteId: 'F4', lyric: 'How', beats: 1 },
        { noteId: 'F4', lyric: 'I', beats: 1 },
        { noteId: 'E4', lyric: 'won-', beats: 1 },
        { noteId: 'E4', lyric: 'der', beats: 1 },
        { noteId: 'D4', lyric: 'what', beats: 1 },
        { noteId: 'D4', lyric: 'you', beats: 1 },
        { noteId: 'C4', lyric: 'are!', beats: 2 },
      ],
    },
  },
  {
    id: 4,
    chapter: 1,
    title: 'Right Hand Champ',
    subtitle: 'All 8 Treble Notes (C to High C)',
    landmarkBadge: '👑 F-A-C-E & All 8 Notes',
    emoji: '👑',
    themeGradient: 'from-amber-400 via-orange-500 to-rose-500',
    badgeColor: '#f59e0b',
    clef: 'treble',
    newNotes: [],
    notePool: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    roundLength: 12,
    description: 'Master all 8 Right-Hand notes using Landmarks and F-A-C-E spaces!',
    lessonSlides: [
      {
        title: 'Space Trick: F - A - C - E!',
        speechText:
          'Look at the spaces from bottom to top: Space 1 is F, Space 2 is A, Space 3 is ⭐ High C! They spell F - A - C - E!',
        highlightNotes: ['F4', 'A4', 'C5'],
        clef: 'treble',
        tryItNote: 'C5',
        tryItPrompt: 'Tap ⭐ High C in Space 3!',
      },
      {
        title: 'Line Skips: E - 🌀 G - B!',
        speechText:
          'And the first 3 lines skip up like stepping stones: Line 1 is E, Line 2 is 🌀 G, and Line 3 is B!',
        highlightNotes: ['E4', 'G4', 'B4'],
        clef: 'treble',
        tryItNote: 'B4',
        tryItPrompt: 'Tap B on Line 3!',
      },
      {
        title: '🌟 Championship Check!',
        speechText:
          'Can you spot this note on the middle line (Line 3), 2 steps UP from 🌀 G?',
        highlightNotes: ['B4'],
        clef: 'treble',
        isQuizSlide: true,
        tryItNote: 'B4',
        tryItPrompt: 'Find and tap the middle-line note!',
      },
    ],
    bossMelody: {
      title: 'Ode to Joy',
      composerOrTrad: 'Beethoven',
      introSpeech: 'Let’s play Beethoven’s Ode to Joy to win the Right-Hand Trophy!',
      notes: [
        { noteId: 'E4', lyric: 'Joy-', beats: 1 },
        { noteId: 'E4', lyric: 'ful,', beats: 1 },
        { noteId: 'F4', lyric: 'joy-', beats: 1 },
        { noteId: 'G4', lyric: 'ful,', beats: 1 },
        { noteId: 'G4', lyric: 'we', beats: 1 },
        { noteId: 'F4', lyric: 'a-', beats: 1 },
        { noteId: 'E4', lyric: 'dore', beats: 1 },
        { noteId: 'D4', lyric: 'thee,', beats: 1 },
        { noteId: 'C4', lyric: 'heav-', beats: 1 },
        { noteId: 'C4', lyric: 'en', beats: 1 },
        { noteId: 'D4', lyric: 'and', beats: 1 },
        { noteId: 'E4', lyric: 'earth', beats: 1 },
        { noteId: 'D4', lyric: 'shine', beats: 1 },
        { noteId: 'C4', lyric: 'bright!', beats: 2 },
      ],
    },
  },

  // ============================================================================
  // CHAPTER 2: LEFT HAND • BASS CLEF (𝄢) • 1-OCTAVE KEYBOARD (C3–C4)
  // ============================================================================
  {
    id: 5,
    chapter: 2,
    title: 'Two Magic Dots',
    subtitle: 'Bass Landmark F up to Middle C',
    landmarkBadge: '•• Landmark Bass F',
    emoji: '🪄',
    themeGradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    badgeColor: '#10b981',
    clef: 'bass',
    newNotes: ['F3', 'G3', 'A3', 'B3'],
    notePool: ['F3', 'G3', 'A3', 'B3', 'C4'],
    roundLength: 10,
    description: 'Switch to your Left Hand! Follow the two dots •• on Line 4 to F, G, A, B, and 🦄 C!',
    lessonSlides: [
      {
        title: 'Landmark 4: Two Dots •• = F!',
        speechText:
          'Welcome to the Bass Clef for your Left Hand! See the two magic dots ••? They hug Line 4—and that line is ALWAYS F!',
        highlightNotes: ['F3'],
        clef: 'bass',
        showLandmarkBadge: true,
        tryItNote: 'F3',
        tryItPrompt: 'Tap glowing •• F!',
      },
      {
        title: 'Stepping Up to G and Top-Line A!',
        speechText:
          'Step UP 1 from •• F into the top space for G, and step UP onto the very top line (Line 5) for A!',
        highlightNotes: ['F3', 'G3', 'A3'],
        clef: 'bass',
        tryItNote: 'A3',
        tryItPrompt: 'Tap A on the top line!',
      },
      {
        title: 'Up to B and 🦄 Middle C!',
        speechText:
          'Sitting right on top of the Bass staff is B, and 1 step above that is our old friend 🦄 Middle C!',
        highlightNotes: ['F3', 'G3', 'A3', 'B3', 'C4'],
        clef: 'bass',
        tryItNote: 'B3',
        tryItPrompt: 'Tap B right next to 🦄 Middle C!',
      },
      {
        title: '🌟 Quick Check: Between the Dots ••!',
        speechText:
          'Look at the line right between the two magic dots •• of the Bass Clef. Which Landmark note is this?',
        highlightNotes: ['F3'],
        clef: 'bass',
        isQuizSlide: true,
        tryItNote: 'F3',
        tryItPrompt: 'Find and tap the •• Landmark note!',
      },
    ],
    bossMelody: {
      title: 'Row Your Boat',
      composerOrTrad: 'Traditional',
      introSpeech: 'Let’s play Row, Row, Row Your Boat with your Left Hand!',
      notes: [
        { noteId: 'F3', lyric: 'Row,', beats: 1 },
        { noteId: 'F3', lyric: 'row,', beats: 1 },
        { noteId: 'F3', lyric: 'row', beats: 1 },
        { noteId: 'G3', lyric: 'your', beats: 1 },
        { noteId: 'A3', lyric: 'boat,', beats: 2 },
        { noteId: 'A3', lyric: 'gent-', beats: 1 },
        { noteId: 'G3', lyric: 'ly', beats: 1 },
        { noteId: 'A3', lyric: 'down', beats: 1 },
        { noteId: 'B3', lyric: 'the', beats: 1 },
        { noteId: 'C4', lyric: 'stream!', beats: 2 },
      ],
    },
  },
  {
    id: 6,
    chapter: 2,
    title: 'Crystal Cave',
    subtitle: 'Low E, D & Landmark Low C',
    landmarkBadge: '💎 Landmark Low C',
    emoji: '💎',
    themeGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    badgeColor: '#4f46e5',
    clef: 'bass',
    newNotes: ['E3', 'D3', 'C3'],
    notePool: ['C3', 'D3', 'E3', 'F3', 'G3', 'C4'],
    roundLength: 10,
    description: 'Step DOWN from •• F to E, middle-line D, and 💎 Low C!',
    lessonSlides: [
      {
        title: 'Step Down 1 from •• F to E!',
        speechText:
          'Start on the •• F line. When we step DOWN 1 spot into Space 3, we land on E!',
        highlightNotes: ['F3', 'E3'],
        clef: 'bass',
        tryItNote: 'E3',
        tryItPrompt: 'Step DOWN 1 from F and tap E!',
      },
      {
        title: 'Middle Line Bass D!',
        speechText:
          'Step DOWN 1 more spot onto the middle line (Line 3) of the Bass staff to find D!',
        highlightNotes: ['F3', 'E3', 'D3'],
        clef: 'bass',
        tryItNote: 'D3',
        tryItPrompt: 'Tap D on the middle line!',
      },
      {
        title: 'Landmark 5: 💎 Low C!',
        speechText:
          'In Space 2 from the bottom sits Landmark 💎 Low C—the lowest key on your Left-Hand keyboard!',
        highlightNotes: ['C3', 'D3', 'E3', 'F3'],
        clef: 'bass',
        showLandmarkBadge: true,
        tryItNote: 'C3',
        tryItPrompt: 'Tap glowing 💎 Low C on the far left!',
      },
      {
        title: '🌟 Quick Check: 1 Step Below •• F!',
        speechText:
          'Look at this note in the space right below the •• F line. Which note is 1 step down from F?',
        highlightNotes: ['E3'],
        clef: 'bass',
        isQuizSlide: true,
        tryItNote: 'E3',
        tryItPrompt: 'Find and tap the note 1 step below F!',
      },
    ],
    bossMelody: {
      title: 'Old MacDonald',
      composerOrTrad: 'Traditional',
      introSpeech: 'Let’s play Old MacDonald in the Bass Clef!',
      notes: [
        { noteId: 'F3', lyric: 'Old', beats: 1 },
        { noteId: 'F3', lyric: 'Mac-', beats: 1 },
        { noteId: 'F3', lyric: 'Don-', beats: 1 },
        { noteId: 'C3', lyric: 'ald', beats: 1 },
        { noteId: 'D3', lyric: 'had', beats: 1 },
        { noteId: 'D3', lyric: 'a', beats: 1 },
        { noteId: 'C3', lyric: 'farm,', beats: 2 },
        { noteId: 'A3', lyric: 'E-', beats: 1 },
        { noteId: 'A3', lyric: 'I-', beats: 1 },
        { noteId: 'G3', lyric: 'E-', beats: 1 },
        { noteId: 'G3', lyric: 'I-', beats: 1 },
        { noteId: 'F3', lyric: 'O!', beats: 2 },
      ],
    },
  },
  {
    id: 7,
    chapter: 2,
    title: 'Left Hand Hero',
    subtitle: 'All 8 Bass Notes (Low C to Middle C)',
    landmarkBadge: '🚀 All 8 Bass Notes',
    emoji: '🚀',
    themeGradient: 'from-teal-500 via-emerald-500 to-lime-500',
    badgeColor: '#14b8a6',
    clef: 'bass',
    newNotes: [],
    notePool: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
    roundLength: 12,
    description: 'Master all 8 Left-Hand notes from 💎 Low C to 🦄 Middle C!',
    lessonSlides: [
      {
        title: 'Space Chord Skips: C - E - G!',
        speechText:
          'Look at Spaces 2, 3, and 4 in the Bass staff: 💎 Low C, E, and G skip up through the spaces!',
        highlightNotes: ['C3', 'E3', 'G3'],
        clef: 'bass',
        tryItNote: 'G3',
        tryItPrompt: 'Tap G in the top space!',
      },
      {
        title: 'Three Left-Hand Landmarks!',
        speechText:
          'Use your 3 Bass helpers: 💎 Low C in Space 2, •• F on Line 4, and 🦄 Middle C at the top!',
        highlightNotes: ['C3', 'F3', 'C4'],
        clef: 'bass',
        showLandmarkBadge: true,
        tryItNote: 'C3',
        tryItPrompt: 'Tap 💎 Low C!',
      },
      {
        title: '🌟 Bass Hero Check!',
        speechText:
          'Can you spot this note sitting on the very top line (Line 5), 2 steps UP from •• F?',
        highlightNotes: ['A3'],
        clef: 'bass',
        isQuizSlide: true,
        tryItNote: 'A3',
        tryItPrompt: 'Find and tap the top-line Bass note!',
      },
    ],
    bossMelody: {
      title: 'London Bridge',
      composerOrTrad: 'Traditional',
      introSpeech: 'Let’s play London Bridge to earn your Left-Hand Hero Trophy!',
      notes: [
        { noteId: 'G3', lyric: 'Lon-', beats: 1 },
        { noteId: 'A3', lyric: 'don', beats: 1 },
        { noteId: 'G3', lyric: 'Bridge', beats: 1 },
        { noteId: 'F3', lyric: 'is', beats: 1 },
        { noteId: 'E3', lyric: 'fall-', beats: 1 },
        { noteId: 'F3', lyric: 'ing', beats: 1 },
        { noteId: 'G3', lyric: 'down,', beats: 2 },
        { noteId: 'D3', lyric: 'fall-', beats: 1 },
        { noteId: 'E3', lyric: 'ing', beats: 1 },
        { noteId: 'F3', lyric: 'down,', beats: 2 },
        { noteId: 'E3', lyric: 'fall-', beats: 1 },
        { noteId: 'F3', lyric: 'ing', beats: 1 },
        { noteId: 'G3', lyric: 'down!', beats: 2 },
      ],
    },
  },

  // ============================================================================
  // CHAPTER 3: BOTH HANDS • GRAND STAFF (𝄞 + 𝄢) • 2-OCTAVE KEYBOARD (C3–C5)
  // ============================================================================
  {
    id: 8,
    chapter: 3,
    title: 'Grand Concert',
    subtitle: 'Both Hands Together (All 15 Notes!)',
    landmarkBadge: '🌟 All 5 Landmarks (2 Octaves)',
    emoji: '🌟',
    themeGradient: 'from-fuchsia-600 via-purple-600 to-indigo-600',
    badgeColor: '#d946ef',
    clef: 'grand',
    newNotes: [],
    notePool: [
      'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5',
    ],
    roundLength: 15,
    description: 'Combine Treble & Bass Clefs across all 15 keys like a Piano Maestro!',
    lessonSlides: [
      {
        title: 'The Grand Staff (Both Hands!)',
        speechText:
          'Now both octaves unite! Right-Hand Treble (`𝄞`) on top, Left-Hand Bass (`𝄢`) on bottom, and 🦄 Middle C right in the center!',
        highlightNotes: ['C3', 'F3', 'C4', 'G4', 'C5'],
        clef: 'grand',
        showLandmarkBadge: true,
        tryItNote: 'C4',
        tryItPrompt: 'Tap 🦄 Middle C in the center of the 2-octave keyboard!',
      },
      {
        title: 'All 5 Magic Landmarks!',
        speechText:
          'You know all 5 Landmarks: 💎 Low C, •• Bass F, 🦄 Middle C, 🌀 Treble G, and ⭐ High C!',
        highlightNotes: ['C3', 'F3', 'C4', 'G4', 'C5'],
        clef: 'grand',
        showLandmarkBadge: true,
        tryItNote: 'G4',
        tryItPrompt: 'Tap 🌀 Treble G!',
      },
      {
        title: '🌟 Grand Maestro Check!',
        speechText:
          'Look closely: which clef is this note in, and which Landmark is it?',
        highlightNotes: ['F3'],
        clef: 'grand',
        isQuizSlide: true,
        tryItNote: 'F3',
        tryItPrompt: 'Find and tap •• Bass F on the Left-Hand side!',
      },
    ],
    bossMelody: {
      title: 'Unicorn Symphony',
      composerOrTrad: 'Grand Finale',
      introSpeech: 'Time for the Grand Unicorn Symphony across both hands!',
      notes: [
        { noteId: 'C3', lyric: 'Deep', beats: 1 },
        { noteId: 'F3', lyric: 'Bass', beats: 1 },
        { noteId: 'G3', lyric: 'har-', beats: 1 },
        { noteId: 'C4', lyric: 'mo-', beats: 1 },
        { noteId: 'E4', lyric: 'ny,', beats: 1 },
        { noteId: 'G4', lyric: 'shines', beats: 1 },
        { noteId: 'C5', lyric: 'so', beats: 1 },
        { noteId: 'B4', lyric: 'high,', beats: 1 },
        { noteId: 'A4', lyric: 'mag-', beats: 1 },
        { noteId: 'G4', lyric: 'ic', beats: 1 },
        { noteId: 'F4', lyric: 'un-', beats: 1 },
        { noteId: 'E4', lyric: 'i-', beats: 1 },
        { noteId: 'D4', lyric: 'corn', beats: 1 },
        { noteId: 'C4', lyric: 'star!', beats: 2 },
      ],
    },
  },
];
