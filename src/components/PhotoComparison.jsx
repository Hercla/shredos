import React, { useState, useEffect } from 'react';
import { analyzeTransformation } from '../lib/gemini';

export default function PhotoComparison({ beforePhoto, afterPhoto, aiComparison, apiKey, onSaveComparison, onClose }) {
  const [analysis, setAnalysis] = useState(aiComparison || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    if (!beforePhoto || !afterPhoto) return;
    setLoading(true);
    setError(null);
    const result = await analyzeTransformation(beforePhoto, afterPhoto, apiKey);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setAnalysis(result);
      if (onSaveComparison) onSaveComparison(result);
    }
  };

  useEffect(() => {
    if (!analysis && beforePhoto && afterPhoto && apiKey) {
      runAnalysis();
    }
  }, []);

  const scoreColor = (score) => {
    if (score >= 8) return '#22c55e';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="comparison-overlay">
      <div className="comparison-card">
        <div className="comparison-header">
          <span>Transformation</span>
          <button className="comparison-close" onClick={onClose}>&times;</button>
        </div>

        <div className="comparison-photos">
          <div className="comparison-photo-col">
            <div className="comparison-label">AVANT</div>
            <img src={beforePhoto} alt="Avant" className="comparison-img" />
          </div>
          <div className="comparison-photo-col">
            <div className="comparison-label">APRES</div>
            <img src={afterPhoto} alt="Apres" className="comparison-img" />
          </div>
        </div>

        {loading && (
          <div className="comparison-loading">
            <span className="loading-spinner"></span>
            <span>Analyse IA en cours...</span>
          </div>
        )}

        {error && (
          <div className="comparison-error">
            {error}
            <button className="comparison-retry" onClick={runAnalysis}>Reessayer</button>
          </div>
        )}

        {analysis && !analysis.error && (
          <div className="comparison-results">
            <div className="comparison-score" style={{ color: scoreColor(analysis.score) }}>
              <span className="comparison-score-value">{analysis.score}</span>
              <span className="comparison-score-max">/10</span>
            </div>

            <div className="comparison-section">
              <div className="comparison-section-title">Observations</div>
              {analysis.observations?.map((obs, i) => (
                <div key={i} className="comparison-observation">{obs}</div>
              ))}
            </div>

            <div className="comparison-section">
              <div className="comparison-section-title">Zones ameliorees</div>
              <div className="comparison-tags">
                {analysis.zonesAmeliorees?.map((zone, i) => (
                  <span key={i} className="comparison-tag">{zone}</span>
                ))}
              </div>
            </div>

            <div className="comparison-section">
              <div className="comparison-section-title">Conseil</div>
              <div className="comparison-conseil">{analysis.conseil}</div>
            </div>
          </div>
        )}

        <button className="comparison-reanalyze" onClick={runAnalysis} disabled={loading}>
          Relancer l'analyse
        </button>
      </div>
    </div>
  );
}
