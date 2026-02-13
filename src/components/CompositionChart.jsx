import React from 'react';

export default function CompositionChart({ bodyCompositions }) {
  if (bodyCompositions.length < 2) return null;

  const data = bodyCompositions.filter(c => c.bodyFatPct != null && c.skeletalMusclePct != null);
  if (data.length < 2) return null;

  const fatValues = data.map(c => c.bodyFatPct);
  const muscleValues = data.map(c => c.skeletalMusclePct);

  const fatMin = Math.min(...fatValues) - 0.5;
  const fatMax = Math.max(...fatValues) + 0.5;
  const muscleMin = Math.min(...muscleValues) - 0.5;
  const muscleMax = Math.max(...muscleValues) + 0.5;

  const fatRange = fatMax - fatMin || 1;
  const muscleRange = muscleMax - muscleMin || 1;

  const width = 300;
  const height = 120;
  const padLeft = 10;
  const padRight = 10;
  const padTop = 10;
  const padBottom = 10;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getX = (i) => padLeft + (i / Math.max(1, data.length - 1)) * plotWidth;

  const getFatY = (val) => padTop + plotHeight - ((val - fatMin) / fatRange) * plotHeight;
  const getMuscleY = (val) => padTop + plotHeight - ((val - muscleMin) / muscleRange) * plotHeight;

  const fatPoints = data.map((c, i) => `${getX(i)},${getFatY(c.bodyFatPct)}`).join(' ');
  const musclePoints = data.map((c, i) => `${getX(i)},${getMuscleY(c.skeletalMusclePct)}`).join(' ');

  return (
    <>
      <div className="comp-chart">
        <svg viewBox={`0 0 ${width} ${height}`}>
          {/* Fat line (cyan - we want it going down) */}
          <polyline
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={fatPoints}
          />
          {/* Muscle line (indigo - we want it going up) */}
          <polyline
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={musclePoints}
          />

          {/* Fat dots */}
          {data.map((c, i) => (
            <circle
              key={`fat-${i}`}
              cx={getX(i)}
              cy={getFatY(c.bodyFatPct)}
              r={i === data.length - 1 ? 4 : 3}
              fill="#22d3ee"
            />
          ))}

          {/* Muscle dots */}
          {data.map((c, i) => (
            <circle
              key={`muscle-${i}`}
              cx={getX(i)}
              cy={getMuscleY(c.skeletalMusclePct)}
              r={i === data.length - 1 ? 4 : 3}
              fill="#818cf8"
            />
          ))}

          {/* Last values labels */}
          {data.length > 0 && (
            <>
              <text
                x={getX(data.length - 1) + 2}
                y={getFatY(data[data.length - 1].bodyFatPct) - 6}
                fill="#22d3ee"
                fontSize="9"
                fontWeight="600"
              >
                {data[data.length - 1].bodyFatPct}%
              </text>
              <text
                x={getX(data.length - 1) + 2}
                y={getMuscleY(data[data.length - 1].skeletalMusclePct) - 6}
                fill="#818cf8"
                fontSize="9"
                fontWeight="600"
              >
                {data[data.length - 1].skeletalMusclePct}%
              </text>
            </>
          )}
        </svg>
      </div>
      <div className="comp-chart-legend">
        <span>
          <span className="comp-chart-legend-dot" style={{ background: '#22d3ee' }}></span>
          Graisse %
        </span>
        <span>
          <span className="comp-chart-legend-dot" style={{ background: '#818cf8' }}></span>
          Muscle %
        </span>
      </div>
    </>
  );
}
