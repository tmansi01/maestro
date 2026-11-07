import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Lock,
  Mic,
  Piano,
  Play,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { WORLDS, WorldDefinition } from '../data/curriculum';
import {
  ALL_NOTE_IDS,
  ClefType,
  NamingConvention,
  NOTES,
  NoteId,
  formatNoteLabel,
} from '../data/notes';
import { FreePracticeConfig, GameMode, PlayerState } from '../store/useGameStore';
import { MaestroUnicorn } from '../components/mascot/MaestroUnicorn';
import { speechNarrator } from '../engine/speech';

interface WorldMapViewProps {
  playerState: PlayerState;
  initialShowFreePractice?: boolean;
  onStartLesson: (world: WorldDefinition) => void;
  onStartGame: (world: WorldDefinition, mode: GameMode) => void;
  onStartBoss: (world: WorldDefinition) => void;
  onStartFreePractice: (config: FreePracticeConfig) => void;
  onOpenBoutique: () => void;
  onBackHome: () => void;
}

type PracticePresetId = 'my-notes' | 'treble' | 'bass' | 'grand';

const CHAPTERS = [
  {
    id: 1 as const,
    title: 'Part 1: ✋ Right Hand • Treble Clef (𝄞)',
    badge: '1 Octave (C to High C)',
    color: 'border-cyan-300 bg-cyan-50/70 text-cyan-950',
  },
  {
    id: 2 as const,
    title: 'Part 2: 🤚 Left Hand • Bass Clef (𝄢)',
    badge: '1 Octave (Low C to Middle C)',
    color: 'border-emerald-300 bg-emerald-50/70 text-emerald-950',
  },
  {
    id: 3 as const,
    title: 'Part 3: 🌟 Both Hands • Grand Staff (𝄞 + 𝄢)',
    badge: '2 Octaves (All 15 Notes!)',
    color: 'border-fuchsia-300 bg-fuchsia-50/70 text-fuchsia-950',
  },
];

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  playerState,
  initialShowFreePractice = false,
  onStartLesson,
  onStartGame,
  onStartBoss,
  onStartFreePractice,
  onOpenBoutique,
  onBackHome,
}) => {
  const [modalWorldId, setModalWorldId] = useState<number | null>(null);
  const [showFreePractice, setShowFreePractice] = useState(initialShowFreePractice);

  // Compute all notes from her unlocked worlds for the "⭐ My Notes" 1-tap preset
  const unlockedWorldNotes = useMemo(() => {
    const set = new Set<NoteId>();
    for (const w of WORLDS) {
      if (w.id <= playerState.unlockedWorld) {
        w.notePool.forEach((n) => set.add(n));
      }
    }
    const list = ALL_NOTE_IDS.filter((n) => set.has(n));
    return list.length >= 2 ? list : (['C4', 'D4', 'E4'] as NoteId[]);
  }, [playerState.unlockedWorld]);

  const unlockedClef: ClefType = useMemo(() => {
    const hasBass = unlockedWorldNotes.some((n) => NOTES[n].midi < NOTES.C4.midi);
    const hasTreble = unlockedWorldNotes.some((n) => NOTES[n].midi > NOTES.C4.midi);
    if (hasBass && hasTreble) return 'grand';
    if (hasBass) return 'bass';
    return 'treble';
  }, [unlockedWorldNotes]);

  const [fpPreset, setFpPreset] = useState<PracticePresetId>('my-notes');
  const [fpClef, setFpClef] = useState<ClefType>(unlockedClef);
  const [fpMode, setFpMode] = useState<GameMode>('piano');
  const [fpNotes, setFpNotes] = useState<NoteId[]>(unlockedWorldNotes);
  const [showCustomNotes, setShowCustomNotes] = useState(false);

  const modalWorld = modalWorldId
    ? WORLDS.find((w) => w.id === modalWorldId) || null
    : null;

  const totalStars = Object.values(playerState.worldStars).reduce(
    (acc, w) => acc + w.piano + w.bubbles + w.mic,
    0
  );

  const applyPreset = (presetId: PracticePresetId) => {
    setFpPreset(presetId);
    if (presetId === 'my-notes') {
      setFpClef(unlockedClef);
      setFpNotes(unlockedWorldNotes);
    } else if (presetId === 'treble') {
      setFpClef('treble');
      setFpNotes(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']);
    } else if (presetId === 'bass') {
      setFpClef('bass');
      setFpNotes(['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']);
    } else {
      setFpClef('grand');
      setFpNotes(ALL_NOTE_IDS);
    }
  };

  const toggleFpNote = (noteId: NoteId) => {
    setFpNotes((prev) => {
      if (prev.includes(noteId)) {
        return prev.length > 1 ? prev.filter((n) => n !== noteId) : prev;
      }
      return [...prev, noteId];
    });
  };

  const getNoteLandmarkBadge = (nId: NoteId) => {
    if (nId === 'C4') return '🦄';
    if (nId === 'G4') return '🌀';
    if (nId === 'F3') return '••';
    if (nId === 'C5') return '⭐';
    if (nId === 'C3') return '💎';
    return '';
  };

  // ============================================================================
  // VIEW A: 1-TAP FREE PRACTICE LAUNCHER
  // ============================================================================
  if (showFreePractice) {
    const fpBubble = 'Pick your notes and tap Play!';
    return (
      <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
        <header className="flex items-center justify-between gap-3 bg-white/95 px-4 sm:px-5 py-3 rounded-3xl shadow-sm border-3 border-cyan-200">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-100 hover:bg-cyan-200 text-cyan-900 font-black text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>

          <h1 className="text-lg sm:text-2xl font-black text-slate-800">
            🎵 Free Practice
          </h1>

          <div className="flex items-center gap-1.5 bg-fuchsia-100 text-fuchsia-900 px-3.5 py-1.5 rounded-2xl font-black text-sm">
            <Sparkles className="w-4 h-4 text-fuchsia-600" />
            {playerState.points}
          </div>
        </header>

        <MaestroUnicorn
          compact
          mood="happy"
          equipped={playerState.equippedAccessories}
          speechBubble={fpBubble}
          onReplaySpeech={() => speechNarrator.speak(fpBubble)}
        />

        <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-cyan-300 flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                { id: 'my-notes' as const, emoji: '⭐', title: 'My Notes', sub: `World 1–${playerState.unlockedWorld}` },
                { id: 'treble' as const, emoji: '✋', title: 'Right Hand', sub: 'Treble 𝄞' },
                { id: 'bass' as const, emoji: '🤚', title: 'Left Hand', sub: 'Bass 𝄢' },
                { id: 'grand' as const, emoji: '👑', title: 'Both Hands', sub: 'All Notes' },
              ]
            ).map((card) => {
              const active = fpPreset === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => applyPreset(card.id)}
                  className={`p-4 rounded-2xl border-3 flex flex-col items-center text-center gap-1 transition cursor-pointer ${
                    active
                      ? 'bg-cyan-600 text-white border-cyan-800 shadow-md scale-[1.03]'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-cyan-300'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{card.emoji}</span>
                  <span className="font-black text-sm sm:text-base">{card.title}</span>
                  <span
                    className={`text-xs font-bold ${
                      active ? 'text-cyan-100' : 'text-slate-500'
                    }`}
                  >
                    {card.sub}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-2 flex-1">
              {(
                [
                  { id: 'piano' as const, emoji: '🎹', label: 'Piano' },
                  { id: 'bubbles' as const, emoji: '🫧', label: 'Bubbles' },
                  { id: 'mic' as const, emoji: '🎤', label: 'Mic' },
                ]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFpMode(m.id)}
                  className={`py-3 px-3 rounded-2xl font-black text-sm sm:text-base border-2 flex items-center justify-center gap-2 cursor-pointer transition ${
                    fpMode === m.id
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                      : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                onStartFreePractice({
                  clef: fpClef,
                  selectedNotes: fpNotes,
                  mode: fpMode,
                })
              }
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-lg shadow-lg hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              Play!
            </button>
          </div>

          <div className="border-t border-slate-200 pt-2">
            <button
              type="button"
              onClick={() => setShowCustomNotes((v) => !v)}
              className="text-xs font-extrabold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Pick Specific Notes ({fpNotes.length} active)</span>
              {showCustomNotes ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showCustomNotes && (
              <div className="flex flex-wrap gap-2 mt-3">
                {ALL_NOTE_IDS.map((nId) => {
                  const n = NOTES[nId];
                  const active = fpNotes.includes(nId);
                  const badge = getNoteLandmarkBadge(nId);
                  return (
                    <button
                      key={nId}
                      type="button"
                      onClick={() => toggleFpNote(nId)}
                      style={{
                        backgroundColor: active ? n.color : '#f8fafc',
                        color: active ? '#ffffff' : '#475569',
                        borderColor: active ? n.color : '#cbd5e1',
                      }}
                      className="px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm border-2 cursor-pointer transition hover:scale-105"
                    >
                      {badge ? `${badge} ` : ''}
                      {formatNoteLabel(n.letter, playerState.namingConvention)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW B: PROGRESSIVE 3-CHAPTER ADVENTURE MAP (TREBLE ➔ BASS ➔ BOTH)
  // ============================================================================
  const mapPrompt = `Tap World ${playerState.unlockedWorld} to learn & play!`;

  return (
    <div className="flex flex-col gap-3.5 max-w-5xl mx-auto w-full">
      {/* Clean Top Bar */}
      <header className="flex items-center justify-between gap-3 bg-white/95 px-4 sm:px-5 py-2.5 rounded-3xl shadow-sm border-3 border-purple-200">
        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>

        <h1 className="text-lg sm:text-2xl font-black text-purple-900">
          🗺️ 8-World Adventure
        </h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-100 border-2 border-yellow-300 text-yellow-900 px-3 py-1.5 rounded-2xl font-black text-xs sm:text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            {totalStars}
          </div>

          <button
            type="button"
            onClick={onOpenBoutique}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-pink-100 hover:bg-pink-200 border-2 border-pink-300 text-pink-900 font-black text-xs sm:text-sm cursor-pointer"
          >
            <span>👑</span>
            <span>{playerState.points}</span>
          </button>
        </div>
      </header>

      {/* Short Unicorn Prompt */}
      <MaestroUnicorn
        compact
        mood="happy"
        equipped={playerState.equippedAccessories}
        speechBubble={mapPrompt}
        onReplaySpeech={() => speechNarrator.speak(mapPrompt)}
      />

      {/* 3 Progressive Pedagogical Chapters: Right Hand (Treble) ➔ Left Hand (Bass) ➔ Both Hands (Grand Staff) */}
      <div className="flex flex-col gap-3.5">
        {CHAPTERS.map((chap) => {
          const chapterWorlds = WORLDS.filter((w) => w.chapter === chap.id);

          return (
            <section
              key={chap.id}
              className={`rounded-3xl p-3.5 sm:p-4 border-2 ${chap.color} flex flex-col gap-2.5`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <h2 className="font-black text-sm sm:text-base">{chap.title}</h2>
                <span className="text-xs font-extrabold bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200">
                  🎹 {chap.badge}
                </span>
              </div>

              <div
                className={`grid gap-3 ${
                  chapterWorlds.length === 4
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : chapterWorlds.length === 3
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {chapterWorlds.map((world) => {
                  const isUnlocked = world.id <= playerState.unlockedWorld;
                  const isCurrent = world.id === playerState.unlockedWorld;
                  const prog = playerState.worldStars[world.id] || {
                    lessonDone: false,
                    piano: 0,
                    bubbles: 0,
                    mic: 0,
                    bossCleared: false,
                    speedBadge: false,
                  };
                  const bestStars = Math.max(prog.piano, prog.bubbles, prog.mic);

                  return (
                    <button
                      key={world.id}
                      type="button"
                      onClick={() => {
                        if (isUnlocked) {
                          setModalWorldId(world.id);
                        } else {
                          speechNarrator.speak(
                            `Finish World ${world.id - 1} song first to unlock World ${world.id}!`
                          );
                        }
                      }}
                      className={`group relative rounded-2xl p-3.5 sm:p-4 border-3 flex flex-col items-center justify-between text-center min-h-36 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white border-purple-600 shadow-lg ring-3 ring-purple-300 scale-[1.01]'
                          : isUnlocked
                          ? 'bg-white/95 border-white hover:border-purple-400 shadow-sm'
                          : 'bg-slate-100/75 border-slate-200 opacity-70'
                      }`}
                    >
                      {/* Top Row: World Number + Note Count + Status */}
                      <div className="w-full flex items-center justify-between gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            isUnlocked
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          World {world.id} • {world.notePool.length} Notes
                        </span>

                        {prog.bossCleared ? (
                          <span
                            className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center"
                            title="Boss Song Cleared!"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          </span>
                        ) : !isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        ) : isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black animate-bounce">
                            ▶ Here!
                          </span>
                        ) : null}
                      </div>

                      {/* Center Emoji + Landmark Badge */}
                      <div className="flex flex-col items-center my-1">
                        <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                          {isUnlocked ? world.emoji : '🔒'}
                        </div>
                        <span className="text-[11px] font-extrabold text-purple-700 mt-0.5">
                          {world.landmarkBadge}
                        </span>
                      </div>

                      {/* Title + Subtitle + 3-Tier Stars */}
                      <div className="w-full flex flex-col items-center gap-0.5">
                        <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight">
                          {world.title}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500">
                          {world.subtitle}
                        </p>

                        {isUnlocked ? (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= bestStars
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-slate-200 fill-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 mt-1">
                            Locked
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* FOCUSED WORLD STAGE MODAL (Enforces Step 1 Story ➔ Step 2 Practice Tiers ➔ Step 3 Boss Song) */}
      {modalWorld && (
        <div
          onClick={() => setModalWorldId(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border-4 border-purple-300 flex flex-col gap-4"
          >
            {/* World Header Banner */}
            <div
              className={`rounded-2xl p-4 text-white bg-gradient-to-r ${modalWorld.themeGradient} flex items-center justify-between gap-3`}
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl">{modalWorld.emoji}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-black uppercase bg-white/25 px-2.5 py-0.5 rounded-full">
                      World {modalWorld.id}
                    </span>
                    <span className="text-xs font-black bg-white/25 px-2.5 py-0.5 rounded-full">
                      {modalWorld.landmarkBadge}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-1">
                    {modalWorld.title}
                  </h2>
                  <p className="text-xs text-white/90 font-bold">
                    {modalWorld.description}
                  </p>
                  {/* Clean Note Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {modalWorld.notePool.map((nId) => {
                      const badge = getNoteLandmarkBadge(nId);
                      return (
                        <span
                          key={nId}
                          className="px-2 py-0.5 rounded-lg bg-white/25 text-white font-black text-xs"
                        >
                          {badge ? `${badge} ` : ''}
                          {formatNoteLabel(
                            NOTES[nId].letter,
                            playerState.namingConvention as NamingConvention
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalWorldId(null)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer self-start"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const prog = playerState.worldStars[modalWorld.id] || {
                lessonDone: false,
                piano: 0,
                bubbles: 0,
                mic: 0,
                bossCleared: false,
                speedBadge: false,
              };
              const maxModeStars = Math.max(prog.piano, prog.bubbles, prog.mic);
              const gamesUnlocked = prog.lessonDone;
              // Boss Song unlocks at 2⭐⭐ (after she proves she can read the notes in Black & White!)
              const songUnlocked = maxModeStars >= 2 || prog.bossCleared;

              const primaryAction = !prog.lessonDone
                ? {
                    label: '📖 Step 1: Start Story Lesson!',
                    sub: 'Learn the Landmark trick first to unlock the games!',
                    onClick: () => onStartLesson(modalWorld),
                    gradient: 'from-purple-600 to-pink-600',
                  }
                : maxModeStars === 0
                ? {
                    label: '⭐ Step 2: Play Tier 1 (Rainbow Guide)',
                    sub: 'Practice with rainbow helper colors to earn your 1st Star!',
                    onClick: () => onStartGame(modalWorld, 'piano'),
                    gradient: 'from-fuchsia-600 to-purple-600',
                  }
                : maxModeStars === 1
                ? {
                    label: '⭐⭐ Step 2: Play Tier 2 (Sight Reader)',
                    sub: 'Read real black-and-white notes to earn 2 Stars & unlock the Boss Song!',
                    onClick: () => onStartGame(modalWorld, 'piano'),
                    gradient: 'from-indigo-600 to-purple-600',
                  }
                : !prog.bossCleared
                ? {
                    label: `👑 Step 3: Play Song (${modalWorld.bossMelody.title})!`,
                    sub: 'Play the World Finale song to unlock the next World!',
                    onClick: () => onStartBoss(modalWorld),
                    gradient: 'from-amber-500 to-orange-500',
                  }
                : {
                    label: '⭐⭐⭐ Play Again (Master Mode)!',
                    sub: 'Replay anytime to earn more Sparkles!',
                    onClick: () => onStartGame(modalWorld, 'piano'),
                    gradient: 'from-emerald-500 to-teal-600',
                  };

              return (
                <>
                  {/* Progressive 3-Tier Mastery Ladder Indicator */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div
                      className={`p-2 rounded-xl border-2 text-xs font-black ${
                        maxModeStars >= 1
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-pink-50 border-pink-200 text-pink-800'
                      }`}
                    >
                      ⭐ Tier 1: Rainbow
                    </div>
                    <div
                      className={`p-2 rounded-xl border-2 text-xs font-black ${
                        maxModeStars >= 2
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                      }`}
                    >
                      ⭐⭐ Tier 2: Black & White
                    </div>
                    <div
                      className={`p-2 rounded-xl border-2 text-xs font-black ${
                        maxModeStars >= 3
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      ⭐⭐⭐ Tier 3: Master
                    </div>
                  </div>

                  {/* 1 GIANT PULSING "NEXT STEP" BUTTON */}
                  <button
                    type="button"
                    onClick={primaryAction.onClick}
                    className={`w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r ${primaryAction.gradient} text-white shadow-lg hover:scale-[1.02] transition flex flex-col items-center justify-center gap-0.5 cursor-pointer`}
                  >
                    <div className="font-black text-base sm:text-lg flex items-center gap-2">
                      <Play className="w-5 h-5 fill-white" />
                      <span>{primaryAction.label}</span>
                    </div>
                    <span className="text-xs font-bold text-white/90">
                      {primaryAction.sub}
                    </span>
                  </button>

                  {/* 5 Activity Tiles (Gated sequentially: Story ➔ Practice Modes ➔ Song) */}
                  <div className="grid grid-cols-5 gap-2">
                    {/* 1. Story */}
                    <button
                      type="button"
                      onClick={() => onStartLesson(modalWorld)}
                      className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 flex flex-col items-center justify-between gap-1.5 cursor-pointer transition"
                    >
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      <span className="font-black text-xs text-slate-800">1. Story</span>
                      {prog.lessonDone ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-purple-700">Start!</span>
                      )}
                    </button>

                    {/* 2. Piano */}
                    <button
                      type="button"
                      disabled={!gamesUnlocked}
                      onClick={() => onStartGame(modalWorld, 'piano')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between gap-1.5 transition ${
                        gamesUnlocked
                          ? 'bg-fuchsia-50 hover:bg-fuchsia-100 border-fuchsia-200 cursor-pointer'
                          : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Piano className="w-6 h-6 text-fuchsia-600" />
                      <span className="font-black text-xs text-slate-800">Piano</span>
                      {gamesUnlocked ? (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= prog.piano
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-slate-300 fill-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* 3. Bubbles */}
                    <button
                      type="button"
                      disabled={!gamesUnlocked}
                      onClick={() => onStartGame(modalWorld, 'bubbles')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between gap-1.5 transition ${
                        gamesUnlocked
                          ? 'bg-pink-50 hover:bg-pink-100 border-pink-200 cursor-pointer'
                          : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-6 h-6 text-pink-600" />
                      <span className="font-black text-xs text-slate-800">Bubbles</span>
                      {gamesUnlocked ? (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= prog.bubbles
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-slate-300 fill-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* 4. Real Piano Mic */}
                    <button
                      type="button"
                      disabled={!gamesUnlocked}
                      onClick={() => onStartGame(modalWorld, 'mic')}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between gap-1.5 transition ${
                        gamesUnlocked
                          ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 cursor-pointer'
                          : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Mic className="w-6 h-6 text-cyan-600" />
                      <span className="font-black text-xs text-slate-800">Mic</span>
                      {gamesUnlocked ? (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= prog.mic
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-slate-300 fill-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* 5. Boss Song (Unlocks at 2⭐⭐ Sight-Reader!) */}
                    <button
                      type="button"
                      disabled={!songUnlocked}
                      onClick={() => onStartBoss(modalWorld)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between gap-1.5 transition ${
                        songUnlocked
                          ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 cursor-pointer'
                          : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      }`}
                      title={
                        songUnlocked
                          ? 'Play the World Finale Song!'
                          : 'Earn 2 Stars (⭐⭐ Sight Reader) to unlock the Song!'
                      }
                    >
                      <Crown className="w-6 h-6 text-amber-500" />
                      <span className="font-black text-xs text-slate-800">3. Song</span>
                      {prog.bossCleared ? (
                        <span className="text-xs">🏆</span>
                      ) : songUnlocked ? (
                        <span className="text-[10px] font-black text-amber-700">Ready!</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">Need ⭐⭐</span>
                      )}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
