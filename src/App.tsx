import React, { useEffect, useState } from 'react';
import { WorldDefinition } from './data/curriculum';
import { FreePracticeConfig, GameMode, useGameStore } from './store/useGameStore';
import { HomeHubView } from './views/HomeHubView';
import { WorldMapView } from './views/WorldMapView';
import { LessonView } from './views/LessonView';
import { GameSessionView } from './views/GameSessionView';
import { BossConcertView } from './views/BossConcertView';
import { ArcadeView } from './views/ArcadeView';
import { BoutiqueModal } from './components/modals/BoutiqueModal';
import { ParentSettingsModal } from './components/modals/ParentSettingsModal';
import { audioEngine } from './engine/audio';
import { speechNarrator } from './engine/speech';
import { isFireTablet } from './engine/platform';

type ActiveScreen =
  | { type: 'home' }
  | { type: 'map'; freePractice?: boolean }
  | { type: 'lesson'; world: WorldDefinition }
  | { type: 'game'; world: WorldDefinition; mode: GameMode }
  | { type: 'free-practice'; config: FreePracticeConfig }
  | { type: 'arcade' }
  | { type: 'boss'; world: WorldDefinition };

export const App: React.FC = () => {
  const {
    state,
    completeLesson,
    recordGameResult,
    completeBossConcert,
    recordArcadeRun,
    resetArcadeLeaderboard,
    buyOrEquipAccessory,
    buySticker,
    updateSettings,
    unlockAllWorlds,
    resetProgress,
    getSyncCode,
    applySyncCode,
  } = useGameStore();

  const [screen, setScreen] = useState<ActiveScreen>({ type: 'home' });
  const [showBoutique, setShowBoutique] = useState(false);
  const [showParentSettings, setShowParentSettings] = useState(false);

  // Sync audio/voice settings with engines
  useEffect(() => {
    audioEngine.setMuted(!state.soundEnabled);
    speechNarrator.setEnabled(state.voiceEnabled);
  }, [state.soundEnabled, state.voiceEnabled]);

  // Conditional Fire Tablet check: visual design is 100% identical across Chrome on MacBook, Chromebook, and Fire Tablet,
  // with extra outer bumper-case padding applied ONLY if running on an Amazon Fire Tablet.
  const fireDevice = isFireTablet();

  return (
    <div
      onClick={() => audioEngine.unlock()}
      className={`min-h-dvh w-full bg-gradient-to-br from-fuchsia-50 via-purple-50 to-indigo-100 flex flex-col justify-center ${
        fireDevice ? 'p-3.5 sm:p-5' : 'p-2.5 sm:p-4'
      }`}
    >
      <main className="flex-1 flex flex-col justify-center">
        {screen.type === 'home' && (
          <HomeHubView
            playerState={state}
            onOpenAdventure={() => setScreen({ type: 'map', freePractice: false })}
            onOpenArcade={() => setScreen({ type: 'arcade' })}
            onOpenBoutique={() => setShowBoutique(true)}
            onOpenFreePractice={() => setScreen({ type: 'map', freePractice: true })}
            onOpenParentSettings={() => setShowParentSettings(true)}
          />
        )}

        {screen.type === 'map' && (
          <WorldMapView
            key={screen.freePractice ? 'fp' : 'worlds'}
            playerState={state}
            initialShowFreePractice={Boolean(screen.freePractice)}
            onStartLesson={(world) => setScreen({ type: 'lesson', world })}
            onStartGame={(world, mode) => setScreen({ type: 'game', world, mode })}
            onStartBoss={(world) => setScreen({ type: 'boss', world })}
            onStartFreePractice={(config) => setScreen({ type: 'free-practice', config })}
            onOpenBoutique={() => setShowBoutique(true)}
            onBackHome={() => setScreen({ type: 'home' })}
          />
        )}

        {screen.type === 'lesson' && (
          <LessonView
            world={screen.world}
            namingConvention={state.namingConvention}
            equipped={state.equippedAccessories}
            onFinishLesson={() => {
              completeLesson(screen.world.id);
              setScreen({ type: 'game', world: screen.world, mode: 'piano' });
            }}
            onBack={() => setScreen({ type: 'map', freePractice: false })}
          />
        )}

        {screen.type === 'game' && (
          <GameSessionView
            title={`World ${screen.world.id}: ${screen.world.title}`}
            worldId={screen.world.id}
            clefMode={screen.world.clef}
            notePool={screen.world.notePool}
            initialMode={screen.mode}
            currentModeStars={state.worldStars[screen.world.id]?.[screen.mode] || 0}
            canSpeedChallenge={(state.worldStars[screen.world.id]?.[screen.mode] || 0) >= 3}
            colorMode={state.colorMode}
            namingConvention={state.namingConvention}
            micSensitivity={state.micSensitivity}
            equipped={state.equippedAccessories}
            trickyNotesCount={state.trickyNotesCount}
            onCompleteRound={(mode, stars, points, missedNotes, wasSpeed) => {
              recordGameResult(screen.world.id, mode, stars, points, missedNotes, wasSpeed);
            }}
            onStartBossConcert={() => setScreen({ type: 'boss', world: screen.world })}
            onBack={() => setScreen({ type: 'map', freePractice: false })}
          />
        )}

        {screen.type === 'free-practice' && (
          <GameSessionView
            title="Free Practice"
            clefMode={screen.config.clef}
            notePool={screen.config.selectedNotes}
            initialMode={screen.config.mode}
            currentModeStars={0}
            canSpeedChallenge={true}
            colorMode={state.colorMode}
            namingConvention={state.namingConvention}
            micSensitivity={state.micSensitivity}
            equipped={state.equippedAccessories}
            trickyNotesCount={state.trickyNotesCount}
            onCompleteRound={(mode, stars, points, missedNotes, wasSpeed) => {
              recordGameResult(1, mode, Math.min(1, stars), points, missedNotes, wasSpeed);
            }}
            onBack={() => setScreen({ type: 'map', freePractice: true })}
          />
        )}

        {screen.type === 'arcade' && (
          <ArcadeView
            playerState={state}
            onSaveArcadeRun={recordArcadeRun}
            onOpenParentSettings={() => setShowParentSettings(true)}
            onBack={() => setScreen({ type: 'home' })}
          />
        )}

        {screen.type === 'boss' && (
          <BossConcertView
            world={screen.world}
            namingConvention={state.namingConvention}
            equipped={state.equippedAccessories}
            onConcertComplete={(points) => {
              completeBossConcert(screen.world.id, points);
            }}
            onBack={() => setScreen({ type: 'map', freePractice: false })}
          />
        )}
      </main>

      {showBoutique && (
        <BoutiqueModal
          playerState={state}
          onBuyOrEquipAccessory={buyOrEquipAccessory}
          onBuySticker={buySticker}
          onClose={() => setShowBoutique(false)}
        />
      )}

      {showParentSettings && (
        <ParentSettingsModal
          playerState={state}
          onUpdateSettings={updateSettings}
          onUnlockAllWorlds={unlockAllWorlds}
          onResetArcadeLeaderboard={resetArcadeLeaderboard}
          onResetProgress={resetProgress}
          getSyncCode={getSyncCode}
          onApplySyncCode={applySyncCode}
          onClose={() => setShowParentSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
