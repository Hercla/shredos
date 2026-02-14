import React from 'react';
import MacroRing from './MacroRing';
import WeightChart from './WeightChart';
import BodyCompositionCard from './BodyCompositionCard';
import SprintCompletion from './SprintCompletion';

export default function DashboardView({
  pct, checkedCount, checklistItems, streak,
  consumed, protein, carbs, fat, targetCals,
  meals, mealHistory, mealForm, setMealForm, handleAddMeal, handleDeleteMeal,
  weights, weightDelta, weightInput, setWeightInput, handleLogWeight,
  week,
  startDate, handleReset,
  bodyCompositions, showCompForm, setShowCompForm, handleLogComposition,
  setShowRenphoScan, apiKey,
  isSprintCompleted, sprintPhotos, onCaptureAfter, onSaveComparison, onNewSprint
}) {
  return (
    <>
      {/* Score Card */}
      <div className={`card ${pct === 100 ? 'card-glow' : ''}`}>
        <div className="card-title">SCORE DU JOUR</div>
        <div className="score-display">
          <div className="score-value">{pct}%</div>
          <div className="score-label">{checkedCount}/{checklistItems.length} COMPLÉTÉS</div>
          {streak > 0 && (
            <div className="streak-badge">
              🔥 {streak} streak
            </div>
          )}
        </div>
      </div>

      {/* Macros Card */}
      <div className="card">
        <div className="card-title">MACROS · LIVE TRACKER</div>
        <div className="macros-grid">
          <MacroRing value={consumed.p} target={protein} color="#22d3ee" label="PROTÉINES" pattern="solid" />
          <MacroRing value={consumed.c} target={carbs} color="#f59e0b" label="GLUCIDES" pattern="dashed" />
          <MacroRing value={consumed.f} target={fat} color="#a78bfa" label="LIPIDES" pattern="dotted" />
        </div>

        {/* Kcal bar */}
        <div className="kcal-bar">
          <div className="kcal-bar-header">
            <span>🔥 {consumed.kcal} kcal</span>
            <span style={{ color: '#64748b' }}>/ {targetCals} kcal</span>
          </div>
          <div className="kcal-bar-track">
            <div
              className="kcal-bar-fill"
              style={{
                width: `${Math.min(100, (consumed.kcal / targetCals) * 100)}%`,
                background: consumed.kcal > targetCals
                  ? '#ef4444'
                  : 'linear-gradient(90deg, #22d3ee, #818cf8)'
              }}
            />
          </div>
        </div>

        {/* Meals section */}
        <div className="meals-section">
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
            REPAS AUJOURD'HUI
          </div>

          {meals.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#475569', padding: '12px 0' }}>
              Aucun repas loggé
            </div>
          ) : (
            meals.map(meal => (
              <div key={meal.id} className="meal-item">
                <div className="meal-name">
                  <span>{meal.name}</span>
                </div>
                <div className="meal-macros">
                  <span>{meal.kcal}kcal</span>
                  <span>P{meal.p}</span>
                  <span>C{meal.c}</span>
                  <span>F{meal.f}</span>
                  <button
                    className="meal-delete"
                    onClick={() => handleDeleteMeal(meal.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add meal form */}
          <div className="add-meal-form">
            <input
              className="add-meal-input"
              placeholder="Repas..."
              value={mealForm.name}
              onChange={(e) => setMealForm(f => ({ ...f, name: e.target.value }))}
            />
            <input
              className="add-meal-input"
              placeholder="kcal"
              type="number"
              value={mealForm.kcal}
              onChange={(e) => setMealForm(f => ({ ...f, kcal: e.target.value }))}
            />
            <input
              className="add-meal-input"
              placeholder="P"
              type="number"
              value={mealForm.p}
              onChange={(e) => setMealForm(f => ({ ...f, p: e.target.value }))}
            />
            <input
              className="add-meal-input"
              placeholder="C"
              type="number"
              value={mealForm.c}
              onChange={(e) => setMealForm(f => ({ ...f, c: e.target.value }))}
            />
            <input
              className="add-meal-input"
              placeholder="F"
              type="number"
              value={mealForm.f}
              onChange={(e) => setMealForm(f => ({ ...f, f: e.target.value }))}
            />
            <button className="add-meal-btn" onClick={handleAddMeal}>+</button>
          </div>

          {/* Meal history summary */}
          {mealHistory && Object.keys(mealHistory).length > 1 && (() => {
            const today = new Date().toDateString();
            const pastDays = Object.entries(mealHistory)
              .filter(([date]) => date !== today)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .slice(0, 3);
            if (pastDays.length === 0) return null;
            return (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', marginBottom: '8px' }}>HISTORIQUE</div>
                {pastDays.map(([date, dayMeals]) => {
                  const total = dayMeals.reduce((s, m) => s + (m.kcal || 0), 0);
                  const totalP = dayMeals.reduce((s, m) => s + (m.p || 0), 0);
                  const d = new Date(date);
                  const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                  return (
                    <div key={date} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', padding: '4px 0' }}>
                      <span>{label}</span>
                      <span>{total}kcal · P{totalP}g · {dayMeals.length} repas</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Weight Chart */}
      <WeightChart
        weights={weights}
        weightDelta={weightDelta}
        weightInput={weightInput}
        setWeightInput={setWeightInput}
        handleLogWeight={handleLogWeight}
      />

      {/* Body Composition */}
      <BodyCompositionCard
        bodyCompositions={bodyCompositions}
        showCompForm={showCompForm}
        setShowCompForm={setShowCompForm}
        handleLogComposition={handleLogComposition}
        setShowRenphoScan={setShowRenphoScan}
        apiKey={apiKey}
      />

      {/* Timeline */}
      <div className="card">
        <div className="card-title">🗓️ TIMELINE</div>
        <div className="timeline">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
            <div
              key={w}
              className={`week-dot ${w === week ? 'current' : w < week ? 'past' : ''}`}
            >
              {w < week ? '✓' : w}
            </div>
          ))}
        </div>
      </div>

      {/* Sprint Completion or Sprint info */}
      {isSprintCompleted ? (
        <SprintCompletion
          beforePhoto={sprintPhotos?.before}
          afterPhoto={sprintPhotos?.after}
          aiComparison={sprintPhotos?.aiComparison}
          apiKey={apiKey}
          onCaptureAfter={onCaptureAfter}
          onSaveComparison={onSaveComparison}
          onNewSprint={onNewSprint}
        />
      ) : (
        <div className="card sprint-card">
          <div className="sprint-info">
            Sprint d{'\u00e9'}marr{'\u00e9'} le <span className="sprint-date">
              {startDate?.toLocaleDateString('fr-FR')}
            </span>
          </div>
          <button className="reset-btn" onClick={handleReset}>Reset</button>
        </div>
      )}
    </>
  );
}
