import React, { useState } from 'react';
import {
  BookOpen,
  Crown,
  Lock,
  Mic,
  Music2,
  Piano,
  Play,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { WORLDS, WorldDefinition } from '../data/curriculum';
import { ALL_NOTE_IDS, ClefType, NamingConvention, NOTES, NoteId, formatNoteLabel } from '../data/notes';
import { FreePracticeConfig, GameMode, PlayerState } from '../store/useGameStore';
import { MaestroUnicorn } from '../components/mascot/MaestroUnicorn';

interface WorldMapViewProps {
  playerState: PlayerState;
  onStartLesson: (world: WorldDefinition) => void;
  onStartGame: (world: WorldDefinition, mode: GameMode) => void;
  onStartBoss: (world: WorldDefinition) => void;
  onStartFreePractice: (config: FreePracticeConfig) => void;
  onOpenBoutique: () => void;
  onOpenParentSettings: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  playerState,
  onStartLesson,
  onStartGame,
  onStartBoss,
  onStartFreePractice,
  onOpenBoutique,
  onOpenParentSettings,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number>(playerState.unlockedWorld);
  const [showFreePractice, setShowFreePractice] = useState(false);
  const [fpClef, setFpClef] = useState<ClefType>('treble');
  const [fpMode, setFpMode] = useState<GameMode>('piano');
  const [fpNotes, setFpNotes] = useState<NoteId[]>(['C4', 'D4', 'E4', 'F4', 'G4']);

  const selectedWorld = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];
  const selectedProgress = playerState.worldStars[selectedWorld.id] || {
    lessonDone: false,
    piano: 0,
    bubbles: 0,
    mic: 0,
    bossCleared: false,
    speedBadge: false,
  };
  const isSelectedUnlocked = selectedWorld.id <= playerState.unlockedWorld;
  const maxModeStars = Math.max(
    selectedProgress.piano,
    selectedProgress.bubbles,
    selectedProgress.mic
  );

  // Total stars earned across all 8 worlds (up to 9 stars per world = 72 stars)
  const totalStars = Object.values(playerState.worldStars).reduce(
    (acc, w) => acc + w.piano + w.bubbles + w.mic,
    0
  );

  const toggleFpNote = (noteId: NoteId) => {
    setFpNotes((prev) => {
      if (prev.includes(noteId)) {
        return prev.length > 1 ? prev.filter((n) => n !== noteId) : prev;
      }
      return [...prev, noteId];
    });
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
      {/* Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-white/95 px-5 py-3.5 rounded-3xl shadow-md border-3 border-purple-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-sm">
            🦄
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              Maestro Unicorn
            </h1>
            <p className="text-xs font-bold text-slate-500">
              Piano Note Reading Adventure
            </p>
          </div>
        </div>

        {/* Stats & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-yellow-100 border-2 border-yellow-300 text-yellow-900 px-3.5 py-1.5 rounded-2xl font-black text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            {totalStars} Stars
          </div>

          <div className="flex items-center gap-1.5 bg-fuchsia-100 border-2 border-fuchsia-300 text-fuchsia-900 px-3.5 py-1.5 rounded-2xl font-black text-sm">
            <Sparkles className="w-4 h-4 text-fuchsia-600" />
            {playerState.points} Sparkles
          </div>

          <button
            type="button"
            onClick={() => setShowFreePractice((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs sm:text-sm shadow-xs cursor-pointer transition"
          >
            <Music2 className="w-4 h-4" />
            {showFreePractice ? 'Adventure Map' : 'Free Practice'}
          </button>

          <button
            type="button"
            onClick={onOpenBoutique}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-xs cursor-pointer transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Unicorn Boutique
          </button>

          <button
            type="button"
            onClick={onOpenParentSettings}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            title="Parent Settings & Sync Code"
            aria-label="Parent Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mascot Welcome Banner */}
      <MaestroUnicorn
        compact
        mood="happy"
        equipped={playerState.equippedAccessories}
        speechBubble={
          showFreePractice
            ? 'Welcome to Free Practice Arcade! Pick any notes and clef you want to practice today!'
            : `Welcome back! You have unlocked up to World ${playerState.unlockedWorld}. Pick any unlocked World below to learn, play, or replay!`
        }
      />

      {showFreePractice ? (
        /* Free Practice Customizer Panel */
        <div className="bg-white/95 rounded-3xl p-6 shadow-lg border-4 border-cyan-300 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                🎮 Free Practice Arcade
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Customize your own note pool, clef, and game mode!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFreePractice(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
            >
              Back to 8 Worlds
            </button>
          </div>

          {/* 1. Choose Staff Clef */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              1. Choose Clef
            </label>
            <div className="flex flex-wrap gap-2.5">
              {(
                [
                  { id: 'treble', label: '𝄞 Treble Clef', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] as NoteId[] },
                  { id: 'bass', label: '𝄢 Bass Clef', notes: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] as NoteId[] },
                  { id: 'grand', label: '🌟 Grand Staff (Both)', notes: ALL_NOTE_IDS },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFpClef(c.id);
                    setFpNotes(c.notes);
                  }}
                  className={`px-4 py-2.5 rounded-2xl font-black text-sm border-2 cursor-pointer transition ${
                    fpClef === c.id
                      ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Toggle Specific Notes */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              2. Pick Notes to Practice ({fpNotes.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_NOTE_IDS.map((nId) => {
                const n = NOTES[nId];
                const active = fpNotes.includes(nId);
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
                    className="px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm border-2 cursor-pointer transition hover:scale-105"
                  >
                    {formatNoteLabel(n.letter, playerState.namingConvention)} ({nId})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Choose Game Mode & Launch */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <div className="flex gap-2">
              {(
                [
                  { id: 'piano', label: '🎹 Magic Piano' },
                  { id: 'bubbles', label: '🏷️ Note Bubbles' },
                  { id: 'mic', label: '🎤 Real Piano Mic' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFpMode(m.id)}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-sm cursor-pointer ${
                    fpMode === m.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  {m.label}
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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-base shadow-lg hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              Start Free Practice!
            </button>
          </div>
        </div>
      ) : (
        /* 8-World Adventure Map + Selected World Launcher */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 7 Cols: 8 World Stepping Stones */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
            {WORLDS.map((world) => {
              const isUnlocked = world.id <= playerState.unlockedWorld;
              const isSelected = world.id === selectedWorld.id;
              const prog = playerState.worldStars[world.id] || {
                lessonDone: false,
                piano: 0,
                bubbles: 0,
                mic: 0,
                bossCleared: false,
                speedBadge: false,
              };
              const worldStarSum = prog.piano + prog.bubbles + prog.mic;

              return (
                <button
                  key={world.id}
                  type="button"
                  onClick={() => setSelectedWorldId(world.id)}
                  className={`relative text-left p-4 rounded-3xl border-4 transition-all cursor-pointer flex flex-col justify-between min-h-32 ${
                    isSelected
                      ? 'bg-white border-purple-600 shadow-xl scale-[1.02]'
                      : isUnlocked
                      ? 'bg-white/90 border-purple-200 hover:border-purple-400 shadow-sm'
                      : 'bg-slate-100/80 border-slate-300 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl sm:text-3xl">
                      {isUnlocked ? world.emoji : '🔒'}
                    </span>

                    {isUnlocked ? (
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-black">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {worldStarSum}/9
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-bold">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600">
                      World {world.id} • {world.clef === 'grand' ? 'Grand Staff' : `${world.clef} Clef`}
                    </div>
                    <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight">
                      {world.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {world.subtitle}
                    </p>
                  </div>

                  {prog.bossCleared && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full self-start">
                      <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                      Concert Cleared • Replay Anytime!
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right 5 Cols: Selected World Mission Control Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-purple-300 flex flex-col gap-4">
            <div
              className={`rounded-2xl p-4 text-white bg-gradient-to-r ${selectedWorld.themeGradient} shadow-inner`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                  World {selectedWorld.id} of 8
                </span>
                {selectedProgress.speedBadge && (
                  <span className="text-xs font-black bg-yellow-300 text-slate-900 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Dash Champion
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black mt-2 flex items-center gap-2">
                <span>{selectedWorld.emoji}</span>
                <span>{selectedWorld.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-white/95 font-medium mt-1">
                {selectedWorld.description}
              </p>

              {/* Notes in this World */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedWorld.notePool.map((nId) => (
                  <span
                    key={nId}
                    className="px-2.5 py-0.5 rounded-lg bg-white/25 text-white font-black text-xs"
                  >
                    {formatNoteLabel(NOTES[nId].letter, playerState.namingConvention as NamingConvention)} ({nId})
                  </span>
                ))}
              </div>
            </div>

            {!isSelectedUnlocked ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center flex flex-col items-center gap-2">
                <Lock className="w-10 h-10 text-slate-400" />
                <h4 className="font-black text-slate-700 text-base">
                  World {selectedWorld.id} is Locked!
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Clear the Boss Melody Concert in <strong>World {selectedWorld.id - 1}</strong> first to unlock this world! (Once unlocked, you can replay it as much as you want!)
                </p>
              </div>
            ) : (
              <>
                {/* Step 1: Story Lesson */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase text-purple-600">
                      Step 1 • Learn the Secret
                    </span>
                    <h4 className="font-black text-slate-800 text-sm sm:text-base">
                      Interactive Story Lesson
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartLesson(selectedWorld)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                  >
                    <BookOpen className="w-4 h-4" />
                    {selectedProgress.lessonDone ? 'Replay Lesson' : 'Start Lesson'}
                  </button>
                </div>

                {/* Step 2: The 3 Game Modes (Unlimited Replay!) */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Step 2 • Play & Replay Any Game Mode
                  </span>

                  {(
                    [
                      {
                        mode: 'piano' as const,
                        title: 'Mode 1: Magic Piano',
                        desc: 'Tap the 2-octave keyboard keys',
                        icon: Piano,
                        stars: selectedProgress.piano,
                      },
                      {
                        mode: 'bubbles' as const,
                        title: 'Mode 2: Rainbow Bubbles',
                        desc: 'Fast note name buttons',
                        icon: Sparkles,
                        stars: selectedProgress.bubbles,
                      },
                      {
                        mode: 'mic' as const,
                        title: 'Mode 3: Real Piano Listen',
                        desc: 'Play on your real piano with the mic!',
                        icon: Mic,
                        stars: selectedProgress.mic,
                      },
                    ]
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.mode}
                        className="flex items-center justify-between gap-3 bg-white border-2 border-slate-200 hover:border-purple-300 rounded-2xl p-3 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-black text-slate-800 text-sm">
                              {item.title}
                            </h5>
                            <div className="flex items-center gap-1 mt-0.5">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= item.stars
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-slate-200 fill-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="text-[11px] font-semibold text-slate-500 ml-1">
                                {item.desc}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onStartGame(selectedWorld, item.mode)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:brightness-110 text-white font-black text-xs sm:text-sm cursor-pointer shrink-0 shadow-xs"
                        >
                          {item.stars > 0 ? 'Replay' : 'Play'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Step 3: Boss Melody Concert */}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase text-amber-700">
                      Step 3 • World Finale Song
                    </span>
                    <h4 className="font-black text-slate-800 text-sm sm:text-base">
                      👑 {selectedWorld.bossMelody.title}
                    </h4>
                    <p className="text-xs font-semibold text-amber-800">
                      {maxModeStars > 0 || selectedProgress.bossCleared
                        ? 'Unlocked! Play the song to unlock the next World!'
                        : 'Earn at least 1 Star in any game mode above to unlock!'}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={maxModeStars === 0 && !selectedProgress.bossCleared}
                    onClick={() => onStartBoss(selectedWorld)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs sm:text-sm shadow-sm disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    {selectedProgress.bossCleared ? 'Replay Song' : 'Play Concert'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
