import { ClefType, NoteId } from './notes';

export interface LessonSlide {
  title: string;
  speechText: string;
  highlightNotes: NoteId[];
  clef: 'treble' | 'bass' | 'grand';
  showLandmarkBadge?: boolean;
  /**
   * Optional interactive prompt: asks her to tap/play this note before advancing!
   */
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
  title: string;
  subtitle: string;
  emoji: string;
  themeGradient: string;
  badgeColor: string;
  clef: ClefType;
  newNotes: NoteId[];
  notePool: NoteId[];
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
  {
    id: 1,
    title: 'The Magic Whisker',
    subtitle: 'Middle C & Its Neighbors',
    emoji: '🦄',
    themeGradient: 'from-pink-500 via-purple-500 to-indigo-500',
    badgeColor: '#ec4899',
    clef: 'grand',
    newNotes: ['C4', 'D4', 'B3'],
    notePool: ['B3', 'C4', 'D4'],
    description: 'Meet Middle C with its magic whisker line, plus its best friends stepping Up to D and Down to B!',
    lessonSlides: [
      {
        title: 'Welcome to Music Land!',
        speechText:
          'Hi! I am Maestro the Unicorn! Today we will learn to read magic music notes on the piano staff. Look at this special red note in the middle: it is Middle C! It has its own little whisker line through its tummy.',
        highlightNotes: ['C4'],
        clef: 'grand',
        showLandmarkBadge: true,
        tryItNote: 'C4',
        tryItPrompt: 'Tap Middle C to hear its magic sound!',
      },
      {
        title: 'Stepping Up to D!',
        speechText:
          'Notes love to climb up the ladder one step at a time! When we step UP one space above Middle C, we reach D! D hangs right underneath the bottom line of the Treble staff.',
        highlightNotes: ['C4', 'D4'],
        clef: 'treble',
        tryItNote: 'D4',
        tryItPrompt: 'Step UP from C and play D!',
      },
      {
        title: 'Stepping Down to B!',
        speechText:
          'What happens when we step DOWN one spot below Middle C? We land right on top of the Bass staff on note B! C, D, and B are middle neighbors!',
        highlightNotes: ['B3', 'C4'],
        clef: 'grand',
        tryItNote: 'B3',
        tryItPrompt: 'Step DOWN from Middle C and play B!',
      },
    ],
    bossMelody: {
      title: 'Hot Cross Buns (Unicorn Remix)',
      composerOrTrad: 'Traditional Melody',
      introSpeech: 'You are ready for the World 1 Boss Concert! Play the notes on the staff to perform Hot Cross Buns!',
      notes: [
        { noteId: 'D4', lyric: 'Hot', beats: 1 },
        { noteId: 'C4', lyric: 'Cross', beats: 1 },
        { noteId: 'B3', lyric: 'Buns!', beats: 2 },
        { noteId: 'D4', lyric: 'Hot', beats: 1 },
        { noteId: 'C4', lyric: 'Cross', beats: 1 },
        { noteId: 'B3', lyric: 'Buns!', beats: 2 },
        { noteId: 'B3', lyric: 'One', beats: 1 },
        { noteId: 'B3', lyric: 'a', beats: 1 },
        { noteId: 'C4', lyric: 'pen-', beats: 1 },
        { noteId: 'C4', lyric: 'ny,', beats: 1 },
        { noteId: 'D4', lyric: 'Hot', beats: 1 },
        { noteId: 'C4', lyric: 'Cross', beats: 1 },
        { noteId: 'B3', lyric: 'Buns!', beats: 2 },
      ],
    },
  },
  {
    id: 2,
    title: 'The Treble Swirl',
    subtitle: 'Landmark G & Lower Treble',
    emoji: '🌀',
    themeGradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    badgeColor: '#06b6d4',
    clef: 'treble',
    newNotes: ['G4', 'F4', 'E4'],
    notePool: ['C4', 'D4', 'E4', 'F4', 'G4'],
    description: 'Discover the secret of the Treble Clef swirl on Line 2 (G) and connect Middle C all the way to G!',
    lessonSlides: [
      {
        title: 'The Secret of the Treble Swirl!',
        speechText:
          'Look closely at the curly Treble Clef! Its big belly swirl wraps right around the second line from the bottom. That magic line is ALWAYS Landmark G!',
        highlightNotes: ['G4'],
        clef: 'treble',
        showLandmarkBadge: true,
        tryItNote: 'G4',
        tryItPrompt: 'Play Landmark G on the 2nd line!',
      },
      {
        title: 'Stepping Down to F',
        speechText:
          'Right below the G line is the very first space at the bottom of the staff. One step down from G is F! F loves sitting cozily inside that bottom space.',
        highlightNotes: ['G4', 'F4'],
        clef: 'treble',
        tryItNote: 'F4',
        tryItPrompt: 'Step down into the 1st space and play F!',
      },
      {
        title: 'Bottom Line E!',
        speechText:
          'And on the very bottom line of the Treble staff sits E! Now you know the whole 5-finger rainbow from Middle C up to G: C, D, E, F, G!',
        highlightNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
        clef: 'treble',
        tryItNote: 'E4',
        tryItPrompt: 'Play E on the bottom line!',
      },
    ],
    bossMelody: {
      title: 'Mary Had a Little Lamb',
      composerOrTrad: 'Traditional',
      introSpeech: 'Time for our World 2 Concert! Let us play Mary Had a Little Lamb using C, D, E, and G!',
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
    title: 'Climbing the Rainbow',
    subtitle: 'Upper Treble A, B & High C',
    emoji: '🌈',
    themeGradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    badgeColor: '#a855f7',
    clef: 'treble',
    newNotes: ['A4', 'B4', 'C5'],
    notePool: ['F4', 'G4', 'A4', 'B4', 'C5'],
    description: 'Climb above Landmark G into the clouds to meet A, B, and sparkling High C!',
    lessonSlides: [
      {
        title: 'Stepping Above Landmark G!',
        speechText:
          'Remember our friend Landmark G on line 2? When we step UP into the space right above G, we start the alphabet over again at A!',
        highlightNotes: ['G4', 'A4'],
        clef: 'treble',
        tryItNote: 'A4',
        tryItPrompt: 'Step UP from G and play A!',
      },
      {
        title: 'Middle Line B!',
        speechText:
          'One more step up from A lands right on the middle line (line 3) of the Treble staff. That note is B!',
        highlightNotes: ['A4', 'B4'],
        clef: 'treble',
        tryItNote: 'B4',
        tryItPrompt: 'Play B on the middle line of the staff!',
      },
      {
        title: 'Sparkling High C!',
        speechText:
          'And right above B in the 3rd space is High C! It sounds higher and brighter than Middle C, and it is a special Landmark note too!',
        highlightNotes: ['G4', 'A4', 'B4', 'C5'],
        clef: 'treble',
        showLandmarkBadge: true,
        tryItNote: 'C5',
        tryItPrompt: 'Play sparkling High C in space 3!',
      },
    ],
    bossMelody: {
      title: 'Twinkle, Twinkle, Little Star',
      composerOrTrad: 'Traditional / Mozart',
      introSpeech: 'Look up at the starry sky! Play Twinkle, Twinkle, Little Star to clear World 3!',
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
    title: 'Treble Clef Champion',
    subtitle: 'Full Treble Octave & Space Magic',
    emoji: '👑',
    themeGradient: 'from-amber-400 via-orange-500 to-rose-500',
    badgeColor: '#f59e0b',
    clef: 'treble',
    newNotes: [],
    notePool: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    description: 'Master all 8 Treble notes from Middle C to High C using Landmarks and the F-A-C-E space trick!',
    lessonSlides: [
      {
        title: 'The Space Note Magic Word!',
        speechText:
          'Want to know a cool unicorn secret? Look at the spaces inside the Treble staff from bottom to top: F, A, C! Together with E at the top, the spaces spell FACE!',
        highlightNotes: ['F4', 'A4', 'C5'],
        clef: 'treble',
        tryItNote: 'A4',
        tryItPrompt: 'Find A in the second space!',
      },
      {
        title: 'Line Skips: E - G - B!',
        speechText:
          'And the first three lines skip up like stepping stones: E on line 1, Landmark G on line 2, and B on line 3! Let us test all your Treble skills!',
        highlightNotes: ['E4', 'G4', 'B4'],
        clef: 'treble',
        tryItNote: 'G4',
        tryItPrompt: 'Tap Landmark G to start the Treble Championship!',
      },
    ],
    bossMelody: {
      title: 'Ode to Joy',
      composerOrTrad: 'Ludwig van Beethoven',
      introSpeech: 'Welcome to the Treble Championship Concert! Let us play Beethoven’s famous Ode to Joy!',
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
  {
    id: 5,
    title: 'The Two Magic Dots',
    subtitle: 'Bass Clef Landmark F, G & A',
    emoji: '🪄',
    themeGradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    badgeColor: '#10b981',
    clef: 'bass',
    newNotes: ['F3', 'G3', 'A3'],
    notePool: ['F3', 'G3', 'A3', 'B3', 'C4'],
    description: 'Explore the Bass Clef with your left hand! Follow the two magic dots to Landmark F!',
    lessonSlides: [
      {
        title: 'Meet the Bass Clef!',
        speechText:
          'Now let us explore the lower notes on the left side of the piano with the Bass Clef! See those two magic dots? They hug the 4th line up—and that line is ALWAYS Landmark Bass F!',
        highlightNotes: ['F3'],
        clef: 'bass',
        showLandmarkBadge: true,
        tryItNote: 'F3',
        tryItPrompt: 'Play Landmark Bass F between the two magic dots!',
      },
      {
        title: 'Stepping Up to Bass G!',
        speechText:
          'When we step UP one spot from the F line into the top space of the Bass staff, we get G! Just like the alphabet: F then G!',
        highlightNotes: ['F3', 'G3'],
        clef: 'bass',
        tryItNote: 'G3',
        tryItPrompt: 'Step UP from Bass F and play G!',
      },
      {
        title: 'Top Line Bass A!',
        speechText:
          'And sitting right on the very top line of the Bass staff is A! From A, you can step up to B and Middle C!',
        highlightNotes: ['F3', 'G3', 'A3', 'B3', 'C4'],
        clef: 'bass',
        tryItNote: 'A3',
        tryItPrompt: 'Play Bass A on the top line!',
      },
    ],
    bossMelody: {
      title: 'Row, Row, Row Your Boat',
      composerOrTrad: 'Traditional',
      introSpeech: 'Let us sail down the Bass Clef river! Play Row, Row, Row Your Boat!',
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
    title: 'Deep in the Crystal Cave',
    subtitle: 'Lower Bass E, D & Bass C',
    emoji: '💎',
    themeGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    badgeColor: '#4f46e5',
    clef: 'bass',
    newNotes: ['E3', 'D3', 'C3'],
    notePool: ['C3', 'D3', 'E3', 'F3', 'G3'],
    description: 'Journey deeper into the Crystal Cave stepping down from Landmark F to E, D, and Bass C!',
    lessonSlides: [
      {
        title: 'Stepping Down from Landmark F',
        speechText:
          'Start at our two magic dots on Landmark F. When we step DOWN one space below F, we land on E!',
        highlightNotes: ['F3', 'E3'],
        clef: 'bass',
        tryItNote: 'E3',
        tryItPrompt: 'Step DOWN from F and play Bass E!',
      },
      {
        title: 'Middle Line Bass D!',
        speechText:
          'Step down one more spot onto the middle line (line 3) of the Bass staff, and you find D!',
        highlightNotes: ['F3', 'E3', 'D3'],
        clef: 'bass',
        tryItNote: 'D3',
        tryItPrompt: 'Play Bass D on the middle line!',
      },
      {
        title: 'Landmark Bass C!',
        speechText:
          'One more step down into the 2nd space from the bottom is Landmark Bass C! Now you know C, D, E, F, G in the Bass Clef too!',
        highlightNotes: ['C3', 'D3', 'E3', 'F3'],
        clef: 'bass',
        showLandmarkBadge: true,
        tryItNote: 'C3',
        tryItPrompt: 'Play deep Bass C in space 2!',
      },
    ],
    bossMelody: {
      title: 'Old MacDonald Had a Unicorn',
      composerOrTrad: 'Traditional',
      introSpeech: 'Down in the Crystal Cave, Old MacDonald has a musical unicorn! Play the Bass melody!',
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
    title: 'Bass Clef Explorer',
    subtitle: 'Full Bass Octave C3 to C4',
    emoji: '🚀',
    themeGradient: 'from-teal-500 via-emerald-500 to-lime-500',
    badgeColor: '#14b8a6',
    clef: 'bass',
    newNotes: [],
    notePool: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
    description: 'Combine all 8 Bass Clef notes from Bass C up to Middle C!',
    lessonSlides: [
      {
        title: 'All Four Bass Spaces: A-C-E-G!',
        speechText:
          'Look at the spaces in the Bass Clef starting from the 2nd space: Bass C, E, and G! Those three spaces make a sunny C chord!',
        highlightNotes: ['C3', 'E3', 'G3'],
        clef: 'bass',
        tryItNote: 'C3',
        tryItPrompt: 'Tap Bass C to start your Bass Explorer check!',
      },
      {
        title: 'Your Three Bass Landmarks',
        speechText:
          'Whenever you see a Bass note, just look for your nearest Landmark: Bass C in space 2, Landmark F between the two dots, or Middle C at the top!',
        highlightNotes: ['C3', 'F3', 'C4'],
        clef: 'bass',
        showLandmarkBadge: true,
        tryItNote: 'F3',
        tryItPrompt: 'Tap Landmark F to launch the Bass Explorer games!',
      },
    ],
    bossMelody: {
      title: 'London Bridge Is Falling Down',
      composerOrTrad: 'Traditional',
      introSpeech: 'Play London Bridge across the Bass Clef to earn your Bass Explorer Trophy!',
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
  {
    id: 8,
    title: 'The Grand Unicorn Concert',
    subtitle: 'Grand Staff Mastery (Treble + Bass)',
    emoji: '🌟',
    themeGradient: 'from-fuchsia-600 via-purple-600 to-indigo-600',
    badgeColor: '#d946ef',
    clef: 'grand',
    newNotes: [],
    notePool: [
      'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5',
    ],
    description: 'Read both Treble and Bass Clefs together on the Grand Staff like a true Piano Maestro!',
    lessonSlides: [
      {
        title: 'The Grand Staff!',
        speechText:
          'Congratulations! You have reached the Grand Unicorn Concert! When we join the Treble Staff on top and the Bass Staff on the bottom, it is called the Grand Staff!',
        highlightNotes: ['C3', 'F3', 'C4', 'G4', 'C5'],
        clef: 'grand',
        showLandmarkBadge: true,
        tryItNote: 'C4',
        tryItPrompt: 'Play Middle C right in the center of the Grand Staff!',
      },
      {
        title: 'Five Golden Landmarks!',
        speechText:
          'You now know all 5 Golden Landmarks across two whole octaves: Bass C, Bass F (two dots), Middle C (whisker line), Treble G (curly swirl), and High C! Let us make magic music!',
        highlightNotes: ['C3', 'F3', 'C4', 'G4', 'C5'],
        clef: 'grand',
        showLandmarkBadge: true,
        tryItNote: 'G4',
        tryItPrompt: 'Play Treble G to open the Grand Concert!',
      },
    ],
    bossMelody: {
      title: 'Grand Unicorn Symphony (Twinkle & Joy Finale)',
      composerOrTrad: 'Maestro Finale (Both Clefs!)',
      introSpeech: 'Our Grand Finale uses BOTH the Bass Clef and the Treble Clef! Show everyone you are a true Piano Maestro!',
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
