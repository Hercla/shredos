import React, { useState } from 'react';
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
  isSprintCompleted, sprintPhotos, onCaptureAfter, onSaveComparison, onNewSprint,
  copyMealPhotoPrompt, handlePasteMeal,
  todayWorkout, workoutHistory, workoutFileRef,
  copyWorkoutPrompt, handlePasteWorkout, handleImportWorkoutCSV, clearTodayWorkout
}) {
  const [pasteText, setPasteText] = useState('');
  const [pasteStatus, setPasteStatus] = useState(null); // 'success' | 'error' | null
  const [showPaste, setShowPaste] = useState(false);
  const [workoutPasteText, setWorkoutPasteText] = useState('');
  const [workoutPasteStatus, setWorkoutPasteStatus] = useState(null);
  const [showWorkoutPaste, setShowWorkoutPaste] = useState(false);

  const onPasteSubmit = () => {
    if (!pasteText.trim()) return;
    const result = handlePasteMeal(pasteText);
    if (result) {
      setPasteStatus('success');
      setPasteText('');
      setTimeout(() => { setPasteStatus(null); setShowPaste(false); }, 2000);
    } else {
      setPasteStatus('error');
      setTimeout(() => setPasteStatus(null), 3000);
    }
  };

  const onWorkoutPasteSubmit = () => {
    if (!workoutPasteText.trim()) return;
    const result = handlePasteWorkout(workoutPasteText);
    if (result) {
      setWorkoutPasteStatus('success');
      setWorkoutPasteText('');
      setTimeout(() => { setWorkoutPasteStatus(null); setShowWorkoutPaste(false); }, 2000);
    } else {
      setWorkoutPasteStatus('error');
      setTimeout(() => setWorkoutPasteStatus(null), 3000);
    }
  };

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

          {/* Photo -> Claude.ai + Paste response */}
          <div className="meal-claude-row">
            <button className="meal-claude-btn" onClick={copyMealPhotoPrompt}>
              📷 Photo → Claude.ai
            </button>
            <button
              className="meal-paste-toggle"
              onClick={() => setShowPaste(!showPaste)}
            >
              📋 Coller réponse
            </button>
          </div>

          {showPaste && (
            <div className="meal-paste-area">
              <textarea
                className="meal-paste-input"
                placeholder={'Colle ici la réponse de Claude...\nEx: {"name":"Poulet riz","kcal":450,"p":40,"c":50,"f":8}'}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={3}
              />
              <button className="meal-paste-btn" onClick={onPasteSubmit}>
                Ajouter le repas
              </button>
              {pasteStatus === 'success' && (
                <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '6px' }}>
                  Repas ajouté !
                </div>
              )}
              {pasteStatus === 'error' && (
                <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px' }}>
                  Format non reconnu. Colle le JSON de Claude.
                </div>
              )}
            </div>
          )}

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

      {/* Workout Card */}
      <div className="card">
        <div className="card-title">WORKOUT DU JOUR</div>

        {todayWorkout ? (
          <div className="workout-content">
            <div className="workout-summary">
              <div className="workout-stat">
                <span className="workout-stat-value">{todayWorkout.exercises?.length || 0}</span>
                <span className="workout-stat-label">exercices</span>
              </div>
              <div className="workout-stat">
                <span className="workout-stat-value">{todayWorkout.totalVolume ? Math.round(todayWorkout.totalVolume).toLocaleString() : 0}</span>
                <span className="workout-stat-label">kg volume</span>
              </div>
              <div className="workout-stat">
                <span className="workout-stat-value">{todayWorkout.estimatedCalories || 0}</span>
                <span className="workout-stat-label">kcal</span>
              </div>
              {todayWorkout.duration && (
                <div className="workout-stat">
                  <span className="workout-stat-value">{todayWorkout.duration}</span>
                  <span className="workout-stat-label">min</span>
                </div>
              )}
            </div>

            <div className="workout-exercises">
              {todayWorkout.exercises?.map((ex, i) => (
                <div key={i} className="workout-exercise">
                  <div className="workout-exercise-name">{ex.name}</div>
                  <div className="workout-exercise-sets">
                    {ex.sets?.map((s, j) => (
                      <span key={j} className="workout-set-badge">
                        {s.reps}x{s.weight}kg
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="workout-clear-btn" onClick={clearTodayWorkout}>
              Effacer
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#475569', padding: '12px 0' }}>
            Aucun workout logg{'\u00e9'}
          </div>
        )}

        {/* Workout input methods */}
        <div className="workout-actions">
          <div className="meal-claude-row">
            <button className="meal-claude-btn" onClick={copyWorkoutPrompt}>
              Workout → Claude.ai
            </button>
            <button
              className="meal-paste-toggle"
              onClick={() => setShowWorkoutPaste(!showWorkoutPaste)}
            >
              Coller r{'\u00e9'}ponse
            </button>
          </div>

          <button
            className="workout-csv-btn"
            onClick={() => workoutFileRef.current?.click()}
          >
            Importer CSV (Reps & Sets, Strong...)
          </button>
          <input
            ref={workoutFileRef}
            type="file"
            accept=".csv,.tsv,.txt"
            style={{ display: 'none' }}
            onChange={handleImportWorkoutCSV}
          />
        </div>

        {showWorkoutPaste && (
          <div className="meal-paste-area">
            <textarea
              className="meal-paste-input"
              placeholder={'Colle ici la r\u00e9ponse de Claude...\nEx: {"exercises":[{"name":"Bench Press","sets":[{"reps":10,"weight":80}]}],"totalVolume":800}'}
              value={workoutPasteText}
              onChange={(e) => setWorkoutPasteText(e.target.value)}
              rows={3}
            />
            <button className="meal-paste-btn" onClick={onWorkoutPasteSubmit}>
              Ajouter le workout
            </button>
            {workoutPasteStatus === 'success' && (
              <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '6px' }}>
                Workout ajout{'\u00e9'} !
              </div>
            )}
            {workoutPasteStatus === 'error' && (
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px' }}>
                Format non reconnu. Colle le JSON de Claude.
              </div>
            )}
          </div>
        )}

        {/* Workout history */}
        {workoutHistory && Object.keys(workoutHistory).length > 0 && (() => {
          const today = new Date().toDateString();
          const pastDays = Object.entries(workoutHistory)
            .filter(([date]) => date !== today)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .slice(0, 3);
          if (pastDays.length === 0) return null;
          return (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', marginBottom: '8px' }}>HISTORIQUE WORKOUTS</div>
              {pastDays.map(([date, w]) => {
                const d = new Date(date);
                const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                return (
                  <div key={date} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', padding: '4px 0' }}>
                    <span>{label}</span>
                    <span>{w.exercises?.length || 0} exos · {w.totalVolume ? Math.round(w.totalVolume).toLocaleString() : 0}kg · {w.estimatedCalories || 0}kcal</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
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
