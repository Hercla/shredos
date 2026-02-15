import React from 'react';

export default function WeightChart({ weights, weightDelta, weightInput, setWeightInput, handleLogWeight, readOnly }) {
  const renderChart = () => {
    if (weights.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div>Aucun poids loggé</div>
        </div>
      );
    }

    const values = weights.map(w => w.value);
    const min = Math.min(...values) - 1;
    const max = Math.max(...values) + 1;
    const range = max - min || 1;

    const points = weights.map((w, i) => {
      const x = 40 + (i / Math.max(1, weights.length - 1)) * 260;
      const y = 160 - ((w.value - min) / range) * 140;
      return `${x},${y}`;
    }).join(' ');

    const yLabels = [max, (max + min) / 2, min].map(v => v.toFixed(1));

    return (
      <div className="weight-chart">
        <div className="weight-y-axis">
          {yLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        {weightDelta !== 0 && (
          <div className="weight-delta">
            {weightDelta > 0 ? '↑' : '↓'} {Math.abs(weightDelta)}kg
          </div>
        )}
        <svg viewBox="0 0 320 180">
          <polyline
            fill="none"
            stroke="url(#weightGradient)"
            strokeWidth="2"
            points={points}
          />
          {weights.map((w, i) => {
            const x = 40 + (i / Math.max(1, weights.length - 1)) * 260;
            const y = 160 - ((w.value - min) / range) * 140;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i === weights.length - 1 ? 6 : 4}
                fill={i === weights.length - 1 ? '#22d3ee' : '#818cf8'}
                style={i === weights.length - 1 ? { animation: 'pulse 2s infinite' } : {}}
              />
            );
          })}
          <defs>
            <linearGradient id="weightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-title">📉 COURBE DE POIDS</div>
      {renderChart()}
      {!readOnly && (
        <div className="weight-input-row">
          <input
            className="weight-input"
            type="number"
            step="0.1"
            placeholder="Ex: 95.2"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
          />
          <button className="weight-btn" onClick={handleLogWeight}>
            Log
          </button>
        </div>
      )}
    </div>
  );
}
