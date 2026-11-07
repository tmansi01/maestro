import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Lock,
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
  const [modalMode, setModalMode] = useState<GameMode>('piano');
  const [showFreePractice] = useState(initialShowFreePractice);

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
    (acc, w) => acc + Math.max(w.piano, w.bubbles, w.mic),
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

  const getClefSymbol = (clef: ClefType) => {
    if (clef === 'treble') return '✋ 𝄞';
    if (clef === 'bass') return '🤚 𝄢';
    return '🌟 𝄞+𝄢';
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
  // VIEW B: SINGLE-SCREEN 4x2 STEPPING-STONE ADVENTURE MAP
  // ============================================================================
  const mapPrompt = `Tap World ${playerState.unlockedWorld} to play!`;
  const row1Worlds = WORLDS.slice(0, 4); // Worlds 1–4: Right Hand (Treble 𝄞)
  const row2Worlds = WORLDS.slice(4, 8); // Worlds 5–7: Left Hand (Bass 𝄢) + World 8: Both Hands (𝄞+𝄢)

  const renderWorldTile = (world: WorldDefinition) => {
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
        className={`group relative rounded-3xl p-3 sm:p-4 border-3 flex flex-col items-center justify-between text-center min-h-34 sm:min-h-38 transition-all cursor-pointer ${
          isCurrent
            ? 'bg-white border-purple-600 shadow-xl ring-4 ring-purple-300 scale-[1.02]'
            : isUnlocked
            ? 'bg-white/95 border-purple-200 hover:border-purple-400 shadow-sm hover:scale-[1.01]'
            : 'bg-slate-100/80 border-slate-200 opacity-65'
        }`}
      >
        {/* 1. Top Corner: World # + Hand/Clef Badge & Status Icon */}
        <div className="w-full flex items-center justify-between gap-1">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
              isUnlocked
                ? world.clef === 'treble'
                  ? 'bg-cyan-100 text-cyan-900'
                  : world.clef === 'bass'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-fuchsia-100 text-fuchsia-900'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            #{world.id} {getClefSymbol(world.clef)}
          </span>

          {prog.bossCleared ? (
            <span
              className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center"
              title="Song Complete!"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </span>
          ) : !isUnlocked ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : isCurrent ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black animate-bounce">
              ▶ PLAY
            </span>
          ) : null}
        </div>

        {/* 2. Center: Giant World Emoji */}
        <div className="text-4xl sm:text-5xl my-1 group-hover:scale-110 transition-transform">
          {isUnlocked ? world.emoji : '🔒'}
        </div>

        {/* 3. Bottom: Short Title + 3 Stars */}
        <div className="w-full flex flex-col items-center gap-1">
          <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight">
            {world.title}
          </h3>

          {isUnlocked ? (
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    s <= bestStars
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>
          ) : (
            <span className="text-[11px] font-bold text-slate-400">Locked</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
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
          🗺️ Adventure Map
        </h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-100 border-2 border-yellow-300 text-yellow-900 px-3 py-1.5 rounded-2xl font-black text-xs sm:text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            {totalStars}/24
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

      {/* Unicorn Prompt + 1-Tap Continue Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex-1">
          <MaestroUnicorn
            compact
            mood="happy"
            equipped={playerState.equippedAccessories}
            speechBubble={mapPrompt}
            onReplaySpeech={() => speechNarrator.speak(mapPrompt)}
          />
        </div>
        <button
          type="button"
          onClick={() => setModalWorldId(playerState.unlockedWorld)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm sm:text-base shadow-md hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>World {playerState.unlockedWorld}</span>
        </button>
      </div>

      {/* Zero-Scroll 4x2 Board: Row 1 (Right Hand Treble) + Row 2 (Left Hand Bass & Both Hands) */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Worlds 1–4 (Right Hand • Treble Clef) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-1">
            <span className="px-3 py-0.5 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-900 font-black text-xs">
              ✋ Right Hand • Treble Clef (𝄞)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {row1Worlds.map(renderWorldTile)}
          </div>
        </div>

        {/* Row 2: Worlds 5–7 (Left Hand • Bass Clef) + World 8 (Both Hands • Grand Staff) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs">
              🤚 Left Hand • Bass Clef (𝄢)
            </span>
            <span className="px-3 py-0.5 rounded-full bg-fuchsia-100 border border-fuchsia-300 text-fuchsia-900 font-black text-xs">
              🌟 World 8: Both Hands (𝄞 + 𝄢)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {row2Worlds.map(renderWorldTile)}
          </div>
        </div>
      </div>

      {/* ==========================================================================
          SIMPLIFIED 3-STEP WORLD CARD MODAL (1. Story ➔ 2. Practice ➔ 3. Song)
          ========================================================================== */}
      {modalWorld && (
        <div
          onClick={() => setModalWorldId(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border-4 border-purple-300 flex flex-col gap-4"
          >
            {/* Compact World Header */}
            <div
              className={`rounded-2xl p-4 text-white bg-gradient-to-r ${modalWorld.themeGradient} flex items-center justify-between gap-3`}
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl">{modalWorld.emoji}</span>
                <div>
                  <span className="text-xs font-black uppercase bg-white/25 px-2.5 py-0.5 rounded-full">
                    World {modalWorld.id} • {modalWorld.landmarkBadge}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1">
                    {modalWorld.title}
                  </h2>
                  {/* Visual Note Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
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
              const songUnlocked = maxModeStars >= 2 || prog.bossCleared;

              // Determine which step (1, 2, or 3) is her active highlight
              const activeStep: 1 | 2 | 3 = !prog.lessonDone
                ? 1
                : maxModeStars < 2 || (!prog.bossCleared && maxModeStars < 2)
                ? 2
                : !prog.bossCleared
                ? 3
                : 2;

              const practiceStarBadge =
                maxModeStars === 0
                  ? '🌈 Star 1: Rainbow'
                  : maxModeStars === 1
                  ? '🎵 Star 2: Real Notes'
                  : '🏆 Star 3: Master';

              const primaryCta =
                activeStep === 1
                  ? {
                      label: '📖 Start Step 1: Story!',
                      onClick: () => onStartLesson(modalWorld),
                      gradient: 'from-purple-600 to-pink-600',
                    }
                  : activeStep === 3
                  ? {
                      label: `👑 Play Song: ${modalWorld.bossMelody.title}!`,
                      onClick: () => onStartBoss(modalWorld),
                      gradient: 'from-amber-500 to-orange-500',
                    }
                  : {
                      label: `▶ Play Practice (${practiceStarBadge})!`,
                      onClick: () => onStartGame(modalWorld, modalMode),
                      gradient: 'from-fuchsia-600 to-indigo-600',
                    };

              return (
                <>
                  {/* 3 BIG STEPPING-STONE CARDS: 1. Story ➔ 2. Practice ➔ 3. Song */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* STEP 1: STORY */}
                    <button
                      type="button"
                      onClick={() => onStartLesson(modalWorld)}
                      className={`p-3.5 rounded-2xl border-3 flex flex-col items-center justify-between text-center gap-2 transition cursor-pointer ${
                        activeStep === 1
                          ? 'bg-purple-50 border-purple-500 ring-3 ring-purple-200 scale-[1.02]'
                          : 'bg-slate-50 hover:bg-purple-50/60 border-slate-200'
                      }`}
                    >
                      <span className="text-xs font-black text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        Step 1
                      </span>
                      <BookOpen className="w-8 h-8 text-purple-600" />
                      <span className="font-black text-sm text-slate-800">
                        Story
                      </span>
                      {prog.lessonDone ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-black">
                          Start!
                        </span>
                      )}
                    </button>

                    {/* STEP 2: PRACTICE (3 Stars) */}
                    <button
                      type="button"
                      disabled={!gamesUnlocked}
                      onClick={() => onStartGame(modalWorld, modalMode)}
                      className={`p-3.5 rounded-2xl border-3 flex flex-col items-center justify-between text-center gap-2 transition ${
                        !gamesUnlocked
                          ? 'bg-slate-100 border-slate-200 opacity-55 cursor-not-allowed'
                          : activeStep === 2
                          ? 'bg-fuchsia-50 border-fuchsia-500 ring-3 ring-fuchsia-200 scale-[1.02] cursor-pointer'
                          : 'bg-slate-50 hover:bg-fuchsia-50/60 border-slate-200 cursor-pointer'
                      }`}
                    >
                      <span className="text-xs font-black text-fuchsia-800 bg-fuchsia-100 px-2.5 py-0.5 rounded-full">
                        Step 2
                      </span>

                      <div className="flex items-center gap-1 my-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${
                              s <= maxModeStars
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-300 fill-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="font-black text-sm text-slate-800">
                        Practice
                      </span>

                      {gamesUnlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-900 text-[10px] font-black">
                          {practiceStarBadge}
                        </span>
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {/* STEP 3: BOSS SONG */}
                    <button
                      type="button"
                      disabled={!songUnlocked}
                      onClick={() => onStartBoss(modalWorld)}
                      className={`p-3.5 rounded-2xl border-3 flex flex-col items-center justify-between text-center gap-2 transition ${
                        !songUnlocked
                          ? 'bg-slate-100 border-slate-200 opacity-55 cursor-not-allowed'
                          : activeStep === 3
                          ? 'bg-amber-50 border-amber-500 ring-3 ring-amber-200 scale-[1.02] cursor-pointer'
                          : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 cursor-pointer'
                      }`}
                    >
                      <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Step 3
                      </span>
                      <Crown className="w-8 h-8 text-amber-500" />
                      <span className="font-black text-sm text-slate-800">
                        Song
                      </span>
                      {prog.bossCleared ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                          🏆 Won!
                        </span>
                      ) : songUnlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black">
                          Play!
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-slate-500">
                          🔒 Need ⭐⭐
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Simple 3-Icon Input Mode Toggle for Practice (Piano | Bubbles | Mic) */}
                  {gamesUnlocked && (
                    <div className="flex items-center justify-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                      <span className="text-xs font-black text-slate-500 px-2">
                        Play with:
                      </span>
                      {(
                        [
                          { id: 'piano' as const, emoji: '🎹', label: 'Piano' },
                          { id: 'bubbles' as const, emoji: '🫧', label: 'Bubbles' },
                          { id: 'mic' as const, emoji: '🎤', label: 'Real Piano' },
                        ]
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setModalMode(m.id)}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition ${
                            modalMode === m.id
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-purple-50'
                          }`}
                        >
                          <span>{m.emoji}</span>
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 1 GIANT PULSING "PLAY" CTA BUTTON */}
                  <button
                    type="button"
                    onClick={primaryCta.onClick}
                    className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${primaryCta.gradient} text-white font-black text-base sm:text-lg shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <Play className="w-6 h-6 fill-white" />
                    <span>{primaryCta.label}</span>
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
