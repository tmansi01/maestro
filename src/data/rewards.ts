export type AccessoryCategory = 'hat' | 'glasses' | 'neck' | 'wings';

export interface UnicornAccessory {
  id: string;
  name: string;
  category: AccessoryCategory;
  emoji: string;
  costPoints: number;
  description: string;
}

export interface CollectibleSticker {
  id: string;
  name: string;
  emoji: string;
  worldUnlocked?: number;
  costPoints: number;
  description: string;
}

export const UNICORN_ACCESSORIES: UnicornAccessory[] = [
  {
    id: 'hat-conductor',
    name: 'Maestro Conductor Cap',
    category: 'hat',
    emoji: '🎩',
    costPoints: 100,
    description: 'A royal purple velvet cap for conducting grand symphonies!',
  },
  {
    id: 'hat-crown',
    name: 'Starlight Tiara',
    category: 'hat',
    emoji: '👑',
    costPoints: 200,
    description: 'Sparkling golden crown with a pink musical ruby!',
  },
  {
    id: 'hat-wizard',
    name: 'Melody Wizard Hat',
    category: 'hat',
    emoji: '🧙‍♀️',
    costPoints: 350,
    description: 'Covered in glowing stars and eighth notes!',
  },
  {
    id: 'glasses-star',
    name: 'Star Pop Glasses',
    category: 'glasses',
    emoji: '🤩',
    costPoints: 120,
    description: 'Pink star-shaped frames for rockstar sight-reading!',
  },
  {
    id: 'glasses-rainbow',
    name: 'Rainbow Shades',
    category: 'glasses',
    emoji: '🕶️',
    costPoints: 250,
    description: 'Cool rainbow lenses that shimmer with every streak!',
  },
  {
    id: 'neck-bowtie',
    name: 'Concert Bowtie',
    category: 'neck',
    emoji: '🎀',
    costPoints: 80,
    description: 'Polka-dot silk ribbon for recital night!',
  },
  {
    id: 'neck-medal',
    name: 'Golden Clef Medal',
    category: 'neck',
    emoji: '🏅',
    costPoints: 300,
    description: 'Awarded to brave Treble and Bass explorers!',
  },
  {
    id: 'wings-pegasus',
    name: 'Crystal Pegasus Wings',
    category: 'wings',
    emoji: '🪽',
    costPoints: 400,
    description: 'Magical feathered wings that flutter when you hit a streak!',
  },
  {
    id: 'wings-fairy',
    name: 'Rainbow Butterfly Wings',
    category: 'wings',
    emoji: '🦋',
    costPoints: 500,
    description: 'Glowing rainbow fairy wings for Grand Staff Champions!',
  },
];

export const STICKERS: CollectibleSticker[] = [
  {
    id: 'sticker-whisker',
    name: 'Middle C Whisker Cat',
    emoji: '🐱',
    worldUnlocked: 1,
    costPoints: 50,
    description: 'Purrs every time you spot Middle C’s ledger line!',
  },
  {
    id: 'sticker-swirl',
    name: 'Treble Swirl Dolphin',
    emoji: '🐬',
    worldUnlocked: 2,
    costPoints: 100,
    description: 'Jumps through the curly G-clef swirl!',
  },
  {
    id: 'sticker-rainbow',
    name: 'High C Rainbow Bird',
    emoji: '🦜',
    worldUnlocked: 3,
    costPoints: 150,
    description: 'Sings high up in space 3 of the Treble staff!',
  },
  {
    id: 'sticker-trophy',
    name: 'Treble Champion Harp',
    emoji: '🪉',
    worldUnlocked: 4,
    costPoints: 200,
    description: 'Master of F-A-C-E and every Treble note!',
  },
  {
    id: 'sticker-dots',
    name: 'Bass Dot Ladybug',
    emoji: '🐞',
    worldUnlocked: 5,
    costPoints: 200,
    description: 'Two lucky spots just like the Bass Clef F dots!',
  },
  {
    id: 'sticker-crystal',
    name: 'Crystal Cave Dragon',
    emoji: '🐉',
    worldUnlocked: 6,
    costPoints: 250,
    description: 'Rumbles down on deep Bass C!',
  },
  {
    id: 'sticker-rocket',
    name: 'Bass Rocket Owl',
    emoji: '🦉',
    worldUnlocked: 7,
    costPoints: 300,
    description: 'Wise guardian of the entire Bass Clef!',
  },
  {
    id: 'sticker-symphony',
    name: 'Grand Unicorn Pegasus',
    emoji: '🦄',
    worldUnlocked: 8,
    costPoints: 400,
    description: 'Supreme Maestro of both Treble and Bass Clefs!',
  },
];
