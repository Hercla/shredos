import React from 'react';
import { PHASES } from '../constants';

export default function Header({ week, daysLeft, pct, phase, view, setView, setShowSettings }) {
  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">SHREDOS</div>
        <div
          className="phase-badge"
          style={{
            color: phase.color,
            borderColor: phase.color,
            background: `${phase.color}15`
          }}
        >
          {phase.name}
        </div>
      </div>

      <div className="week-info">
        <span>W{week.toString().padStart(2, '0')}/12</span>
        <span className="days-left">{daysLeft}j left</span>
        <span className="header-score">{pct}%</span>
        <button className="settings-btn" onClick={() => setShowSettings(true)}>⚙️</button>
      </div>

      {/* Phase progress bar */}
      <div className="phase-progress">
        {PHASES.map((p, i) => (
          <div
            key={p.name}
            className="phase-segment"
            style={{
              flex: p.weeks.length,
              background: week > p.weeks[p.weeks.length - 1]
                ? p.color
                : p.weeks.includes(week)
                ? `linear-gradient(90deg, ${p.color} ${((week - p.weeks[0] + 1) / p.weeks.length) * 100}%, rgba(255,255,255,0.05) 0%)`
                : 'rgba(255,255,255,0.05)',
              marginRight: i < PHASES.length - 1 ? '2px' : 0
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="nav">
        {['dash', 'plan', 'ai'].map((v) => (
          <button
            key={v}
            className={`nav-btn ${view === v ? 'active' : ''}`}
            onClick={() => setView(v)}
          >
            {v === 'dash' ? '📊 Dashboard' : v === 'plan' ? '📋 Plan' : '🤖 Coach IA'}
          </button>
        ))}
        <div
          className="nav-indicator"
          style={{
            width: '33.33%',
            left: view === 'dash' ? '0%' : view === 'plan' ? '33.33%' : '66.66%'
          }}
        />
      </nav>
    </header>
  );
}
