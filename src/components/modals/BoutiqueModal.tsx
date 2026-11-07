import React, { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { STICKERS, UNICORN_ACCESSORIES } from '../../data/rewards';
import { PlayerState } from '../../store/useGameStore';
import { MaestroUnicorn } from '../mascot/MaestroUnicorn';
import { audioEngine } from '../../engine/audio';

interface BoutiqueModalProps {
  playerState: PlayerState;
  onBuyOrEquipAccessory: (id: string, category: 'hat' | 'glasses' | 'neck' | 'wings', cost: number) => void;
  onBuySticker: (id: string, cost: number) => void;
  onClose: () => void;
}

export const BoutiqueModal: React.FC<BoutiqueModalProps> = ({
  playerState,
  onBuyOrEquipAccessory,
  onBuySticker,
  onClose,
}) => {
  const [tab, setTab] = useState<'outfits' | 'stickers'>('outfits');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border-4 border-pink-300 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-purple-900">
            👑 Dress Up & Stickers
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-fuchsia-100 text-fuchsia-900 px-3.5 py-1.5 rounded-2xl font-black text-sm">
              <Sparkles className="w-4 h-4 text-fuchsia-600" />
              {playerState.points}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Unicorn Preview */}
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 p-3 rounded-2xl border-2 border-purple-200">
          <MaestroUnicorn
            compact
            mood="excited"
            equipped={playerState.equippedAccessories}
            speechBubble="Try on my hats, glasses, and wings!"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('outfits')}
            className={`flex-1 py-2.5 rounded-2xl font-black text-sm cursor-pointer ${
              tab === 'outfits'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-800'
            }`}
          >
            🎩 Unicorn Dress-Up ({playerState.unlockedAccessories.length}/{UNICORN_ACCESSORIES.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('stickers')}
            className={`flex-1 py-2.5 rounded-2xl font-black text-sm cursor-pointer ${
              tab === 'stickers'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-pink-50 text-pink-800'
            }`}
          >
            🌟 Sticker Album ({playerState.unlockedStickers.length}/{STICKERS.length})
          </button>
        </div>

        {/* Items Grid */}
        {tab === 'outfits' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {UNICORN_ACCESSORIES.map((item) => {
              const owned = playerState.unlockedAccessories.includes(item.id);
              const equipped = playerState.equippedAccessories[item.category] === item.id;
              const canAfford = playerState.points >= item.costPoints;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center justify-between gap-2 ${
                    equipped
                      ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300'
                      : owned
                      ? 'bg-white border-emerald-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-4xl my-1">{item.emoji}</span>
                    <h4 className="font-black text-slate-800 text-xs sm:text-sm leading-tight">
                      {item.name}
                    </h4>
                  </div>

                  <button
                    type="button"
                    disabled={!owned && !canAfford}
                    onClick={() => {
                      audioEngine.playSuccessSparkle(2);
                      onBuyOrEquipAccessory(item.id, item.category, item.costPoints);
                    }}
                    className={`w-full py-2 rounded-xl font-black text-xs cursor-pointer transition ${
                      equipped
                        ? 'bg-purple-600 text-white'
                        : owned
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : canAfford
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {equipped
                      ? '✓ Wearing'
                      : owned
                      ? 'Wear'
                      : `${item.costPoints} ✨`}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STICKERS.map((st) => {
              const owned = playerState.unlockedStickers.includes(st.id);
              const canAfford = playerState.points >= st.costPoints;

              return (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center justify-between gap-2 ${
                    owned ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-4xl bg-white shadow-xs ${
                        !owned ? 'grayscale opacity-50' : ''
                      }`}
                    >
                      {st.emoji}
                    </div>
                    <h4 className="font-black text-slate-800 text-xs sm:text-sm mt-1.5 leading-tight">
                      {st.name}
                    </h4>
                  </div>

                  {owned ? (
                    <span className="w-full py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Yours!
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        audioEngine.playSuccessSparkle(3);
                        onBuySticker(st.id, st.costPoints);
                      }}
                      className="w-full py-2 rounded-xl bg-pink-600 text-white font-black text-xs disabled:opacity-40 cursor-pointer"
                    >
                      {st.costPoints} ✨
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
