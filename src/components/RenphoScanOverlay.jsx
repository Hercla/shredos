import React, { useState, useRef } from 'react';
import { COMPOSITION_FIELDS } from '../constants';

export default function RenphoScanOverlay({
  showRenphoScan,
  setShowRenphoScan,
  renphoScanResult,
  setRenphoScanResult,
  renphoScanError,
  setRenphoScanError,
  processRenphoPhoto,
  handleLogComposition,
  isLoading,
  apiKey,
  renphoFileRef
}) {
  const [confirmData, setConfirmData] = useState(null);
  const [showManual, setShowManual] = useState(false);

  if (!showRenphoScan) return null;

  const allFields = [...COMPOSITION_FIELDS.essential, ...COMPOSITION_FIELDS.secondary];

  const handleClose = () => {
    setShowRenphoScan(false);
    setRenphoScanResult(null);
    setRenphoScanError(null);
    setConfirmData(null);
    setShowManual(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processRenphoPhoto(file);
    }
  };

  // When OCR result arrives, initialize confirm form
  if (renphoScanResult && !confirmData) {
    // Use setTimeout to avoid setting state during render
    setTimeout(() => setConfirmData({ ...renphoScanResult }), 0);
  }

  const handleConfirmSave = () => {
    if (!confirmData) return;
    handleLogComposition({ ...confirmData, source: 'photo' });
    handleClose();
  };

  const handleManualSave = () => {
    if (!confirmData) return;
    handleLogComposition({ ...confirmData, source: 'manual' });
    handleClose();
  };

  const updateConfirm = (key, value) => {
    setConfirmData(prev => ({ ...prev, [key]: value }));
  };

  const switchToManual = () => {
    setShowManual(true);
    setRenphoScanError(null);
    if (!confirmData) {
      setConfirmData({});
    }
  };

  // STEP 1: Source selection
  const renderSourceStep = () => (
    <>
      <div className="renpho-source-btns">
        <button
          className="renpho-source-btn"
          onClick={() => {
            if (renphoFileRef?.current) {
              renphoFileRef.current.setAttribute('capture', 'environment');
              renphoFileRef.current.click();
            }
          }}
        >
          <span className="renpho-source-icon">📷</span>
          Caméra
        </button>
        <button
          className="renpho-source-btn"
          onClick={() => {
            if (renphoFileRef?.current) {
              renphoFileRef.current.removeAttribute('capture');
              renphoFileRef.current.click();
            }
          }}
        >
          <span className="renpho-source-icon">🖼️</span>
          Galerie
        </button>
      </div>

      {!apiKey && (
        <div className="renpho-error">
          ⚠️ Configure une clé API Gemini dans ⚙️ pour le scan photo
        </div>
      )}

      <button className="renpho-manual-link" onClick={switchToManual}>
        Saisie manuelle →
      </button>

      <input
        ref={renphoFileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </>
  );

  // STEP 2: Processing
  const renderProcessing = () => (
    <div className="renpho-processing">
      <span className="loading-spinner" style={{ width: '32px', height: '32px' }}></span>
      <div className="renpho-processing-text">
        Analyse du screenshot Renpho...
      </div>
    </div>
  );

  // STEP 3: Error
  const renderError = () => (
    <div className="renpho-error">
      ⚠️ {renphoScanError}
      <br />
      <button className="renpho-error-btn" onClick={switchToManual}>
        Saisie manuelle
      </button>
      <button className="renpho-error-btn" onClick={() => { setRenphoScanError(null); setRenphoScanResult(null); }} style={{ marginLeft: '8px' }}>
        Réessayer
      </button>
    </div>
  );

  // STEP 4: Confirmation / Manual form
  const renderConfirmation = () => {
    const isPhoto = !showManual && renphoScanResult;

    return (
      <>
        <div className="renpho-confirm-title">
          {isPhoto ? '✅ Données extraites — vérifie et corrige' : '✏️ Saisie manuelle'}
        </div>

        <div className="comp-form-section-title">ESSENTIELS</div>
        <div className="renpho-confirm-grid">
          {COMPOSITION_FIELDS.essential.map(field => {
            const val = confirmData?.[field.key];
            return (
              <div key={field.key} className="renpho-confirm-field">
                <label className="renpho-confirm-label">{field.icon} {field.label} ({field.unit})</label>
                <input
                  className={`renpho-confirm-input ${val == null || val === '' ? 'empty' : ''}`}
                  type="number"
                  step="any"
                  placeholder="—"
                  value={val != null && val !== '' ? val : ''}
                  onChange={(e) => updateConfirm(field.key, e.target.value)}
                />
              </div>
            );
          })}
        </div>

        <div className="comp-form-section-title">SECONDAIRES</div>
        <div className="renpho-confirm-grid">
          {COMPOSITION_FIELDS.secondary.map(field => {
            const val = confirmData?.[field.key];
            return (
              <div key={field.key} className="renpho-confirm-field">
                <label className="renpho-confirm-label">{field.label} ({field.unit})</label>
                <input
                  className={`renpho-confirm-input ${val == null || val === '' ? 'empty' : ''}`}
                  type="number"
                  step="any"
                  placeholder="—"
                  value={val != null && val !== '' ? val : ''}
                  onChange={(e) => updateConfirm(field.key, e.target.value)}
                />
              </div>
            );
          })}
        </div>

        <div className="renpho-confirm-actions">
          <button className="renpho-confirm-cancel" onClick={handleClose}>
            Annuler
          </button>
          <button className="renpho-confirm-save" onClick={isPhoto ? handleConfirmSave : handleManualSave}>
            ✅ Valider
          </button>
        </div>
      </>
    );
  };

  // Determine which step to show
  const renderContent = () => {
    if (isLoading) return renderProcessing();
    if (renphoScanError && !showManual) return renderError();
    if (confirmData || showManual) return renderConfirmation();
    return renderSourceStep();
  };

  return (
    <div className="renpho-overlay">
      <div className="renpho-card">
        <div className="renpho-title">
          📱 Scanner Renpho
          <button className="renpho-close" onClick={handleClose}>×</button>
        </div>
        <div className="renpho-subtitle">
          Prends en photo ton écran Renpho ou upload un screenshot
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
