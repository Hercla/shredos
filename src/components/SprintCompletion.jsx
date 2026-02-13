import React, { useState } from 'react';
import PhotoCapture from './PhotoCapture';
import PhotoComparison from './PhotoComparison';

export default function SprintCompletion({ beforePhoto, afterPhoto, aiComparison, apiKey, onCaptureAfter, onSaveComparison, onNewSprint }) {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <>
      <div className="card completion-card">
        <div className="completion-trophy">🏆</div>
        <div className="completion-title">Sprint Termine !</div>
        <div className="completion-subtitle">12 semaines de discipline. Bravo.</div>

        {!afterPhoto && (
          <div className="completion-photo-section">
            <div className="completion-photo-label">
              Prends ta photo "Apres" pour voir ta transformation
            </div>
            <PhotoCapture
              label="Photo Apres"
              onCapture={onCaptureAfter}
            />
          </div>
        )}

        {beforePhoto && afterPhoto && (
          <button
            className="completion-compare-btn"
            onClick={() => setShowComparison(true)}
          >
            Voir la transformation IA
          </button>
        )}

        {afterPhoto && !beforePhoto && (
          <div className="completion-no-before">
            Pas de photo "Avant" disponible pour la comparaison
          </div>
        )}

        <button className="completion-new-sprint" onClick={onNewSprint}>
          Lancer un nouveau Sprint
        </button>
      </div>

      {showComparison && beforePhoto && afterPhoto && (
        <PhotoComparison
          beforePhoto={beforePhoto}
          afterPhoto={afterPhoto}
          aiComparison={aiComparison}
          apiKey={apiKey}
          onSaveComparison={onSaveComparison}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}
