import React from 'react';

export default function CoachView({
  apiKey,
  messages,
  clearMessages,
  chatInput,
  setChatInput,
  handleSendMessage,
  handleQuickPrompt,
  copyForClaude,
  copyOneBetterPrompt,
  copyPhotoAnalysisPrompt,
  showCamera,
  startCamera,
  stopCamera,
  capturePhoto,
  videoRef,
  fileInputRef,
  handleFileSelect,
}) {
  return (
    <div className="ai-section">
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <div className="ai-label">
            🤖 COACH IA
            <span className="ai-label-badge">{apiKey ? 'API' : 'COPIER'}</span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '4px 10px',
                color: '#ef4444',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              🗑️ Reset
            </button>
          )}
        </div>

        <div className="quick-prompts">
          <button
            className="quick-prompt"
            onClick={() => handleQuickPrompt('Quoi manger pour finir mes macros?')}
          >
            🍽️ Quoi manger?
          </button>
          <button
            className="quick-prompt"
            onClick={() => handleQuickPrompt('Analyse ma semaine')}
          >
            📊 Analyse semaine
          </button>
          <button
            className="quick-prompt"
            onClick={() => handleQuickPrompt('Motivation!')}
          >
            💪 Motivation
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Pose ta question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="chat-btn" onClick={() => handleSendMessage()}>
            →
          </button>
        </div>

        {/* Claude.ai buttons */}
        <div className="claude-buttons-row">
          <button
            className="copy-claude-btn"
            onClick={() => {
              const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
              copyForClaude(chatInput || lastUserMsg?.content);
            }}
          >
            📋 Question → Claude
          </button>
          <button
            className="one-better-btn"
            onClick={copyOneBetterPrompt}
          >
            🚀 1% Better Today
          </button>
        </div>

        {/* Photo section */}
        <div className="photo-section">
          <div className="photo-label">
            📷 Analyse photo repas
          </div>

          {showCamera ? (
            <div className="camera-preview">
              <video ref={videoRef} autoPlay playsInline />
              <div className="camera-controls">
                <button className="camera-cancel" onClick={stopCamera}>
                  Annuler
                </button>
                <button className="camera-snap" onClick={capturePhoto} />
              </div>
            </div>
          ) : (
            <>
              <div className="photo-buttons">
                <button className="photo-btn" onClick={startCamera}>
                  📷 Caméra
                </button>
                <button className="photo-btn" onClick={() => fileInputRef.current?.click()}>
                  🖼️ Galerie
                </button>
              </div>
              <button
                className="photo-claude-btn"
                onClick={copyPhotoAnalysisPrompt}
              >
                📷→🤖 Copier contexte pour Claude.ai + photo
              </button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
}
