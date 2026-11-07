import React, { useState } from 'react';
import { Check, Copy, Lock, ShieldCheck, Smartphone, Unlock, X } from 'lucide-react';
import { ColorMode, NamingConvention } from '../../data/notes';
import { PlayerState } from '../../store/useGameStore';
import { getPlatformLabel } from '../../engine/platform';

interface ParentSettingsModalProps {
  playerState: PlayerState;
  onUpdateSettings: (
    partial: Partial<
      Pick<
        PlayerState,
        | 'namingConvention'
        | 'colorMode'
        | 'soundEnabled'
        | 'voiceEnabled'
        | 'micSensitivity'
        | 'unlockedWorld'
      >
    >
  ) => void;
  onUnlockAllWorlds: () => void;
  onResetArcadeLeaderboard: () => void;
  onResetProgress: () => void;
  getSyncCode: () => string;
  onApplySyncCode: (code: string) => boolean;
  onClose: () => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  playerState,
  onUpdateSettings,
  onUnlockAllWorlds,
  onResetArcadeLeaderboard,
  onResetProgress,
  getSyncCode,
  onApplySyncCode,
  onClose,
}) => {
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');
  const [syncInput, setSyncInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const detectedPlatform = getPlatformLabel();
  const currentSyncCode = getSyncCode();

  const checkMathGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (mathAnswer.trim() === '42') {
      setGateUnlocked(true);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentSyncCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreCode = () => {
    const ok = onApplySyncCode(syncInput);
    setSyncStatus(
      ok
        ? '✅ Progress restored from Magic Unicorn Code!'
        : '❌ Invalid code. Make sure it starts with UNI-'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-4 border-purple-300 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-purple-600" />
            <div>
              <h2 className="text-xl font-black text-slate-800">
                Parent Settings & Device Sync
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Configure note naming, progressive colors, levels, and cross-device sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!gateUnlocked ? (
          <form onSubmit={checkMathGate} className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-200 text-center flex flex-col items-center gap-3">
            <Lock className="w-10 h-10 text-purple-600" />
            <h3 className="font-black text-slate-800 text-lg">Parent Gate</h3>
            <p className="text-sm text-slate-600 font-medium">
              Please solve this quick multiplication question to open Parent Settings:
            </p>
            <div className="text-2xl font-black text-purple-900">6 × 7 = ?</div>
            <div className="flex gap-2">
              <input
                type="number"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                placeholder="Answer"
                className="w-28 px-4 py-2 rounded-xl border-2 border-purple-300 text-center font-black text-lg bg-white"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-black cursor-pointer"
              >
                Unlock
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            {/* 1. Note Naming Convention */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Note Naming Convention
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'letters', label: 'English Letters (C, D, E...)' },
                    { id: 'solfege', label: 'Fixed-Do Solfège (Do, Re, Mi...)' },
                    { id: 'both', label: 'Both Together (C / Do)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ namingConvention: opt.id as NamingConvention })
                    }
                    className={`p-3 rounded-xl font-bold text-xs sm:text-sm border-2 cursor-pointer ${
                      playerState.namingConvention === opt.id
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Scaffolding Mode */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Note Color Scaffolding
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'progressive', label: 'Progressive (Colors ➔ Black & White)' },
                    { id: 'always', label: 'Always Rainbow Colors' },
                    { id: 'off', label: 'Classic Black & White Only' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateSettings({ colorMode: opt.id as ColorMode })}
                    className={`p-3 rounded-xl font-bold text-xs sm:text-sm border-2 cursor-pointer ${
                      playerState.colorMode === opt.id
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Audio, Voice & Unlock Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-700">Voiceover Narrator</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ voiceEnabled: !playerState.voiceEnabled })
                  }
                  className={`px-4 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                    playerState.voiceEnabled
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {playerState.voiceEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-700">Unlock Worlds</span>
                <button
                  type="button"
                  onClick={onUnlockAllWorlds}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Unlock All 8 Worlds
                </button>
              </div>
            </div>

            {/* 4. Cross-Device Magic Sync Code (Fire Tablet <-> Chromebook <-> MacBook) */}
            <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200 flex flex-col gap-3">
              <h4 className="font-black text-purple-900 text-sm flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                Transfer Progress Across Devices (Chromebook / Fire Tablet / MacBook)
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentSyncCode}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-purple-300 font-mono text-xs text-slate-700"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={syncInput}
                  onChange={(e) => setSyncInput(e.target.value)}
                  placeholder="Paste UNI-... code from another device"
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-purple-300 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleRestoreCode}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Restore Code
                </button>
              </div>
              {syncStatus && (
                <p className="text-xs font-bold text-purple-800">{syncStatus}</p>
              )}
            </div>

            {/* 5. Platform Installation Guide */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-extrabold text-slate-800">
                📲 How to Install on Her Devices (Detected: {detectedPlatform}):
              </div>
              <p>
                • <strong>Google Chromebook & MacBook Chrome:</strong> Click the <em>Install Maestro</em> icon in the right side of the Chrome address bar to pin Maestro as an offline app!
              </p>
              <p>
                • <strong>Amazon Fire Tablet (Silk Browser):</strong> Tap the Silk menu icon (⋮) ➔ <em>Add to Home Screen</em>. If she uses an <strong>Amazon Kids+</strong> profile, open <em>Parent Dashboard ➔ Settings ➔ Add Content ➔ Add Websites</em> and paste the app’s URL.
              </p>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onResetArcadeLeaderboard}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  Reset Arcade Leaderboard
                </button>
                <button
                  type="button"
                  onClick={onResetProgress}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Reset All Player Progress
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-black text-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
