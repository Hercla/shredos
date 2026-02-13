const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
    background: #0a0a0f;
    color: #e2e8f0;
    min-height: 100vh;
    overflow-x: hidden;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  @keyframes confetti { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
  @keyframes ringFill { from { stroke-dashoffset: 251; } }
  @keyframes barFill { from { width: 0; } }
  @keyframes glowBorder { 0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); } 50% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.6); } }
  @keyframes slideIndicator { from { transform: translateX(var(--from-x)); } to { transform: translateX(var(--to-x)); } }
  @keyframes pageEnter { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

  .app { max-width: 430px; margin: 0 auto; min-height: 100vh; position: relative; }

  .header {
    background: linear-gradient(180deg, rgba(15,15,25,0.98) 0%, rgba(10,10,15,0.95) 100%);
    backdrop-filter: blur(20px);
    padding: 16px 20px 0;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .logo {
    font-size: 20px;
    font-weight: 800;
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }

  .phase-badge {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    border: 1px solid;
  }

  .week-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #94a3b8;
  }

  .days-left {
    background: rgba(255,255,255,0.05);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
  }

  .header-score {
    background: linear-gradient(135deg, rgba(34,211,238,0.15), rgba(129,140,248,0.15));
    border: 1px solid rgba(34,211,238,0.3);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    color: #22d3ee;
  }

  .phase-progress {
    margin: 12px 0;
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    overflow: hidden;
    display: flex;
  }

  .phase-segment {
    height: 100%;
    transition: all 0.3s ease;
  }

  .nav {
    display: flex;
    position: relative;
    margin-top: 8px;
  }

  .nav-btn {
    flex: 1;
    padding: 14px;
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;
    position: relative;
    z-index: 1;
  }

  .nav-btn.active { color: #22d3ee; }

  .nav-indicator {
    position: absolute;
    bottom: 0;
    height: 2px;
    background: linear-gradient(90deg, #22d3ee, #818cf8);
    border-radius: 2px 2px 0 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .content {
    padding: 20px;
    animation: pageEnter 0.3s ease-out;
  }

  .card {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    transition: all 0.2s;
  }

  .card:hover {
    border-color: rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
  }

  .card-glow {
    animation: glowBorder 2s infinite;
  }

  .card-title {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 1.5px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .score-display {
    text-align: center;
    padding: 10px 0;
  }

  .score-value {
    font-size: 64px;
    font-weight: 800;
    background: linear-gradient(135deg, #22d3ee, #818cf8, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
  }

  .score-label {
    color: #64748b;
    font-size: 12px;
    margin-top: 8px;
    letter-spacing: 2px;
  }

  .streak-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,146,60,0.15));
    border: 1px solid rgba(251,191,36,0.3);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    color: #fbbf24;
    margin-top: 12px;
  }

  .macros-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 8px;
  }

  .macro-ring-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .macro-ring {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .macro-ring svg {
    transform: rotate(-90deg);
    width: 80px;
    height: 80px;
  }

  .macro-ring-bg {
    fill: none;
    stroke: rgba(255,255,255,0.05);
    stroke-width: 8;
  }

  .macro-ring-fill {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    animation: ringFill 1s ease-out;
  }

  .macro-ring-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .macro-ring-value {
    font-size: 16px;
    font-weight: 700;
  }

  .macro-ring-unit {
    font-size: 9px;
    color: #64748b;
  }

  .macro-label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.5px;
  }

  .kcal-bar {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .kcal-bar-header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 8px;
  }

  .kcal-bar-track {
    height: 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
    overflow: hidden;
  }

  .kcal-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
    animation: barFill 1s ease-out;
  }

  .meals-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .meal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: rgba(255,255,255,0.02);
    border-radius: 10px;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .meal-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .meal-macros {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #94a3b8;
  }

  .meal-delete {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    padding: 4px;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .meal-delete:hover { opacity: 1; }

  .add-meal-form {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .add-meal-form .add-meal-input:first-child {
    flex: 1 1 100%;
  }

  .add-meal-form .add-meal-input {
    flex: 1 1 60px;
    min-width: 50px;
  }

  .add-meal-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px;
    color: #e2e8f0;
    font-size: 12px;
  }

  .add-meal-input::placeholder { color: #475569; }

  .add-meal-btn {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: none;
    border-radius: 8px;
    color: #0a0a0f;
    font-weight: 700;
    cursor: pointer;
    padding: 10px 14px;
  }

  .checklist-category {
    margin-bottom: 16px;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .category-name {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 1px;
  }

  .category-count {
    font-size: 11px;
    color: #22d3ee;
    background: rgba(34,211,238,0.1);
    padding: 2px 8px;
    border-radius: 10px;
  }

  .check-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: rgba(255,255,255,0.02);
    border-radius: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .check-item:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.05);
  }

  .check-item.checked {
    background: rgba(34,211,238,0.08);
    border-color: rgba(34,211,238,0.2);
  }

  .check-icon {
    font-size: 16px;
  }

  .check-box {
    width: 22px;
    height: 22px;
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .check-item.checked .check-box {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border-color: transparent;
  }

  .check-label {
    font-size: 14px;
    color: #cbd5e1;
  }

  .check-item.checked .check-label {
    color: #22d3ee;
  }

  .check-edit-input {
    flex: 1;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(34,211,238,0.5);
    border-radius: 6px;
    padding: 6px 10px;
    color: #e2e8f0;
    font-size: 14px;
  }

  .check-edit-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    opacity: 0.3;
    transition: opacity 0.2s;
    font-size: 12px;
  }

  .check-item:hover .check-edit-btn {
    opacity: 0.7;
  }

  .check-edit-btn:hover {
    opacity: 1 !important;
  }

  .check-delete-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 12px;
    color: #ef4444;
    flex-shrink: 0;
  }

  .check-item:hover .check-delete-btn {
    opacity: 0.5;
  }

  .check-delete-btn:hover {
    opacity: 1 !important;
  }

  .check-actions {
    display: flex;
    gap: 2px;
    margin-left: auto;
    flex-shrink: 0;
  }

  .add-check-row {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 0;
  }

  .add-check-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px 12px;
    color: #e2e8f0;
    font-size: 13px;
  }

  .add-check-input::placeholder { color: #475569; }

  .add-check-icon-input {
    width: 44px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px 4px;
    color: #e2e8f0;
    font-size: 16px;
    text-align: center;
  }

  .add-check-btn {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: none;
    border-radius: 8px;
    padding: 10px 14px;
    color: #0a0a0f;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .weight-section { margin-top: 8px; }

  .weight-chart {
    position: relative;
    height: 180px;
    margin-top: 16px;
  }

  .weight-chart svg { width: 100%; height: 100%; }

  .weight-y-axis {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 10px;
    color: #475569;
    padding: 10px 0;
  }

  .weight-delta {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(34,211,238,0.15);
    border: 1px solid rgba(34,211,238,0.3);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #22d3ee;
  }

  .weight-input-row {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .weight-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px;
    color: #e2e8f0;
    font-size: 16px;
    text-align: center;
  }

  .weight-btn {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: none;
    border-radius: 12px;
    padding: 14px 24px;
    color: #0a0a0f;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .weight-btn:active { transform: scale(0.95); }

  .timeline {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    padding: 4px 0;
  }

  .timeline::-webkit-scrollbar { height: 4px; }
  .timeline::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 2px; }
  .timeline::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .week-dot {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    background: rgba(255,255,255,0.05);
    color: #64748b;
    flex-shrink: 0;
    border: 1px solid transparent;
  }

  .week-dot.current {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    color: #0a0a0f;
  }

  .week-dot.past {
    background: rgba(34,211,238,0.1);
    color: #22d3ee;
    border-color: rgba(34,211,238,0.2);
  }

  .ai-section { padding-bottom: 100px; }

  .ai-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ai-label-badge {
    font-size: 9px;
    background: rgba(139,92,246,0.2);
    color: #a78bfa;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .quick-prompts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .quick-prompt {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 10px 16px;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-prompt:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
    color: #e2e8f0;
  }

  .chat-messages {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 16px;
    padding-right: 8px;
  }

  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 2px; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .chat-message {
    padding: 12px 16px;
    border-radius: 16px;
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 1.5;
    animation: slideUp 0.3s ease-out;
  }

  .chat-message.user {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    color: #0a0a0f;
    margin-left: 40px;
  }

  .chat-message.ai {
    background: rgba(255,255,255,0.05);
    color: #e2e8f0;
    margin-right: 40px;
  }

  .chat-input-row {
    display: flex;
    gap: 10px;
  }

  .chat-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 14px 20px;
    color: #e2e8f0;
    font-size: 14px;
  }

  .chat-input::placeholder { color: #475569; }

  .chat-btn {
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
  }

  .claude-buttons-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 12px;
  }

  .copy-claude-btn, .one-better-btn {
    background: rgba(139,92,246,0.15);
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 12px;
    padding: 14px 12px;
    color: #a78bfa;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .copy-claude-btn:hover, .one-better-btn:hover {
    background: rgba(139,92,246,0.25);
    border-color: rgba(139,92,246,0.5);
    transform: scale(1.02);
  }

  .one-better-btn {
    background: linear-gradient(135deg, rgba(34,211,238,0.2), rgba(129,140,248,0.2));
    border: 1px solid rgba(34,211,238,0.4);
    color: #22d3ee;
    font-weight: 700;
  }

  .one-better-btn:hover {
    background: linear-gradient(135deg, rgba(34,211,238,0.3), rgba(129,140,248,0.3));
  }

  .photo-claude-btn {
    width: 100%;
    background: rgba(251,191,36,0.15);
    border: 1px solid rgba(251,191,36,0.3);
    border-radius: 12px;
    padding: 14px 16px;
    color: #fbbf24;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    transition: all 0.2s;
  }

  .photo-claude-btn:hover {
    background: rgba(251,191,36,0.25);
    border-color: rgba(251,191,36,0.5);
  }

  .copy-success {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(34,211,238,0.95);
    color: #0a0a0f;
    padding: 20px 32px;
    border-radius: 16px;
    font-weight: 700;
    font-size: 16px;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  .settings-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 6px 10px;
    color: #64748b;
    font-size: 14px;
    cursor: pointer;
  }

  .settings-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  .settings-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 28px;
    max-width: 380px;
    width: 90%;
  }

  .settings-title {
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .settings-close {
    background: none;
    border: none;
    color: #64748b;
    font-size: 24px;
    cursor: pointer;
  }

  .settings-section {
    margin-bottom: 20px;
  }

  .settings-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
    display: block;
  }

  .settings-select, .settings-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 12px;
    color: #e2e8f0;
    font-size: 14px;
  }

  .settings-hint {
    font-size: 11px;
    color: #64748b;
    margin-top: 8px;
  }

  .settings-hint a {
    color: #22d3ee;
  }

  .settings-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 10px;
    font-size: 13px;
    margin-top: 16px;
  }

  .settings-status.connected {
    background: rgba(34,197,94,0.15);
    color: #22c55e;
  }

  .settings-status.disconnected {
    background: rgba(251,191,36,0.15);
    color: #fbbf24;
  }

  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(34,211,238,0.3);
    border-top-color: #22d3ee;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .photo-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .photo-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .photo-buttons {
    display: flex;
    gap: 10px;
  }

  .photo-btn {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .photo-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
  }

  .camera-preview {
    margin-top: 12px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }

  .camera-preview video {
    width: 100%;
    border-radius: 12px;
  }

  .camera-controls {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 12px;
  }

  .camera-snap {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: 4px solid rgba(255,255,255,0.2);
    cursor: pointer;
    transition: transform 0.2s;
  }

  .camera-snap:active { transform: scale(0.9); }

  .camera-cancel {
    background: rgba(239,68,68,0.2);
    border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444;
    padding: 12px 24px;
    border-radius: 24px;
    cursor: pointer;
  }

  .sprint-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sprint-info {
    font-size: 13px;
    color: #94a3b8;
  }

  .sprint-date {
    color: #22d3ee;
    font-weight: 600;
  }

  .reset-btn {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    color: #ef4444;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
  }

  .footer {
    text-align: center;
    padding: 20px;
    font-size: 11px;
    color: #475569;
    border-top: 1px solid rgba(255,255,255,0.03);
  }

  .confetti {
    position: fixed;
    top: -20px;
    font-size: 24px;
    animation: confetti 3s linear forwards;
    pointer-events: none;
    z-index: 1000;
  }

  .setup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
  }

  .setup-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 32px;
    max-width: 360px;
    width: 90%;
    text-align: center;
  }

  .setup-title {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }

  .setup-subtitle {
    color: #64748b;
    font-size: 14px;
    margin-bottom: 24px;
  }

  .setup-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 16px;
    color: #e2e8f0;
    font-size: 16px;
    text-align: center;
    margin-bottom: 16px;
  }

  .setup-btn {
    width: 100%;
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: none;
    border-radius: 12px;
    padding: 16px;
    color: #0a0a0f;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #475569;
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  /* Body Composition Card */
  .comp-kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .comp-kpi {
    text-align: center;
    padding: 12px 4px;
    background: rgba(255,255,255,0.02);
    border-radius: 12px;
  }

  .comp-kpi-icon {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .comp-kpi-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .comp-kpi-label {
    font-size: 9px;
    color: #64748b;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  .comp-kpi-unit {
    font-size: 11px;
    color: #64748b;
    font-weight: 400;
  }

  .comp-kpi-delta {
    font-size: 11px;
    font-weight: 600;
    margin-top: 4px;
  }

  .comp-kpi-delta.positive { color: #22c55e; }
  .comp-kpi-delta.negative { color: #ef4444; }
  .comp-kpi-delta.neutral { color: #64748b; }

  .comp-date {
    font-size: 11px;
    color: #475569;
    text-align: center;
    margin-bottom: 16px;
  }

  .comp-form-toggle {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px dashed rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 14px;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .comp-form-toggle:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(34,211,238,0.3);
    color: #e2e8f0;
  }

  .comp-form {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .comp-form-section-title {
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  .comp-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .comp-form-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .comp-form-label {
    font-size: 11px;
    color: #94a3b8;
  }

  .comp-form-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 10px;
    color: #e2e8f0;
    font-size: 14px;
    text-align: center;
  }

  .comp-form-input::placeholder { color: #475569; }

  .comp-form-actions {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  .comp-form-save {
    flex: 1;
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: none;
    border-radius: 10px;
    padding: 12px;
    color: #0a0a0f;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
  }

  .comp-form-cancel {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 12px 20px;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
  }

  .comp-secondary-toggle {
    background: none;
    border: none;
    color: #64748b;
    font-size: 12px;
    cursor: pointer;
    padding: 8px 0;
    width: 100%;
    text-align: center;
  }

  .comp-secondary-toggle:hover {
    color: #94a3b8;
  }

  .scan-renpho-btn {
    background: rgba(139,92,246,0.2);
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 12px;
    padding: 14px 16px;
    color: #a78bfa;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .scan-renpho-btn:hover {
    background: rgba(139,92,246,0.3);
    border-color: rgba(139,92,246,0.5);
  }

  /* Renpho Scan Overlay */
  .renpho-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }

  .renpho-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 28px;
    max-width: 400px;
    width: 92%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .renpho-card::-webkit-scrollbar { width: 4px; }
  .renpho-card::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 2px; }
  .renpho-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .renpho-title {
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .renpho-subtitle {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 20px;
  }

  .renpho-close {
    background: none;
    border: none;
    color: #64748b;
    font-size: 22px;
    cursor: pointer;
  }

  .renpho-source-btns {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }

  .renpho-source-btn {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 16px;
    color: #94a3b8;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .renpho-source-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(139,92,246,0.3);
    color: #e2e8f0;
  }

  .renpho-source-icon {
    font-size: 28px;
  }

  .renpho-manual-link {
    display: block;
    text-align: center;
    color: #64748b;
    font-size: 12px;
    cursor: pointer;
    padding: 8px;
    background: none;
    border: none;
    width: 100%;
  }

  .renpho-manual-link:hover {
    color: #94a3b8;
  }

  .renpho-processing {
    text-align: center;
    padding: 40px 20px;
  }

  .renpho-processing-text {
    color: #94a3b8;
    font-size: 14px;
    margin-top: 16px;
  }

  .renpho-confirm-title {
    font-size: 14px;
    font-weight: 700;
    color: #22c55e;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .renpho-confirm-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .renpho-confirm-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .renpho-confirm-label {
    font-size: 10px;
    color: #64748b;
    letter-spacing: 0.5px;
  }

  .renpho-confirm-input {
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: 8px;
    padding: 10px;
    color: #e2e8f0;
    font-size: 14px;
    text-align: center;
  }

  .renpho-confirm-input.empty {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.1);
  }

  .renpho-confirm-input::placeholder { color: #475569; }

  .renpho-confirm-actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .renpho-confirm-save {
    flex: 1;
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: none;
    border-radius: 12px;
    padding: 14px;
    color: #0a0a0f;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
  }

  .renpho-confirm-cancel {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px 20px;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
  }

  .renpho-error {
    text-align: center;
    padding: 20px;
    color: #f59e0b;
    font-size: 14px;
  }

  .renpho-error-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 10px 20px;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
    margin-top: 12px;
  }

  /* Composition Chart (dual-line) */
  .comp-chart {
    position: relative;
    height: 140px;
    margin: 16px 0 8px;
  }

  .comp-chart svg {
    width: 100%;
    height: 100%;
  }

  .comp-chart-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 11px;
    color: #64748b;
  }

  .comp-chart-legend-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }

  /* PhotoCapture */
  .photo-capture {
    margin: 8px 0;
  }

  .photo-capture-label {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .photo-capture-btn {
    width: 100%;
    aspect-ratio: 3/4;
    max-height: 200px;
    background: rgba(255,255,255,0.03);
    border: 2px dashed rgba(255,255,255,0.15);
    border-radius: 16px;
    color: #64748b;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .photo-capture-btn:hover {
    border-color: rgba(34,211,238,0.4);
    background: rgba(34,211,238,0.05);
    color: #94a3b8;
  }

  .photo-capture-icon {
    font-size: 32px;
    color: #22d3ee;
  }

  .photo-capture-preview {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
  }

  .photo-capture-img {
    width: 100%;
    max-height: 250px;
    object-fit: cover;
    border-radius: 16px;
    display: block;
  }

  .photo-capture-retake {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 6px 14px;
    color: #e2e8f0;
    font-size: 12px;
    cursor: pointer;
  }

  /* PhotoComparison overlay */
  .comparison-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
    animation: fadeIn 0.2s ease-out;
    overflow-y: auto;
    padding: 20px;
  }

  .comparison-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 24px;
    max-width: 420px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .comparison-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 20px;
  }

  .comparison-close {
    background: none;
    border: none;
    color: #64748b;
    font-size: 24px;
    cursor: pointer;
  }

  .comparison-photos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }

  .comparison-photo-col {
    text-align: center;
  }

  .comparison-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #64748b;
    margin-bottom: 8px;
  }

  .comparison-img {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    border-radius: 12px;
  }

  .comparison-loading {
    text-align: center;
    padding: 24px;
    color: #94a3b8;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .comparison-error {
    text-align: center;
    padding: 16px;
    color: #f59e0b;
    font-size: 14px;
  }

  .comparison-retry {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 8px 16px;
    color: #94a3b8;
    font-size: 12px;
    cursor: pointer;
    margin-top: 10px;
  }

  .comparison-results {
    animation: slideUp 0.3s ease-out;
  }

  .comparison-score {
    text-align: center;
    margin-bottom: 20px;
  }

  .comparison-score-value {
    font-size: 56px;
    font-weight: 800;
    line-height: 1;
  }

  .comparison-score-max {
    font-size: 20px;
    color: #64748b;
  }

  .comparison-section {
    margin-bottom: 16px;
  }

  .comparison-section-title {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .comparison-observation {
    font-size: 13px;
    color: #cbd5e1;
    padding: 8px 12px;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .comparison-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .comparison-tag {
    background: linear-gradient(135deg, rgba(34,211,238,0.15), rgba(129,140,248,0.15));
    border: 1px solid rgba(34,211,238,0.3);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px;
    color: #22d3ee;
    font-weight: 600;
  }

  .comparison-conseil {
    font-size: 13px;
    color: #cbd5e1;
    padding: 12px;
    background: rgba(139,92,246,0.1);
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 12px;
    line-height: 1.5;
  }

  .comparison-reanalyze {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 12px;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
    margin-top: 16px;
    transition: all 0.2s;
  }

  .comparison-reanalyze:hover {
    background: rgba(255,255,255,0.08);
    color: #e2e8f0;
  }

  .comparison-reanalyze:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* SprintCompletion */
  .completion-card {
    text-align: center;
    padding: 28px 20px;
  }

  .completion-trophy {
    font-size: 64px;
    margin-bottom: 12px;
  }

  .completion-title {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(135deg, #22d3ee, #818cf8, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }

  .completion-subtitle {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 24px;
  }

  .completion-photo-section {
    margin-bottom: 20px;
  }

  .completion-photo-label {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  .completion-compare-btn {
    width: 100%;
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    border: none;
    border-radius: 12px;
    padding: 16px;
    color: #0a0a0f;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 12px;
    transition: transform 0.2s;
  }

  .completion-compare-btn:active {
    transform: scale(0.97);
  }

  .completion-no-before {
    font-size: 13px;
    color: #64748b;
    padding: 12px;
    margin-bottom: 12px;
  }

  .completion-new-sprint {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px;
    color: #94a3b8;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .completion-new-sprint:hover {
    background: rgba(255,255,255,0.08);
    color: #e2e8f0;
  }
`;

export default styles;
