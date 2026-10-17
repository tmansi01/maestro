import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import {
  NamingConvention,
  NOTES,
  NoteId,
  formatNoteDisplayName,
} from '../../data/notes';
import { MicrophonePitchListener, PitchDetectionResult } from '../../engine/pitchDetection';

interface MicListenerProps {
  targetNote: NoteId;
  onNoteMatched: (noteId: NoteId) => void;
  namingConvention: NamingConvention;
  sensitivity: number;
  onVolumeChange?: (volume: number) => void;
  onSwitchModeFallback?: () => void;
}

/**
 * Mode 3: Real Piano Microphone Pitch Detector!
 * Listens via Web Audio API and matches the played note on her acoustic/digital piano.
 */
export const MicListener: React.FC<MicListenerProps> = ({
  targetNote,
  onNoteMatched,
  namingConvention,
  sensitivity,
  onVolumeChange,
  onSwitchModeFallback,
}) => {
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState(false);
  const [detected, setDetected] = useState<PitchDetectionResult | null>(null);
  const [volume, setVolume] = useState(0);

  const listenerRef = useRef<MicrophonePitchListener | null>(null);
  const holdCountRef = useRef<{ noteId: NoteId | null; count: number }>({ noteId: null, count: 0 });
  const matchedCooldownRef = useRef<boolean>(false);

  useEffect(() => {
    matchedCooldownRef.current = false;
    holdCountRef.current = { noteId: null, count: 0 };
  }, [targetNote]);

  useEffect(() => {
    const listener = new MicrophonePitchListener();
    listener.setSensitivity(sensitivity);
    listenerRef.current = listener;

    listener
      .start((res, vol) => {
        setVolume(vol);
        onVolumeChange?.(vol);
        setDetected(res);

        if (res && !matchedCooldownRef.current) {
          const targetDef = NOTES[targetNote];
          // Accept either exact NoteId match OR same note letter if harmonic overtone is strong
          const isMatch =
            res.note.id === targetNote || res.note.letter === targetDef.letter;

          if (isMatch) {
            if (holdCountRef.current.noteId === targetNote) {
              holdCountRef.current.count += 1;
            } else {
              holdCountRef.current = { noteId: targetNote, count: 1 };
            }

            // Require 3 consecutive frames (~50ms) of stable pitch so random clicks don't trigger
            if (holdCountRef.current.count >= 3) {
              matchedCooldownRef.current = true;
              onNoteMatched(targetNote);
            }
          }
        }
      })
      .then((ok) => {
        setMicActive(ok);
        setMicError(!ok);
      });

    return () => {
      listener.stop();
    };
  }, [targetNote, sensitivity, onNoteMatched, onVolumeChange]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/95 border-3 border-purple-300 rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
            micActive
              ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md'
              : 'bg-rose-100 text-rose-600'
          }`}
        >
          {micActive ? <Mic className="w-8 h-8 animate-pulse" /> : <MicOff className="w-8 h-8" />}
        </div>

        <div>
          <h4 className="font-extrabold text-slate-800 text-base sm:text-lg flex items-center gap-2">
            {micActive
              ? 'Play this note on your real piano!'
              : 'Microphone permission needed'}
          </h4>
          {micActive ? (
            <div className="flex items-center gap-3 mt-1">
              {/* Soundwave Meter */}
              <div className="w-36 h-3 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-fuchsia-500 to-purple-600 transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.round(volume * 100))}%` }}
                />
              </div>
              <span className="text-xs font-bold text-purple-700">
                {detected
                  ? `Heard: ${formatNoteDisplayName(detected.note.id, namingConvention)}`
                  : 'Listening...'}
              </span>
            </div>
          ) : (
            <p className="text-xs text-rose-600 font-medium">
              Allow microphone access in your browser, or tap the button on the right to use the on-screen piano!
            </p>
          )}
        </div>
      </div>

      {/* Helpful Demo / Test Button (for testing on MacBook without a piano nearby or noisy room fallback) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNoteMatched(targetNote)}
          className="px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
          title="Simulate playing the note on your piano"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Simulate Piano Note
        </button>

        {micError && onSwitchModeFallback && (
          <button
            type="button"
            onClick={onSwitchModeFallback}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs sm:text-sm"
          >
            Switch to Touch Piano
          </button>
        )}
      </div>
    </div>
  );
};
