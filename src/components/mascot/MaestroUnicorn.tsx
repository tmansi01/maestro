import React from 'react';
import { Volume2 } from 'lucide-react';
import { EquippedAccessories } from '../../store/useGameStore';

interface MaestroUnicornProps {
  mood?: 'happy' | 'excited' | 'encouraging' | 'listening';
  speechBubble?: string;
  onReplaySpeech?: () => void;
  equipped?: EquippedAccessories;
  compact?: boolean;
  /**
   * When true on landscape/desktop screens (`md+`), renders Maestro Unicorn + Speech Bubble
   * as a compact vertical side-card beside the Music Staff so the entire game fits without scrolling!
   */
  sideDock?: boolean;
  micVolume?: number;
}

export const MaestroUnicorn: React.FC<MaestroUnicornProps> = ({
  mood = 'happy',
  speechBubble,
  onReplaySpeech,
  equipped = {},
  compact = false,
  sideDock = false,
  micVolume = 0,
}) => {
  const hornGlowScale = mood === 'listening' ? 1 + micVolume * 0.8 : 1;

  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 ${
        sideDock
          ? 'w-full md:w-56 lg:w-64 md:flex-col md:justify-center md:bg-white/90 md:p-3 md:rounded-3xl md:border-3 md:border-purple-200 md:shadow-sm shrink-0'
          : 'w-full'
      }`}
    >
      {/* Animated Unicorn Avatar */}
      <div
        className={`relative shrink-0 ${
          sideDock
            ? 'w-16 h-16 md:w-24 md:h-24'
            : compact
            ? 'w-16 h-16 sm:w-20 sm:h-20'
            : 'w-20 h-20 sm:w-24 sm:h-24'
        }`}
      >
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
          {equipped.wings === 'wings-galaxy' && (
            <g>
              <path
                d="M26 102 C2 78, 4 40, 38 56 C24 68, 22 86, 38 100 Z"
                fill="#312e81"
                stroke="#f0abfc"
                strokeWidth="2.5"
              />
              <circle cx="20" cy="68" r="2.5" fill="#fef08a" />
              <circle cx="25" cy="82" r="2" fill="#38bdf8" />
              <path
                d="M134 102 C158 78, 156 40, 122 56 C136 68, 138 86, 122 100 Z"
                fill="#312e81"
                stroke="#f0abfc"
                strokeWidth="2.5"
              />
              <circle cx="140" cy="68" r="2.5" fill="#fef08a" />
              <circle cx="135" cy="82" r="2" fill="#38bdf8" />
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
          {equipped.hat === 'hat-lightning' && (
            <g>
              <polygon
                points="58,56 64,28 76,44 84,22 94,44 104,28 106,56"
                fill="#facc15"
                stroke="#ea580c"
                strokeWidth="2"
              />
              <polygon points="82,30 77,43 84,43 80,54 91,39 84,39" fill="#ffffff" />
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
          {equipped.glasses === 'glasses-arcade' && (
            <g>
              <rect x="74" y="76" width="34" height="13" rx="3" fill="#06b6d4" opacity="0.85" stroke="#f43f5e" strokeWidth="2.5" />
              <line x1="78" y1="80" x2="104" y2="80" stroke="#fef08a" strokeWidth="2" />
            </g>
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
          {equipped.neck === 'neck-champion' && (
            <g transform="translate(58, 118)">
              <path d="M2 4 Q22 18 42 4 L46 18 Q22 28 0 18 Z" fill="#f59e0b" stroke="#fef08a" strokeWidth="2" />
              <circle cx="22" cy="15" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </div>

      {/* Speech Bubble with Tap-to-Hear Voice Button */}
      {speechBubble && (
        <div
          className={`relative flex-1 bg-white/95 border-3 border-purple-300 rounded-2xl shadow-sm ${
            sideDock
              ? 'h-16 md:h-24 w-full px-3 py-2 flex items-center justify-between md:flex-col md:justify-center md:text-center overflow-hidden'
              : compact
              ? 'h-16 sm:h-20 px-3.5 py-1.5 flex items-center overflow-hidden'
              : 'p-3 sm:p-4'
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 w-full ${
              sideDock ? 'md:flex-col md:gap-1.5' : ''
            }`}
          >
            <p
              className={`text-slate-800 font-black leading-snug ${
                compact || sideDock
                  ? 'text-xs sm:text-sm line-clamp-2'
                  : 'text-sm sm:text-base'
              }`}
            >
              {speechBubble}
            </p>
            {onReplaySpeech && (
              <button
                type="button"
                onClick={onReplaySpeech}
                className="shrink-0 px-2.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 active:scale-95 text-purple-800 font-black text-xs flex items-center gap-1 cursor-pointer transition"
                title="Tap to hear Maestro read this!"
                aria-label="Read aloud"
              >
                <Volume2 className="w-4 h-4" />
                <span>🔊</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
