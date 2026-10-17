import React from 'react';
import { Volume2 } from 'lucide-react';
import { EquippedAccessories } from '../../store/useGameStore';

interface MaestroUnicornProps {
  mood?: 'happy' | 'excited' | 'encouraging' | 'listening';
  speechBubble?: string;
  onReplaySpeech?: () => void;
  equipped?: EquippedAccessories;
  compact?: boolean;
  micVolume?: number;
}

export const MaestroUnicorn: React.FC<MaestroUnicornProps> = ({
  mood = 'happy',
  speechBubble,
  onReplaySpeech,
  equipped = {},
  compact = false,
  micVolume = 0,
}) => {
  const hornGlowScale = mood === 'listening' ? 1 + micVolume * 0.8 : 1;

  return (
    <div className="flex items-center gap-3 sm:gap-4 w-full">
      {/* Animated Unicorn Avatar */}
      <div className={`relative shrink-0 ${compact ? 'w-20 h-20' : 'w-24 h-24 sm:w-28 sm:h-28'}`}>
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="uniBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="hornGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Circular backdrop */}
          <circle cx="80" cy="84" r="64" fill="url(#uniBg)" stroke="#ffffff" strokeWidth="4" />

          {/* Equipped Wings */}
          {equipped.wings === 'wings-pegasus' && (
            <g>
              <path
                d="M28 96 C6 76, 8 48, 36 62 C22 72, 22 86, 36 96 Z"
                fill="#e0f2fe"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <path
                d="M132 96 C154 76, 152 48, 124 62 C138 72, 138 86, 124 96 Z"
                fill="#e0f2fe"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
            </g>
          )}
          {equipped.wings === 'wings-fairy' && (
            <g>
              <ellipse cx="26" cy="78" rx="18" ry="26" transform="rotate(-25 26 78)" fill="#f472b6" opacity="0.85" stroke="#fff" strokeWidth="2" />
              <ellipse cx="134" cy="78" rx="18" ry="26" transform="rotate(25 134 78)" fill="#38bdf8" opacity="0.85" stroke="#fff" strokeWidth="2" />
            </g>
          )}

          {/* Rainbow Mane */}
          <path d="M44 64 C24 72, 24 98, 46 106" stroke="#f43f5e" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M46 78 C28 86, 28 112, 50 118" stroke="#eab308" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M52 92 C34 100, 34 124, 58 128" stroke="#38bdf8" strokeWidth="11" strokeLinecap="round" fill="none" />

          {/* Unicorn Neck & Head */}
          <path d="M62 114 L56 144 L102 144 L96 114 Z" fill="#ffffff" />
          <ellipse cx="84" cy="92" rx="34" ry="30" fill="#ffffff" />
          <ellipse cx="104" cy="100" rx="22" ry="18" fill="#fbcfe8" />

          {/* Ears */}
          <polygon points="62,68 52,44 76,60" fill="#ffffff" />
          <polygon points="63,65 56,49 72,60" fill="#f472b6" />

          {/* Magic Horn (pulses when listening to real piano!) */}
          <g transform={`translate(92, 42) scale(${hornGlowScale}) translate(-92, -42)`}>
            {mood === 'listening' && (
              <circle cx="96" cy="36" r={14 + micVolume * 18} fill="#fde047" opacity="0.45" />
            )}
            <polygon points="84,64 106,20 98,68" fill="url(#hornGold)" stroke="#d97706" strokeWidth="1.5" />
          </g>

          {/* Equipped Hat */}
          {equipped.hat === 'hat-conductor' && (
            <g transform="translate(52, 32)">
              <ellipse cx="26" cy="22" rx="24" ry="7" fill="#1e1b4b" />
              <path d="M8 22 L12 6 L40 6 L44 22 Z" fill="#6d28d9" stroke="#fde047" strokeWidth="2" />
            </g>
          )}
          {equipped.hat === 'hat-crown' && (
            <polygon
              points="60,56 64,34 74,46 84,30 94,46 102,34 104,56"
              fill="#fde047"
              stroke="#ca8a04"
              strokeWidth="2"
            />
          )}
          {equipped.hat === 'hat-wizard' && (
            <g>
              <ellipse cx="78" cy="56" rx="28" ry="6" fill="#4338ca" />
              <polygon points="58,56 80,14 98,56" fill="#4f46e5" stroke="#fde047" strokeWidth="1.5" />
            </g>
          )}

          {/* Expressive Eyes */}
          {mood === 'excited' ? (
            <path d="M84 84 Q90 76 96 84" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          ) : (
            <g>
              <circle cx="90" cy="84" r="6" fill="#1e1b4b" />
              <circle cx="92" cy="82" r="2.2" fill="#ffffff" />
            </g>
          )}

          {/* Equipped Glasses */}
          {equipped.glasses === 'glasses-star' && (
            <circle cx="90" cy="84" r="11" fill="none" stroke="#ec4899" strokeWidth="3" strokeDasharray="4 2" />
          )}
          {equipped.glasses === 'glasses-rainbow' && (
            <rect x="78" y="76" width="24" height="14" rx="5" fill="#38bdf8" opacity="0.75" stroke="#1e1b4b" strokeWidth="2" />
          )}

          {/* Rosy Cheek & Smile */}
          <ellipse cx="84" cy="96" rx="7" ry="4" fill="#fb7185" opacity="0.65" />
          <path
            d={mood === 'encouraging' ? 'M96 106 Q104 112 112 106' : 'M94 104 Q104 115 114 103'}
            stroke="#1e1b4b"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Equipped Neck Accessory */}
          {equipped.neck === 'neck-bowtie' && (
            <g transform="translate(68, 120)">
              <polygon points="0,0 14,8 0,16" fill="#f43f5e" />
              <polygon points="28,0 14,8 28,16" fill="#f43f5e" />
              <circle cx="14" cy="8" r="4" fill="#fde047" />
            </g>
          )}
          {equipped.neck === 'neck-medal' && (
            <g transform="translate(74, 122)">
              <circle cx="8" cy="10" r="9" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
              <text x="8" y="14" fontSize="10" textAnchor="middle" fill="#854d0e" fontWeight="bold">
                ★
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Speech Bubble with Replay Voice Button */}
      {speechBubble && (
        <div className="relative flex-1 bg-white/95 border-3 border-purple-300 rounded-2xl p-3 sm:p-4 shadow-md">
          <div className="flex items-start justify-between gap-2">
            <p className="text-slate-800 font-semibold text-sm sm:text-base leading-snug">
              {speechBubble}
            </p>
            {onReplaySpeech && (
              <button
                type="button"
                onClick={onReplaySpeech}
                className="shrink-0 p-2 rounded-xl bg-purple-100 hover:bg-purple-200 active:scale-95 text-purple-700 transition"
                title="Listen again"
                aria-label="Read aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
