import React from 'react';

export default function MacroRing({ value, target, color, label, pattern }) {
  const pct = Math.min(100, (value / target) * 100);
  const remaining = Math.max(0, target - value);
  const isOver = value > target;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="macro-ring-container">
      <div className="macro-ring">
        <svg viewBox="0 0 100 100">
          <circle className="macro-ring-bg" cx="50" cy="50" r="40" />
          <circle
            className="macro-ring-fill"
            cx="50" cy="50" r="40"
            stroke={isOver ? '#ef4444' : color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              strokeDasharray: pattern === 'dashed' ? '8 4' : pattern === 'dotted' ? '2 4' : circumference
            }}
          />
        </svg>
        <div className="macro-ring-center">
          <div className="macro-ring-value" style={{ color: isOver ? '#ef4444' : color }}>
            {isOver ? '+' : ''}{isOver ? value - target : remaining}
          </div>
          <div className="macro-ring-unit">{isOver ? 'over' : 'left'}</div>
        </div>
      </div>
      <div className="macro-label">{label}</div>
    </div>
  );
}
