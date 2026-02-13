import React from 'react';
import PhotoCapture from './PhotoCapture';

function Overlays({
  showSetup, setupDate, setSetupDate, handleStartSprint,
  confetti,
  showCopySuccess,
  showSettings, setShowSettings, apiProvider, setApiProvider, apiKey, setApiKey,
  isLoading,
  onSprintPhotoBefore
}) {
  return (
    <>
      {/* Setup overlay */}
      {showSetup && (
        <div className="setup-overlay">
          <div className="setup-card">
            <div className="setup-title">ShredOS v7</div>
            <div className="setup-subtitle">12 semaines vers ta meilleure forme</div>
            <input
              type="date"
              className="setup-input"
              value={setupDate}
              onChange={(e) => setSetupDate(e.target.value)}
              placeholder="Date de départ"
            />
            <PhotoCapture
              label="Photo Avant (optionnel)"
              onCapture={onSprintPhotoBefore}
            />
            <div style={{ height: '12px' }} />
            <button className="setup-btn" onClick={handleStartSprint}>
              Lancer le Sprint
            </button>
          </div>
        </div>
      )}

      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="confetti"
          style={{ left: `${c.left}%`, animationDelay: `${c.delay}s` }}
        >
          {c.emoji}
        </div>
      ))}

      {/* Copy success popup */}
      {showCopySuccess && (
        <div className="copy-success">
          ✅ Copié ! → Colle dans claude.ai
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-card">
            <div className="settings-title">
              ⚙️ Settings
              <button className="settings-close" onClick={() => setShowSettings(false)}>×</button>
            </div>

            <div className="settings-section">
              <label className="settings-label">Provider IA</label>
              <select
                className="settings-select"
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value)}
              >
                <option value="gemini">Google Gemini (gratuit)</option>
                <option value="claude">Claude API (payant)</option>
              </select>
            </div>

            <div className="settings-section">
              <label className="settings-label">Clé API {apiProvider === 'gemini' ? 'Gemini' : 'Claude'}</label>
              <input
                className="settings-input"
                type="password"
                placeholder="Colle ta clé API ici..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className="settings-hint">
                {apiProvider === 'gemini' ? (
                  <>Gratuit ! Crée ta clé sur <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a></>
                ) : (
                  <>~0.02€/question. Crée ta clé sur <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a></>
                )}
              </div>
            </div>

            <div className={`settings-status ${apiKey ? 'connected' : 'disconnected'}`}>
              {apiKey ? (
                <>✅ API configurée — réponses directes dans l'app</>
              ) : (
                <>⚠️ Pas d'API — mode copier/coller vers Claude.ai</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="copy-success">
          <span className="loading-spinner"></span> IA en réflexion...
        </div>
      )}
    </>
  );
}

export default Overlays;
