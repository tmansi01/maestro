import React from 'react';
import { ClefType, NamingConvention, NOTES, NoteId, formatNoteLabel } from '../../data/notes';

interface GrandStaffSVGProps {
  clefMode: ClefType;
  /**
   * Primary note(s) to render on the staff.
   */
  activeNotes: NoteId[];
  /**
   * Which note is the main target (if multiple are shown in a lesson).
   */
  targetNote?: NoteId;
  /**
   * Whether noteheads should be colored with their Rainbow color or classic sheet-music black.
   */
  useColors: boolean;
  /**
   * Mistake level on the current note:
   * 0 = normal, 1 = show Landmark ghost note + stepping-stone arrows, 2 = show full note name badge inside/above notehead!
   */
  hintLevel?: 0 | 1 | 2;
  namingConvention: NamingConvention;
  showLabelsOnAll?: boolean;
  isMysteryNote?: boolean;
  onNoteClick?: (noteId: NoteId) => void;
}

/**
 * Computes exact SVG vertical coordinate `y` for a NoteId on either the Treble staff, Bass staff, or Grand staff.
 * Staff line spacing = 20px (so 1 diatonic step = 10px).
 */
export function getNoteStaffY(noteId: NoteId, clefMode: ClefType): { y: number; staff: 'treble' | 'bass' } {
  const note = NOTES[noteId];
  const step = note.diatonicStepFromC4; // C4 = 0, E4 = +2 (Treble bottom line), G4 = +4, A3 = -2 (Bass top line), F3 = -4

  if (clefMode === 'treble') {
    // Treble staff lines: Line 1 (bottom, E4, step +2) at y = 150
    // Line 5 (top, F5, step +10) at y = 70
    // Middle C (C4, step 0) at y = 170
    const y = 170 - step * 10;
    return { y, staff: 'treble' };
  }

  if (clefMode === 'bass') {
    // Bass staff lines: Line 5 (top, A3, step -2) at y = 90
    // Line 1 (bottom, G2, step -10) at y = 170
    // Middle C (C4, step 0) at y = 70
    const y = 70 - step * 10;
    return { y, staff: 'bass' };
  }

  // Grand Staff mode:
  // Treble staff: top line (step +10) at y = 50, bottom line (E4, step +2) at y = 130. Middle C (step 0) at y = 150.
  // Bass staff: top line (A3, step -2) at y = 190, bottom line (G2, step -10) at y = 270.
  if (note.primaryClef === 'treble' || noteId === 'C4') {
    const y = 150 - step * 10;
    return { y, staff: 'treble' };
  } else {
    // For Bass notes on Grand Staff, A3 (step -2) is at y = 190
    const y = 170 - step * 10;
    return { y, staff: 'bass' };
  }
}

export const GrandStaffSVG: React.FC<GrandStaffSVGProps> = ({
  clefMode,
  activeNotes,
  targetNote,
  useColors,
  hintLevel = 0,
  namingConvention,
  showLabelsOnAll = false,
  isMysteryNote = false,
  onNoteClick,
}) => {
  const isGrand = clefMode === 'grand';
  const svgHeight = isGrand ? 310 : 230;
  const svgWidth = 680;

  // Compute staff line Y positions
  // Single Clef: 5 lines at y = 70, 90, 110, 130, 150 (Treble) or y = 90, 110, 130, 150, 170 (Bass)
  const trebleLines = isGrand ? [50, 70, 90, 110, 130] : clefMode === 'treble' ? [70, 90, 110, 130, 150] : [];
  const bassLines = isGrand ? [190, 210, 230, 250, 270] : clefMode === 'bass' ? [90, 110, 130, 150, 170] : [];

  const mainNoteId = targetNote || activeNotes[0];
  const mainNote = mainNoteId ? NOTES[mainNoteId] : null;
  const landmarkId = mainNote ? mainNote.landmarkHint.nearestLandmark : null;

  // Determine X positions for active notes
  const getNoteX = (idx: number, total: number) => {
    if (total === 1) return 390;
    const startX = 230;
    const endX = 570;
    return startX + (idx * (endX - startX)) / Math.max(1, total - 1);
  };

  // Landmark line highlights (G4 line on treble, F3 line on bass)
  const trebleGLineY = isGrand ? 110 : 130; // 2nd line from bottom
  const bassFLineY = isGrand ? 210 : 110; // 2nd line from top (4th line)

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className={`w-full max-w-2xl h-auto ${
          isGrand ? 'max-h-52 sm:max-h-60' : 'max-h-44 sm:max-h-52'
        } bg-white/95 rounded-3xl shadow-inner border-4 border-purple-200 select-none`}
        role="img"
        aria-label="Musical Staff"
      >
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Subtle Landmark Guide Line Highlights */}
        {trebleLines.length > 0 && (
          <g>
            <line
              x1={70}
              y1={trebleGLineY}
              x2={630}
              y2={trebleGLineY}
              stroke="#06b6d4"
              strokeWidth={4}
              strokeDasharray="6 6"
              opacity={0.35}
            />
            <text x={636} y={trebleGLineY + 4} fontSize="12" fontWeight="bold" fill="#0891b2">
              G
            </text>
          </g>
        )}

        {bassLines.length > 0 && (
          <g>
            <line
              x1={70}
              y1={bassFLineY}
              x2={630}
              y2={bassFLineY}
              stroke="#22c55e"
              strokeWidth={4}
              strokeDasharray="6 6"
              opacity={0.35}
            />
            <text x={636} y={bassFLineY + 4} fontSize="12" fontWeight="bold" fill="#16a34a">
              F
            </text>
          </g>
        )}

        {/* Treble Staff Lines */}
        {trebleLines.map((y, i) => (
          <line
            key={`t-${i}`}
            x1={70}
            y1={y}
            x2={630}
            y2={y}
            stroke="#334155"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}

        {/* Bass Staff Lines */}
        {bassLines.map((y, i) => (
          <line
            key={`b-${i}`}
            x1={70}
            y1={y}
            x2={630}
            y2={y}
            stroke="#334155"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}

        {/* Left Barline & Grand Staff Brace */}
        {isGrand ? (
          <g>
            <line x1={70} y1={50} x2={70} y2={270} stroke="#1e293b" strokeWidth={4} />
            <line x1={630} y1={50} x2={630} y2={270} stroke="#1e293b" strokeWidth={4} />
            {/* Curly Grand Staff Brace */}
            <path
              d="M62 50 C42 50, 48 145, 32 160 C48 175, 42 270, 62 270"
              fill="none"
              stroke="#7c3aed"
              strokeWidth={4}
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g>
            <line
              x1={70}
              y1={trebleLines[0] || bassLines[0]}
              x2={70}
              y2={trebleLines[4] || bassLines[4]}
              stroke="#1e293b"
              strokeWidth={4}
            />
            <line
              x1={630}
              y1={trebleLines[0] || bassLines[0]}
              x2={630}
              y2={trebleLines[4] || bassLines[4]}
              stroke="#1e293b"
              strokeWidth={4}
            />
          </g>
        )}

        {/* Crisp Custom Vector Treble Clef (with G-line Swirl Highlight!) */}
        {trebleLines.length > 0 && (
          <g transform={`translate(90, ${trebleLines[0] - 24})`}>
            {/* Main Treble Clef stem and loops */}
            <path
              d="M32 118 C22 118, 16 110, 20 102 C24 96, 32 100, 32 108 L32 12 C32 2, 46 2, 46 16 C46 34, 12 52, 12 78 C12 98, 30 108, 46 100 C58 94, 60 76, 48 66 C36 58, 22 68, 26 82 C28 90, 38 92, 42 86"
              fill="none"
              stroke="#1e1b4b"
              strokeWidth={5.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glowing cyan target ring around the G4 swirl center */}
            <circle
              cx={38}
              cy={trebleGLineY - (trebleLines[0] - 24)}
              r={8}
              fill="#06b6d4"
              opacity={0.28}
            />
          </g>
        )}

        {/* Crisp Custom Vector Bass Clef (with Glowing Two Magic Dots around F3!) */}
        {bassLines.length > 0 && (
          <g transform={`translate(88, ${bassLines[0] - 6})`}>
            {/* Bass Clef curve */}
            <path
              d="M18 26 C18 16, 28 12, 34 18 C38 22, 34 30, 26 28 C20 26, 22 14, 34 10 C50 6, 58 22, 54 42 C50 60, 32 76, 14 84"
              fill="none"
              stroke="#1e1b4b"
              strokeWidth={5.5}
              strokeLinecap="round"
            />
            {/* Two Magic Dots hugging the 4th line (y=20 relative to bassLines[0]) */}
            <circle cx={66} cy={16} r={5.5} fill="#16a34a" />
            <circle cx={66} cy={36} r={5.5} fill="#16a34a" />
          </g>
        )}

        {/* Progressive Hint (Mistake 1 or 2): Show Nearest Landmark Ghost Note & Stepping-Stone Arrows */}
        {hintLevel >= 1 && mainNote && landmarkId && (
          <g>
            {(() => {
              const landmarkNote = NOTES[landmarkId];
              const landmarkPos = getNoteStaffY(landmarkId, clefMode);
              const targetPos = getNoteStaffY(mainNote.id, clefMode);
              const landmarkX = 255;
              const targetX = getNoteX(0, activeNotes.length);

              // Stepping stone intermediate dots
              const stepsCount = Math.abs(mainNote.landmarkHint.stepsDelta);
              const stepDir = mainNote.landmarkHint.stepsDelta >= 0 ? 1 : -1;
              const stones = [];
              for (let s = 1; s <= stepsCount; s++) {
                const ratio = s / (stepsCount + 1);
                const sx = landmarkX + (targetX - landmarkX) * ratio;
                const sy = landmarkPos.y - s * stepDir * 10;
                stones.push({ sx, sy, stepNum: s });
              }

              return (
                <g>
                  {/* Ghost Landmark Note */}
                  {landmarkId === 'C4' && (
                    <line
                      x1={landmarkX - 24}
                      y1={landmarkPos.y}
                      x2={landmarkX + 24}
                      y2={landmarkPos.y}
                      stroke={landmarkNote.color}
                      strokeWidth={3.5}
                      strokeDasharray="4 2"
                    />
                  )}
                  <ellipse
                    cx={landmarkX}
                    cy={landmarkPos.y}
                    rx={14}
                    ry={10.5}
                    fill={landmarkNote.lightColor}
                    stroke={landmarkNote.color}
                    strokeWidth={3}
                    strokeDasharray="4 2"
                  />
                  <text
                    x={landmarkX}
                    y={landmarkPos.y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#1e1b4b"
                  >
                    {formatNoteLabel(landmarkNote.letter, namingConvention)}
                  </text>
                  <text
                    x={landmarkX}
                    y={landmarkPos.y - 16}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#7c3aed"
                  >
                    ★ Landmark
                  </text>

                  {/* Stepping stones between Landmark and Target Note */}
                  {stones.map((st) => (
                    <g key={st.stepNum}>
                      <circle cx={st.sx} cy={st.sy} r={8} fill="#fef08a" stroke="#eab308" strokeWidth={2} />
                      <text
                        x={st.sx}
                        y={st.sy + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#854d0e"
                      >
                        {stepDir > 0 ? `+${st.stepNum}` : `-${st.stepNum}`}
                      </text>
                    </g>
                  ))}

                  {/* Curved arrow connecting Landmark to Target */}
                  {landmarkId !== mainNote.id && (
                    <path
                      d={`M ${landmarkX + 18} ${landmarkPos.y} Q ${(landmarkX + targetX) / 2} ${
                        (landmarkPos.y + targetPos.y) / 2 - 22
                      } ${targetX - 22} ${targetPos.y}`}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth={3}
                      strokeDasharray="5 4"
                    />
                  )}
                </g>
              );
            })()}
          </g>
        )}

        {/* Active Notes on the Staff */}
        {activeNotes.map((noteId, idx) => {
          const note = NOTES[noteId];
          const { y, staff } = getNoteStaffY(noteId, clefMode);
          const x = getNoteX(idx, activeNotes.length);
          const isTarget = targetNote ? noteId === targetNote : idx === 0;
          const fill = useColors ? note.color : '#1e1b4b';
          const stroke = isTarget ? '#7c3aed' : '#1e1b4b';

          // Stem direction: notes below middle line have stems UP on right; at/above middle line have stems DOWN on left
          const middleLineY =
            staff === 'treble'
              ? trebleLines[2] ?? 110
              : bassLines[2] ?? 130;
          const stemUp = y >= middleLineY;
          const stemX = stemUp ? x + 13 : x - 13;
          const stemY2 = stemUp ? y - 48 : y + 48;

          const showNoteLabel = showLabelsOnAll || (isTarget && hintLevel >= 2);

          return (
            <g
              key={`${noteId}-${idx}`}
              className={onNoteClick ? 'cursor-pointer transition-transform hover:scale-110' : ''}
              onClick={() => onNoteClick?.(noteId)}
            >
              {/* Middle C Whisker Line (Ledger Line) */}
              {noteId === 'C4' && (
                <line
                  x1={x - 26}
                  y1={y}
                  x2={x + 26}
                  y2={y}
                  stroke={useColors ? '#ef4444' : '#1e1b4b'}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              )}

              {/* Subtle target glow halo (or Golden Mystery Halo in Arcade Mode!) */}
              {isTarget && isMysteryNote ? (
                <g>
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={28}
                    ry={22}
                    fill="#fde047"
                    opacity={0.55}
                  />
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={22}
                    ry={17}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={x + 22}
                    y={y - 14}
                    fontSize="14"
                    fontWeight="bold"
                    fill="#d97706"
                  >
                    ✨
                  </text>
                </g>
              ) : (
                isTarget && (
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={22}
                    ry={17}
                    fill={useColors ? note.color : '#a855f7'}
                    opacity={0.22}
                  />
                )
              )}

              {/* Note Stem */}
              <line
                x1={stemX}
                y1={y}
                x2={stemX}
                y2={stemY2}
                stroke={isTarget && isMysteryNote && !useColors ? '#d97706' : useColors ? note.color : '#1e1b4b'}
                strokeWidth={3.5}
                strokeLinecap="round"
              />

              {/* Tilted Oval Notehead */}
              <ellipse
                cx={x}
                cy={y}
                rx={15}
                ry={11}
                transform={`rotate(-15 ${x} ${y})`}
                fill={isTarget && isMysteryNote && !useColors ? '#f59e0b' : fill}
                stroke={isTarget && isMysteryNote ? '#b45309' : stroke}
                strokeWidth={2.5}
              />

              {/* Inner Note Label when revealed or in Lesson mode */}
              {showNoteLabel && (
                <g>
                  <rect
                    x={x - 28}
                    y={stemUp ? y + 16 : y - 40}
                    width={56}
                    height={24}
                    rx={12}
                    fill="#fef08a"
                    stroke="#ca8a04"
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={stemUp ? y + 32 : y - 24}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="bold"
                    fill="#1e1b4b"
                  >
                    {formatNoteLabel(note.letter, namingConvention)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
