import React from 'react';
import PhotoCapture from './PhotoCapture';

const ACTIVITY_LABELS = {
  sedentary: 'Sédentaire (bureau)',
  moderate: 'Modéré (exercice 3-5x/sem)',
  active: 'Actif (exercice 6-7x/sem)',
  veryActive: 'Très actif (2x/jour)'
};

function Overlays({
  showSetup, setupDate, setSetupDate, handleStartSprint,
  confetti,
  showCopySuccess,
  showSettings, setShowSettings, apiProvider, setApiProvider, apiKey, setApiKey,
  isLoading,
  onSprintPhotoBefore,
  userProfile, updateUserProfile,
  handleExportJSON, handleImportJSON, importFileRef,
  syncCode, syncStatus, handleEnableSync, handleRestoreFromCloud
}) {
  const [restoreCode, setRestoreCode] = React.useState('');
  const [restoreStatus, setRestoreStatus] = React.useState(null);
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

            <div className="profile-section">
              <label className="settings-label" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Profil</label>
              <div className="profile-grid">
                <div className="profile-field">
                  <label className="settings-label">Poids (kg)</label>
                  <input
                    className="settings-input"
                    type="number"
                    value={userProfile.weight}
                    onChange={(e) => updateUserProfile('weight', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="profile-field">
                  <label className="settings-label">Taille (cm)</label>
                  <input
                    className="settings-input"
                    type="number"
                    value={userProfile.height}
                    onChange={(e) => updateUserProfile('height', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="profile-field">
                  <label className="settings-label">Age (ans)</label>
                  <input
                    className="settings-input"
                    type="number"
                    value={userProfile.age}
                    onChange={(e) => updateUserProfile('age', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="profile-field">
                  <label className="settings-label">TDEE (kcal)</label>
                  <input
                    className="settings-input"
                    type="number"
                    value={userProfile.tdee}
                    disabled={userProfile.autoTDEE}
                    onChange={(e) => updateUserProfile('tdee', parseInt(e.target.value) || 0)}
                    style={userProfile.autoTDEE ? { opacity: 0.5 } : {}}
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label className="settings-label">Niveau d'activité</label>
                <select
                  className="settings-select"
                  value={userProfile.activity}
                  onChange={(e) => updateUserProfile('activity', e.target.value)}
                >
                  {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="profile-toggle" onClick={() => updateUserProfile('autoTDEE', !userProfile.autoTDEE)}>
                <div className={`profile-toggle-switch ${userProfile.autoTDEE ? 'on' : ''}`}>
                  <div className="profile-toggle-knob" />
                </div>
                <span>TDEE auto (Mifflin-St Jeor)</span>
              </div>
            </div>

            {/* Cloud Sync */}
            <div className="sync-section">
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', marginBottom: '10px' }}>CLOUD SYNC</div>

              {syncCode ? (
                <div className="sync-active">
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    Ton code sync :
                  </div>
                  <div className="sync-code-display">
                    <span className="sync-code-value">{syncCode}</span>
                    <button
                      className="sync-code-copy"
                      onClick={() => navigator.clipboard.writeText(syncCode)}
                    >
                      Copier
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                    {syncStatus === 'syncing' && 'Sync en cours...'}
                    {syncStatus === 'synced' && '\u2705 Sync\u00e9 !'}
                    {syncStatus === 'error' && '\u26a0\ufe0f Erreur sync'}
                    {!syncStatus && 'Auto-sync activ\u00e9'}
                  </div>
                </div>
              ) : (
                <button className="export-btn" onClick={handleEnableSync}>
                  Activer Cloud Sync
                </button>
              )}

              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                  Restaurer depuis un code :
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="sync-restore-input"
                    placeholder="CODE"
                    value={restoreCode}
                    onChange={(e) => setRestoreCode(e.target.value.toUpperCase().slice(0, 6))}
                    maxLength={6}
                  />
                  <button
                    className="sync-restore-btn"
                    onClick={async () => {
                      const ok = await handleRestoreFromCloud(restoreCode);
                      setRestoreStatus(ok ? 'success' : 'error');
                      if (ok) setRestoreCode('');
                      setTimeout(() => setRestoreStatus(null), 3000);
                    }}
                  >
                    Restaurer
                  </button>
                </div>
                {restoreStatus === 'success' && (
                  <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px' }}>
                    Donn\u00e9es restaur\u00e9es !
                  </div>
                )}
                {restoreStatus === 'error' && (
                  <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                    Code introuvable
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button className="export-btn" style={{ flex: 1 }} onClick={handleExportJSON}>
                Exporter JSON
              </button>
              <button className="export-btn" style={{ flex: 1 }} onClick={() => importFileRef.current?.click()}>
                Importer JSON
              </button>
              <input
                ref={importFileRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportJSON}
              />
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
