import React, { useState } from 'react';
import { COMPOSITION_FIELDS } from '../constants';
import CompositionChart from './CompositionChart';

export default function BodyCompositionCard({
  bodyCompositions,
  showCompForm,
  setShowCompForm,
  handleLogComposition,
  setShowRenphoScan,
  apiKey
}) {
  const [form, setForm] = useState({});
  const [showSecondary, setShowSecondary] = useState(false);

  const last = bodyCompositions.length > 0
    ? bodyCompositions[bodyCompositions.length - 1]
    : null;

  const prev = bodyCompositions.length > 1
    ? bodyCompositions[bodyCompositions.length - 2]
    : null;

  const getDelta = (key) => {
    if (!last || !prev || last[key] == null || prev[key] == null) return null;
    return last[key] - prev[key];
  };

  // For fat: down is good. For muscle/BMR: up is good.
  const getDeltaClass = (key, delta) => {
    if (delta === null || delta === 0) return 'neutral';
    if (key === 'bodyFatPct' || key === 'visceralFat') {
      return delta < 0 ? 'positive' : 'negative';
    }
    return delta > 0 ? 'positive' : 'negative';
  };

  const formatDelta = (delta, decimals = 1) => {
    if (delta === null) return '';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(decimals)}`;
  };

  const kpis = [
    { key: 'bodyFatPct', icon: '🔻', label: 'GRAISSE', unit: '%', decimals: 1 },
    { key: 'skeletalMusclePct', icon: '💪', label: 'MUSCLE', unit: '%', decimals: 1 },
    { key: 'bmr', icon: '🔥', label: 'BMR', unit: '', decimals: 0 },
    { key: 'visceralFat', icon: '🫀', label: 'VISCÉRALE', unit: '', decimals: 0 }
  ];

  const handleSubmit = () => {
    handleLogComposition({ ...form, source: 'manual' });
    setForm({});
    setShowSecondary(false);
  };

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="card">
      <div className="card-title">🏋️ BODY COMPOSITION</div>

      {last ? (
        <>
          <div className="comp-kpis">
            {kpis.map(kpi => {
              const value = last[kpi.key];
              const delta = getDelta(kpi.key);
              const deltaClass = getDeltaClass(kpi.key, delta);

              return (
                <div key={kpi.key} className="comp-kpi">
                  <div className="comp-kpi-icon">{kpi.icon}</div>
                  <div className="comp-kpi-value">
                    {value != null ? (kpi.decimals === 0 ? Math.round(value) : value.toFixed(kpi.decimals)) : '—'}
                    <span className="comp-kpi-unit">{kpi.unit}</span>
                  </div>
                  <div className="comp-kpi-label">{kpi.label}</div>
                  {delta !== null && (
                    <div className={`comp-kpi-delta ${deltaClass}`}>
                      {formatDelta(delta, kpi.decimals)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="comp-date">
            Dernière mesure : {new Date(last.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#475569', fontSize: '13px' }}>
          Aucune mesure de composition
        </div>
      )}

      <CompositionChart bodyCompositions={bodyCompositions} />

      <div style={{ display: 'flex', gap: '8px', marginTop: bodyCompositions.length >= 2 ? '12px' : '0' }}>
        {apiKey && (
          <button className="scan-renpho-btn" style={{ flex: 1 }} onClick={() => setShowRenphoScan(true)}>
            📱 Scanner Renpho
          </button>
        )}
        <button className="comp-form-toggle" style={{ flex: 1 }} onClick={() => setShowCompForm(true)}>
          ✏️ Saisie manuelle
        </button>
      </div>

      {showCompForm && (
        <div className="comp-form">
          <div className="comp-form-section-title">ESSENTIELS</div>
          <div className="comp-form-grid">
            {COMPOSITION_FIELDS.essential.map(field => (
              <div key={field.key} className="comp-form-field">
                <label className="comp-form-label">{field.icon} {field.label} ({field.unit})</label>
                <input
                  className="comp-form-input"
                  type="number"
                  step="any"
                  placeholder={field.label}
                  value={form[field.key] || ''}
                  onChange={(e) => updateForm(field.key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <button
            className="comp-secondary-toggle"
            onClick={() => setShowSecondary(!showSecondary)}
          >
            {showSecondary ? '▲ Masquer détails' : '▼ Plus de détails (9 métriques)'}
          </button>

          {showSecondary && (
            <>
              <div className="comp-form-section-title" style={{ marginTop: '12px' }}>SECONDAIRES</div>
              <div className="comp-form-grid">
                {COMPOSITION_FIELDS.secondary.map(field => (
                  <div key={field.key} className="comp-form-field">
                    <label className="comp-form-label">{field.label} ({field.unit})</label>
                    <input
                      className="comp-form-input"
                      type="number"
                      step="any"
                      placeholder={field.label}
                      value={form[field.key] || ''}
                      onChange={(e) => updateForm(field.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="comp-form-actions">
            <button className="comp-form-cancel" onClick={() => { setShowCompForm(false); setForm({}); setShowSecondary(false); }}>
              Annuler
            </button>
            <button className="comp-form-save" onClick={handleSubmit}>
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
