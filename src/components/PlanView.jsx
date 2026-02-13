import React, { useState } from 'react';
import { CATEGORIES } from '../constants';

function PlanView({
  checklistItems,
  checks,
  handleCheck,
  editingItem,
  setEditingItem,
  updateChecklistItem,
  deleteChecklistItem,
  addChecklistItem,
  week,
  targetCals,
  protein,
  carbs,
  fat,
  phase,
}) {
  const [addingCategory, setAddingCategory] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('✅');

  const handleAdd = (cat) => {
    if (!newLabel.trim()) return;
    addChecklistItem(newLabel, cat, newIcon || '✅');
    setNewLabel('');
    setNewIcon('✅');
    setAddingCategory(null);
  };

  return (
    <>
      <div className="card">
        <div className="card-title">✅ CHECKLIST QUOTIDIENNE</div>

        {CATEGORIES.map(cat => {
          const items = checklistItems.filter(i => i.category === cat);
          const catChecked = items.filter(i => checks[i.id]).length;

          return (
            <div key={cat} className="checklist-category">
              <div className="category-header">
                <span className="category-name">{cat}</span>
                <span className="category-count">{catChecked}/{items.length}</span>
              </div>
              {items.map(item => (
                <div
                  key={item.id}
                  className={`check-item ${checks[item.id] ? 'checked' : ''}`}
                  onClick={() => editingItem !== item.id && handleCheck(item.id)}
                >
                  <span className="check-icon">{item.icon}</span>
                  <div className="check-box">
                    {checks[item.id] && '✓'}
                  </div>
                  {editingItem === item.id ? (
                    <input
                      autoFocus
                      className="check-edit-input"
                      defaultValue={item.label}
                      onBlur={(e) => updateChecklistItem(item.id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && updateChecklistItem(item.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className="check-label"
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingItem(item.id); }}
                    >
                      {item.label}
                    </span>
                  )}
                  <div className="check-actions">
                    <button
                      className="check-edit-btn"
                      onClick={(e) => { e.stopPropagation(); setEditingItem(item.id); }}
                    >
                      ✏️
                    </button>
                    <button
                      className="check-delete-btn"
                      onClick={(e) => { e.stopPropagation(); deleteChecklistItem(item.id); }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {addingCategory === cat ? (
                <div className="add-check-row">
                  <input
                    className="add-check-icon-input"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="✅"
                  />
                  <input
                    autoFocus
                    className="add-check-input"
                    placeholder={`Nouvel item ${cat}...`}
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd(cat)}
                  />
                  <button className="add-check-btn" onClick={() => handleAdd(cat)}>+</button>
                </div>
              ) : (
                <button
                  className="comp-form-toggle"
                  style={{ marginTop: '6px', padding: '10px', fontSize: '12px' }}
                  onClick={() => { setAddingCategory(cat); setNewLabel(''); setNewIcon('✅'); }}
                >
                  + Ajouter un item
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title">🎯 TARGETS W{week}</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#94a3b8' }}>Calories</span>
            <span style={{ color: '#22d3ee', fontWeight: 600 }}>{targetCals} kcal</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#94a3b8' }}>Protéines</span>
            <span style={{ color: '#22d3ee', fontWeight: 600 }}>{protein}g</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#94a3b8' }}>Glucides</span>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{carbs}g</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#94a3b8' }}>Lipides</span>
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>{fat}g</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#94a3b8' }}>Déficit</span>
            <span style={{ color: phase.color, fontWeight: 600 }}>-{phase.deficit} kcal</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default PlanView;
