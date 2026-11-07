import React from 'react';
import { Music2, Play, Settings, Sparkles, Star, Trophy } from 'lucide-react';
import { WORLDS } from '../data/curriculum';
import { STICKERS, UNICORN_ACCESSORIES } from '../data/rewards';
import { PlayerState } from '../store/useGameStore';
import { MaestroUnicorn } from '../components/mascot/MaestroUnicorn';
import { speechNarrator } from '../engine/speech';

interface HomeHubViewProps {
  playerState: PlayerState;
  onOpenAdventure: () => void;
  onOpenArcade: () => void;
  onOpenBoutique: () => void;
  onOpenFreePractice: () => void;
  onOpenParentSettings: () => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  playerState,
  onOpenAdventure,
  onOpenArcade,
  onOpenBoutique,
  onOpenFreePractice,
  onOpenParentSettings,
}) => {
  const totalStars = Object.values(playerState.worldStars).reduce(
    (acc, w) => acc + w.piano + w.bubbles + w.mic,
    0
  );

  const activeWorld =
    WORLDS.find((w) => w.id === playerState.unlockedWorld) || WORLDS[0];

  const bestArcadeEntry = playerState.arcadeLeaderboard[0];

  const canAffordNewReward =
    UNICORN_ACCESSORIES.some(
      (item) =>
        !playerState.unlockedAccessories.includes(item.id) &&
        playerState.points >= item.costPoints
    ) ||
    STICKERS.some(
      (st) =>
        !playerState.unlockedStickers.includes(st.id) &&
        playerState.points >= st.costPoints
    );

  const totalCollected =
    playerState.unlockedAccessories.length + playerState.unlockedStickers.length;

  const welcomeText = 'Pick a door to play!';

  return (
    <div className="flex flex-col justify-between gap-4 sm:gap-6 max-w-5xl mx-auto w-full py-1">
      {/* Clean Top Bar: Logo + Stars + Sparkles + Subtle Parent Gear */}
      <header className="flex items-center justify-between gap-3 bg-white/95 px-4 sm:px-6 py-3 rounded-3xl shadow-md border-3 border-purple-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-sm">
            🦄
          </div>
          <h1 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            Maestro
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex items-center gap-1.5 bg-yellow-100 border-2 border-yellow-300 text-yellow-900 px-3.5 py-1.5 rounded-2xl font-black text-sm sm:text-base"
            title="Total Stars"
          >
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span>{totalStars}</span>
          </div>

          <div
            className="flex items-center gap-1.5 bg-fuchsia-100 border-2 border-fuchsia-300 text-fuchsia-900 px-3.5 py-1.5 rounded-2xl font-black text-sm sm:text-base"
            title="Sparkle Points"
          >
            <Sparkles className="w-5 h-5 text-fuchsia-600" />
            <span>{playerState.points}</span>
          </div>

          <button
            type="button"
            onClick={onOpenParentSettings}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer transition"
            title="Parent Settings & Sync Code"
            aria-label="Parent Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Friendly Unicorn Greeter (Short 5-word prompt, speaks ONLY when 🔊 tapped!) */}
      <MaestroUnicorn
        compact
        mood="happy"
        equipped={playerState.equippedAccessories}
        speechBubble={welcomeText}
        onReplaySpeech={() => speechNarrator.speak(welcomeText)}
      />

      {/* THE 3 BIG DOORS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Door 1: Adventure Worlds */}
        <button
          type="button"
          onClick={onOpenAdventure}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-xl border-4 border-white/80 hover:scale-[1.03] active:scale-98 transition-all cursor-pointer flex flex-col items-center justify-between text-center min-h-56 sm:min-h-64"
        >
          <span className="px-3 py-1 rounded-full bg-white/25 text-xs sm:text-sm font-black tracking-wide">
            World {activeWorld.id} • {activeWorld.emoji} {activeWorld.title}
          </span>

          <div className="my-2 text-6xl sm:text-7xl drop-shadow-md group-hover:scale-110 transition-transform">
            🗺️
          </div>

          <div className="w-full flex flex-col items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Adventure
            </h2>
            <div className="w-full py-2.5 rounded-2xl bg-white text-purple-700 font-black text-base sm:text-lg shadow-md flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-purple-700" />
              Play
            </div>
          </div>
        </button>

        {/* Door 2: Endless Arcade */}
        <button
          type="button"
          onClick={onOpenArcade}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl border-4 border-white/80 hover:scale-[1.03] active:scale-98 transition-all cursor-pointer flex flex-col items-center justify-between text-center min-h-56 sm:min-h-64"
        >
          <span className="px-3 py-1 rounded-full bg-white/25 text-xs sm:text-sm font-black tracking-wide flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-200" />
            Top: {bestArcadeEntry ? bestArcadeEntry.score.toLocaleString() : 0}
          </span>

          <div className="my-2 text-6xl sm:text-7xl drop-shadow-md group-hover:scale-110 transition-transform">
            🕹️
          </div>

          <div className="w-full flex flex-col items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Arcade
            </h2>
            <div className="w-full py-2.5 rounded-2xl bg-white text-orange-600 font-black text-base sm:text-lg shadow-md flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-orange-600" />
              Play
            </div>
          </div>
        </button>

        {/* Door 3: Dress Up Boutique */}
        <button
          type="button"
          onClick={onOpenBoutique}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl border-4 border-white/80 hover:scale-[1.03] active:scale-98 transition-all cursor-pointer flex flex-col items-center justify-between text-center min-h-56 sm:min-h-64"
        >
          {canAffordNewReward ? (
            <span className="px-3 py-1 rounded-full bg-yellow-300 text-slate-900 text-xs sm:text-sm font-black animate-bounce shadow-xs">
              ✨ New Gift Ready!
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-white/25 text-xs sm:text-sm font-black tracking-wide">
              🎁 {totalCollected} Unlocked
            </span>
          )}

          <div className="my-2 text-6xl sm:text-7xl drop-shadow-md group-hover:scale-110 transition-transform">
            👑
          </div>

          <div className="w-full flex flex-col items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dress Up
            </h2>
            <div className="w-full py-2.5 rounded-2xl bg-white text-pink-600 font-black text-base sm:text-lg shadow-md flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              Open
            </div>
          </div>
        </button>
      </div>

      {/* Calm Secondary Bar: Untimed Free Practice */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onOpenFreePractice}
          className="px-6 py-3 rounded-2xl bg-white/90 hover:bg-white border-3 border-cyan-300 text-cyan-800 font-black text-sm sm:text-base shadow-sm hover:scale-105 transition flex items-center gap-2.5 cursor-pointer"
        >
          <Music2 className="w-5 h-5 text-cyan-600" />
          <span>🎵 Free Practice (No Timer)</span>
        </button>
      </div>
    </div>
  );
};
