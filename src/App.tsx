import React, { useEffect, useState } from 'react';
import { WorldDefinition } from './data/curriculum';
import { FreePracticeConfig, GameMode, useGameStore } from './store/useGameStore';
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
  | { type: 'map' }
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

  const [screen, setScreen] = useState<ActiveScreen>({ type: 'map' });
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
      className={`min-h-screen w-full bg-gradient-to-br from-fuchsia-50 via-purple-50 to-indigo-100 flex flex-col justify-between ${
        fireDevice ? 'p-5 sm:p-7' : 'p-3 sm:p-5'
      }`}
    >
      <main className="flex-1 flex flex-col justify-center">
        {screen.type === 'map' && (
          <WorldMapView
            playerState={state}
            onStartLesson={(world) => setScreen({ type: 'lesson', world })}
            onStartGame={(world, mode) => setScreen({ type: 'game', world, mode })}
            onStartBoss={(world) => setScreen({ type: 'boss', world })}
            onStartFreePractice={(config) => setScreen({ type: 'free-practice', config })}
            onOpenArcade={() => setScreen({ type: 'arcade' })}
            onOpenBoutique={() => setShowBoutique(true)}
            onOpenParentSettings={() => setShowParentSettings(true)}
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
            onBack={() => setScreen({ type: 'map' })}
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
            onBack={() => setScreen({ type: 'map' })}
          />
        )}

        {screen.type === 'free-practice' && (
          <GameSessionView
            title="Relaxed Free Practice"
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
            onBack={() => setScreen({ type: 'map' })}
          />
        )}

        {screen.type === 'arcade' && (
          <ArcadeView
            playerState={state}
            onSaveArcadeRun={recordArcadeRun}
            onBack={() => setScreen({ type: 'map' })}
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
            onBack={() => setScreen({ type: 'map' })}
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
