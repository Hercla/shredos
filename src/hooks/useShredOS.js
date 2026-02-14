import { useState, useEffect, useRef } from 'react';
import { PHASES, DEFAULT_CHECKLIST, USER, COMPOSITION_RANGES, RENPHO_OCR_PROMPT } from '../constants';
import parseAIJSON from '../lib/parseAIJSON';
import parseWorkoutCSV from '../lib/parseWorkoutCSV';

const MEAL_PHOTO_PROMPT = `Analyse cette photo de repas et réponds UNIQUEMENT avec ce format JSON (rien d'autre, pas de markdown):
{"name": "nom descriptif du repas", "kcal": nombre, "p": grammes_proteines, "c": grammes_glucides, "f": grammes_lipides}

Règles:
- "name" doit décrire ce que tu vois (ex: "Poulet grillé + riz basmati + brocolis")
- Estime les macros basé sur les portions visibles. Sois réaliste.
- Les valeurs doivent être des nombres entiers.`;

const WORKOUT_PROMPT = `Analyse ces données de workout et réponds UNIQUEMENT avec ce format JSON (rien d'autre, pas de markdown):
{
  "exercises": [{"name": "Nom exercice", "sets": [{"reps": 10, "weight": 80}]}],
  "totalVolume": nombre_total_kg_souleves,
  "estimatedCalories": calories_estimees,
  "duration": duree_minutes_ou_null
}

Règles:
- Liste chaque exercice avec ses séries (reps + poids en kg)
- totalVolume = somme de (reps x poids) pour toutes les séries
- estimatedCalories = estimation réaliste des calories brûlées (musculation ~5-8 kcal/min)
- Si la durée n'est pas mentionnée, estime-la
- Sois précis sur les noms d'exercices`;

const ACTIVITY_MULTIPLIERS = { sedentary: 1.2, moderate: 1.55, active: 1.725, veryActive: 1.9 };

const calcTDEE = (weight, height, age, activity) => {
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activity] || 1.55));
};

export default function useShredOS() {
  // State
  const [view, setView] = useState('dash');
  const [startDate, setStartDate] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupDate, setSetupDate] = useState('');
  const [checks, setChecks] = useState({});
  const [weights, setWeights] = useState([]);
  const [weightInput, setWeightInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [meals, setMeals] = useState([]);
  const [mealHistory, setMealHistory] = useState({});
  const [mealForm, setMealForm] = useState({ name: '', kcal: '', p: '', c: '', f: '' });
  const [showCamera, setShowCamera] = useState(false);
  const [confetti, setConfetti] = useState([]);

  // API Settings
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('gemini'); // 'gemini' or 'claude'
  const [isLoading, setIsLoading] = useState(false);

  // Editable checklist
  const [checklistItems, setChecklistItems] = useState(DEFAULT_CHECKLIST);
  const [editingItem, setEditingItem] = useState(null);

  // Body composition
  const [bodyCompositions, setBodyCompositions] = useState([]);
  const [showCompForm, setShowCompForm] = useState(false);
  const [showRenphoScan, setShowRenphoScan] = useState(false);
  const [renphoScanResult, setRenphoScanResult] = useState(null);
  const [renphoScanError, setRenphoScanError] = useState(null);
  const renphoFileRef = useRef(null);

  // Workouts
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState({});
  const workoutFileRef = useRef(null);

  // User profile
  const [userProfile, setUserProfile] = useState({
    weight: USER.weight, height: USER.height, age: USER.age, tdee: USER.tdee,
    activity: 'moderate', autoTDEE: false
  });

  // Sprint photos (avant/apres)
  const [sprintPhotos, setSprintPhotos] = useState({ before: null, after: null, aiComparison: null });

  // Swipe navigation
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Copy success
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Views
  const views = ['dash', 'plan', 'ai'];

  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shredos');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.startDate) setStartDate(new Date(data.startDate));
      else setShowSetup(true);
      if (data.checks) setChecks(data.checks);
      if (data.weights) setWeights(data.weights);
      if (data.streak) setStreak(data.streak);
      if (data.messages) setMessages(data.messages);
      if (data.apiKey) setApiKey(data.apiKey);
      if (data.apiProvider) setApiProvider(data.apiProvider);
      if (data.checklistItems) setChecklistItems(data.checklistItems);
      if (data.bodyCompositions) setBodyCompositions(data.bodyCompositions);
      if (data.sprintPhotos) setSprintPhotos(data.sprintPhotos);
      if (data.userProfile) setUserProfile(prev => ({ ...prev, ...data.userProfile }));
      if (data.workoutHistory) {
        setWorkoutHistory(data.workoutHistory);
        const today = new Date().toDateString();
        if (data.workoutHistory[today]) setTodayWorkout(data.workoutHistory[today]);
      }
      // Load meal history
      const today = new Date().toDateString();
      if (data.mealHistory) {
        setMealHistory(data.mealHistory);
        if (data.mealHistory[today]) setMeals(data.mealHistory[today]);
      } else if (data.meals && data.mealsDate === today) {
        // Migration: old format -> mealHistory
        setMeals(data.meals);
        setMealHistory({ [today]: data.meals });
      }
    } else {
      setShowSetup(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (startDate) {
      const today = new Date().toDateString();
      const updatedHistory = { ...mealHistory, [today]: meals };
      const updatedWorkoutHistory = todayWorkout
        ? { ...workoutHistory, [today]: todayWorkout }
        : workoutHistory;
      localStorage.setItem('shredos', JSON.stringify({
        startDate: startDate.toISOString(),
        checks,
        weights,
        streak,
        messages,
        mealHistory: updatedHistory,
        workoutHistory: updatedWorkoutHistory,
        apiKey,
        apiProvider,
        checklistItems,
        bodyCompositions,
        sprintPhotos,
        userProfile,
      }));
    }
  }, [startDate, checks, weights, streak, messages, meals, mealHistory, todayWorkout, workoutHistory, apiKey, apiProvider, checklistItems, bodyCompositions, sprintPhotos, userProfile]);

  // Calculate current week
  const today = new Date();
  const week = startDate
    ? Math.min(12, Math.max(1, Math.ceil((today - startDate) / (7 * 24 * 60 * 60 * 1000))))
    : 1;

  const daysLeft = startDate
    ? Math.max(0, 84 - Math.floor((today - startDate) / (24 * 60 * 60 * 1000)))
    : 84;

  // Current phase
  const phase = PHASES.find(p => p.weeks.includes(week)) || PHASES[0];
  const targetCals = userProfile.tdee - phase.deficit;
  const workoutCalories = todayWorkout?.estimatedCalories || 0;
  const adjustedTargetCals = targetCals + workoutCalories;
  const protein = Math.round(userProfile.weight * 2.2);
  const fat = Math.round(adjustedTargetCals * 0.25 / 9);
  const carbs = Math.round((adjustedTargetCals - protein * 4 - fat * 9) / 4);

  // Consumed macros from meals
  const consumed = meals.reduce((acc, m) => ({
    kcal: acc.kcal + (m.kcal || 0),
    p: acc.p + (m.p || 0),
    c: acc.c + (m.c || 0),
    f: acc.f + (m.f || 0)
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  // Score calculation
  const checkedCount = Object.values(checks).filter(Boolean).length;
  const pct = Math.round((checkedCount / checklistItems.length) * 100);

  // Confetti on 100%
  useEffect(() => {
    if (pct === 100 && confetti.length === 0) {
      const emojis = ['🎉', '⭐', '🔥', '💪', '✨', '🏆'];
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setConfetti(newConfetti);
      setTimeout(() => setConfetti([]), 4000);
    }
  }, [pct]);

  // Weight delta
  const weightDelta = weights.length > 1
    ? (weights[weights.length - 1].value - weights[0].value).toFixed(1)
    : 0;

  // Handlers
  const handleStartSprint = () => {
    const date = setupDate ? new Date(setupDate) : new Date();
    setStartDate(date);
    setShowSetup(false);
  };

  // Sound effects
  const playCheckSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  const playUncheckSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const playCompleteSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    } catch (e) {}
  };

  const handleCheck = (id) => {
    const wasChecked = checks[id];
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
    if (!wasChecked) {
      setStreak(s => s + 1);
      // Check if this completes 100%
      const newChecked = Object.values({ ...checks, [id]: true }).filter(Boolean).length;
      if (newChecked >= checklistItems.length) {
        playCompleteSound();
      } else {
        playCheckSound();
      }
    } else {
      playUncheckSound();
    }
  };

  const handleLogWeight = () => {
    const value = parseFloat(weightInput);
    if (!value || value < 40 || value > 200) return;
    setWeights(prev => [...prev, { date: today.toISOString(), value }]);
    setWeightInput('');
  };

  const handleAddMeal = () => {
    if (!mealForm.name) return;
    setMeals(prev => [...prev, {
      id: Date.now(),
      name: mealForm.name,
      kcal: parseFloat(mealForm.kcal) || 0,
      p: parseFloat(mealForm.p) || 0,
      c: parseFloat(mealForm.c) || 0,
      f: parseFloat(mealForm.f) || 0
    }]);
    setMealForm({ name: '', kcal: '', p: '', c: '', f: '' });
  };

  const handleDeleteMeal = (id) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleQuickPrompt = (prompt) => {
    setChatInput(prompt);
    handleSendMessage(prompt);
  };

  // Generate context for Claude
  const generateClaudeContext = () => {
    const checklistStatus = checklistItems.map(item =>
      `${item.icon} ${item.label}: ${checks[item.id] ? '✓' : '✗'}`
    ).join('\n');

    const mealsStatus = meals.length > 0
      ? meals.map(m => `- ${m.name}: ${m.kcal}kcal, P${m.p}g C${m.c}g F${m.f}g`).join('\n')
      : 'Aucun repas loggé';

    const lastWeight = weights.length > 0 ? weights[weights.length - 1].value : 'non loggé';
    const weightTrend = weights.length > 1
      ? `(${(weights[weights.length - 1].value - weights[0].value).toFixed(1)}kg depuis début)`
      : '';

    const lastComp = bodyCompositions.length > 0
      ? bodyCompositions[bodyCompositions.length - 1]
      : null;

    const compTrend = bodyCompositions.length > 1
      ? {
          fatDelta: (bodyCompositions[bodyCompositions.length - 1].bodyFatPct
                     - bodyCompositions[bodyCompositions.length - 2].bodyFatPct),
          muscleDelta: (bodyCompositions[bodyCompositions.length - 1].skeletalMusclePct
                        - bodyCompositions[bodyCompositions.length - 2].skeletalMusclePct),
          bmrDelta: (bodyCompositions[bodyCompositions.length - 1].bmr || 0)
                    - (bodyCompositions[bodyCompositions.length - 2].bmr || 0)
        }
      : null;

    const compositionBlock = lastComp ? `

🏋️ BODY COMPOSITION (dernière mesure: ${new Date(lastComp.date).toLocaleDateString('fr-FR')}):
- Graisse corporelle: ${lastComp.bodyFatPct}%${compTrend ? ` (delta: ${compTrend.fatDelta > 0 ? '+' : ''}${compTrend.fatDelta.toFixed(1)}%)` : ''}
- Muscle squelettique: ${lastComp.skeletalMusclePct}%${compTrend ? ` (delta: ${compTrend.muscleDelta > 0 ? '+' : ''}${compTrend.muscleDelta.toFixed(1)}%)` : ''}
- BMR mesuré: ${lastComp.bmr || 'N/A'} kcal${compTrend && compTrend.bmrDelta ? ` (delta: ${compTrend.bmrDelta > 0 ? '+' : ''}${compTrend.bmrDelta})` : ''}
- Graisse viscérale: ${lastComp.visceralFat || 'N/A'}/59
- Masse musculaire: ${lastComp.muscleMass || 'N/A'} kg
- Eau corporelle: ${lastComp.bodyWaterPct || 'N/A'}%
- Ratio muscle/gras: ${lastComp.skeletalMusclePct && lastComp.bodyFatPct ? (lastComp.skeletalMusclePct / lastComp.bodyFatPct).toFixed(2) : 'N/A'} (>3.0 = excellent)` : '';

    return `Tu es mon coach fitness ShredOS. Voici mon dashboard en temps réel:

📅 SPRINT: Week ${week}/12 | Phase ${phase.name} | ${daysLeft}j restants
📊 SCORE: ${pct}% (${checkedCount}/8 items aujourd'hui)
🔥 STREAK: ${streak} actions

🎯 TARGETS:
- Calories: ${targetCals}kcal (TDEE ${userProfile.tdee} - deficit ${phase.deficit})
- Protéines: ${protein}g | Glucides: ${carbs}g | Lipides: ${fat}g

📈 CONSOMMÉ AUJOURD'HUI:
- ${consumed.kcal}kcal | P${consumed.p}g C${consumed.c}g F${consumed.f}g
- Restant: ${targetCals - consumed.kcal}kcal | P${protein - consumed.p}g C${carbs - consumed.c}g F${fat - consumed.f}g

✅ CHECKLIST:
${checklistStatus}

🍽️ REPAS:
${mealsStatus}

⚖️ POIDS: ${lastWeight}kg ${weightTrend}
${compositionBlock}

👤 PROFIL: ${userProfile.age} ans, ${userProfile.height}cm, ${userProfile.weight}kg, objectif shred 12 semaines (méthode Paul Revelia)`;
  };

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = views.indexOf(view);
    if (isLeftSwipe && currentIndex < views.length - 1) {
      setView(views[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setView(views[currentIndex - 1]);
    }
  };

  // Reset messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Edit checklist item
  const updateChecklistItem = (id, newLabel) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, label: newLabel } : item
      )
    );
    setEditingItem(null);
  };

  // Delete checklist item
  const deleteChecklistItem = (id) => {
    setChecklistItems(items => items.filter(item => item.id !== id));
    setChecks(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Add checklist item
  const addChecklistItem = (label, category, icon) => {
    if (!label.trim()) return;
    const id = 'custom_' + Date.now();
    setChecklistItems(items => [...items, { id, label: label.trim(), category, icon: icon || '✅' }]);
  };

  // Log body composition
  const handleLogComposition = (data) => {
    const entry = {
      date: new Date().toISOString(),
      source: data.source || 'manual',
      weight: parseFloat(data.weight) || null,
      bodyFatPct: parseFloat(data.bodyFatPct) || null,
      skeletalMusclePct: parseFloat(data.skeletalMusclePct) || null,
      bmr: parseInt(data.bmr) || null,
      bmi: parseFloat(data.bmi) || null,
      fatFreeMass: parseFloat(data.fatFreeMass) || null,
      subcutaneousFatPct: parseFloat(data.subcutaneousFatPct) || null,
      visceralFat: parseInt(data.visceralFat) || null,
      bodyWaterPct: parseFloat(data.bodyWaterPct) || null,
      muscleMass: parseFloat(data.muscleMass) || null,
      boneMass: parseFloat(data.boneMass) || null,
      proteinPct: parseFloat(data.proteinPct) || null,
      metabolicAge: parseInt(data.metabolicAge) || null,
    };

    // Validate essential fields
    if (!entry.weight && !entry.bodyFatPct) return;

    // Replace if same day, otherwise append
    const today = new Date().toDateString();
    setBodyCompositions(prev => {
      const filtered = prev.filter(c => new Date(c.date).toDateString() !== today);
      return [...filtered, entry];
    });

    // Sync weight to weights[] if present
    if (entry.weight && entry.weight >= 40 && entry.weight <= 200) {
      const todayStr = new Date().toDateString();
      const alreadyLogged = weights.some(w => new Date(w.date).toDateString() === todayStr);
      if (!alreadyLogged) {
        setWeights(prev => [...prev, { date: new Date().toISOString(), value: entry.weight }]);
      }
    }

    setShowCompForm(false);
  };

  // Call AI API (Gemini or Claude)
  const callAI = async (prompt) => {
    if (!apiKey) return null;

    setIsLoading(true);
    try {
      if (apiProvider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );
        const data = await response.json();
        setIsLoading(false);
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        return 'Erreur: ' + JSON.stringify(data);
      } else if (apiProvider === 'claude') {
        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, apiKey })
        });
        const data = await response.json();
        setIsLoading(false);
        if (data.error) return 'Erreur Claude: ' + data.error;
        return data.text || null;
      }
    } catch (err) {
      setIsLoading(false);
      return 'Erreur API: ' + err.message;
    }
    return null;
  };

  const copyToClipboard = async (text, successMsg, openClaude = false) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setShowCopySuccess(true);
    setMessages(prev => [...prev, { role: 'ai', content: successMsg }]);

    // Open claude.ai in new tab after short delay
    if (openClaude) {
      setTimeout(() => {
        window.open('https://claude.ai/new', '_blank');
      }, 500);
    }

    setTimeout(() => setShowCopySuccess(false), 2500);
  };

  const copyForClaude = async (question) => {
    const context = generateClaudeContext();
    const q = question || chatInput || 'Comment optimiser mon shred?';
    const prompt = `${context}

---
MA QUESTION: ${q}

Réponds en français, de manière concise et actionnable.`;

    // Try API first
    if (apiKey) {
      setMessages(prev => [...prev, { role: 'user', content: q }]);
      const response = await callAI(prompt);
      if (response) {
        setMessages(prev => [...prev, { role: 'ai', content: response }]);
        return;
      }
    }

    // Fallback to copy/paste
    copyToClipboard(prompt, `📋 Copié! Claude.ai s'ouvre...\n\n→ Colle (Ctrl+V)\n→ Envoie!`, true);
  };

  // 1% Better Every Day - Full coaching prompt
  const copyOneBetterPrompt = async () => {
    const context = generateClaudeContext();
    const prompt = `${context}

---
🎯 MISSION: Analyse mon dashboard ShredOS et donne-moi un feedback "1% Better Every Day".

Format de réponse souhaité:
1. **🏆 WINS** — Ce que j'ai bien fait aujourd'hui (basé sur mes checks et macros)
2. **⚠️ GAPS** — Ce qui manque pour atteindre 100%
3. **🎯 FOCUS DEMAIN** — LA priorité #1 pour demain (1 seule chose)
4. **💪 MOTIVATION** — Un message personnalisé basé sur ma progression W${week}/12

Sois direct, concis, et actionnable. Pas de blabla.`;

    // Try API first
    if (apiKey) {
      setMessages(prev => [...prev, { role: 'user', content: '🚀 1% Better Today' }]);
      const response = await callAI(prompt);
      if (response) {
        setMessages(prev => [...prev, { role: 'ai', content: response }]);
        return;
      }
    }

    // Fallback to copy/paste
    copyToClipboard(prompt, `🚀 Copié! Claude.ai s'ouvre...\n\n→ Colle (Ctrl+V)\n→ Coaching personnalisé!`, true);
  };

  // Photo analysis prompt
  const copyPhotoAnalysisPrompt = () => {
    const context = generateClaudeContext();
    const prompt = `${context}

---
📷 J'uploade une photo de mon repas ci-dessous.

Analyse cette photo et donne-moi:
1. **ESTIMATION MACROS** — Calories, Protéines, Glucides, Lipides (en grammes)
2. **FIT CHECK** — Est-ce que ce repas fit dans mes macros restantes?
   - Restant: ${targetCals - consumed.kcal}kcal | P${protein - consumed.p}g C${carbs - consumed.c}g F${fat - consumed.f}g
3. **VERDICT** — ✅ Parfait / ⚠️ Ajustement suggéré / ❌ Hors budget
4. **SUGGESTION** — Si hors budget, que retirer ou modifier?

Sois précis sur les portions visibles.`;

    copyToClipboard(prompt, `📷 Copié! Claude.ai s'ouvre...\n\n→ Colle (Ctrl+V)\n→ Upload ta photo (📎)\n→ Analyse détaillée!`, true);
  };

  const handleSendMessage = (text = chatInput) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Quick responses for common questions
    setTimeout(() => {
      let response = '';
      const lowerText = text.toLowerCase();

      if (lowerText.includes('manger') || lowerText.includes('repas') || lowerText.includes('quoi')) {
        const remP = protein - consumed.p;
        const remC = carbs - consumed.c;
        const remF = fat - consumed.f;
        response = `Il te reste ${remP}g de protéines, ${remC}g de glucides et ${remF}g de lipides.

Suggestions rapides:
• 🥩 200g poulet grillé + légumes = P46g C5g F4g
• 🥗 Salade grecque + feta = P15g C10g F18g
• 🍳 3 œufs + avocat = P21g C6g F27g

💡 Pour une réponse détaillée, clique "Copier pour Claude.ai"`;
      } else if (lowerText.includes('semaine') || lowerText.includes('analyse') || lowerText.includes('bilan')) {
        response = `📊 Analyse W${week}:

Score actuel: ${pct}%
Phase: ${phase.name} (deficit -${phase.deficit}kcal)
Streak: ${streak} actions

${pct >= 80 ? '✅ Excellente adhérence!' : pct >= 60 ? '⚠️ Adhérence correcte, on peut mieux faire.' : '❌ Adhérence faible, recentre-toi sur les basiques.'}

${!checks.weight ? "📌 Log ton poids chaque matin." : ""}
${!checks.protein ? "📌 Atteins ton objectif protéines." : ""}`;
      } else if (lowerText.includes('sommeil') || lowerText.includes('dormir') || lowerText.includes('sleep')) {
        response = `😴 Objectif sommeil en shred: 7-9h/nuit

Pourquoi c'est crucial:
• Récupération musculaire optimale
• Régulation hormones faim (ghréline/leptine)
• Cortisol bas = meilleure perte de gras

Tips:
• Couche-toi à heure fixe
• Pas d'écran 1h avant
• Chambre fraîche (18-20°C)`;
      } else if (lowerText.includes('motivation') || lowerText.includes('dur') || lowerText.includes('difficile')) {
        response = `💪 W${week}/12 - Tu es à ${Math.round((week/12)*100)}% du chemin!

${pct >= 50 ? `Score ${pct}% aujourd'hui - continue!` : `Score ${pct}% - chaque petit pas compte.`}

Rappel: C'est un marathon, pas un sprint.
La constance bat l'intensité.

"Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment, c'est maintenant."`;
      } else if (lowerText.includes('eau') || lowerText.includes('hydrat') || lowerText.includes('boire')) {
        response = `💧 Objectif: 3L/jour minimum

Pourquoi en shred:
• Métabolisme optimal
• Satiété (moins de fringales)
• Performance training

Tips:
• 500ml au réveil
• Bouteille toujours visible
• 1 verre avant chaque repas`;
      } else {
        response = `Je vois ton dashboard: W${week}, ${pct}%, ${consumed.kcal}/${targetCals}kcal.

Pour une réponse complète à "${text.slice(0, 30)}...", clique le bouton ci-dessous pour copier le contexte dans Claude.ai (ton abo Max).`;
      }

      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    }, 500);
  };

  // Camera handling
  const startCamera = async () => {
    // On mobile, use native file picker with capture for better compatibility
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Use file input with capture attribute for native camera
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
      }
      return;
    }

    // On desktop, try getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Camera error:', err);
      // Fallback to file picker
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    canvas.toBlob(blob => {
      processPhoto(blob);
    }, 'image/jpeg', 0.8);

    stopCamera();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processPhoto(file);
    }
  };

  const processPhoto = async (blob) => {
    const userMsg = { role: 'user', content: '📷 [Photo repas envoyée]' };
    setMessages(prev => [...prev, userMsg]);
    setView('ai'); // Switch to coach view

    // If Gemini API key is set, use it to analyze the photo
    if (apiKey && apiProvider === 'gemini') {
      setIsLoading(true);
      try {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];

          const prompt = `Analyse cette photo de repas et réponds UNIQUEMENT avec ce format JSON (rien d'autre):
{"name": "nom descriptif du repas", "kcal": nombre, "p": grammes_proteines, "c": grammes_glucides, "f": grammes_lipides}

Règles:
- "name" doit décrire ce que tu vois concrètement (ex: "Poulet grillé + riz basmati + brocolis", "Salade César avec parmesan", "Omelette 3 oeufs + avocat"). Ne mets JAMAIS "Repas 1" ou un nom générique.
- Estime les macros basé sur les portions visibles. Sois réaliste.`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: prompt },
                    { inline_data: { mime_type: 'image/jpeg', data: base64data } }
                  ]
                }]
              })
            }
          );

          const data = await response.json();
          setIsLoading(false);

          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            // Try to parse JSON from response
            try {
              const meal = parseAIJSON(text);
              if (meal) {
                const detectedMeal = {
                  id: Date.now(),
                  name: meal.name && meal.name !== 'Repas 1' ? `📷 ${meal.name}` : '📷 Repas photo',
                  kcal: parseInt(meal.kcal) || 0,
                  p: parseInt(meal.p) || 0,
                  c: parseInt(meal.c) || 0,
                  f: parseInt(meal.f) || 0
                };
                setMeals(prev => [...prev, detectedMeal]);

                const aiResponse = `📸 Repas analysé et ajouté automatiquement!

${detectedMeal.name}
• ${detectedMeal.kcal} kcal
• P: ${detectedMeal.p}g | C: ${detectedMeal.c}g | F: ${detectedMeal.f}g

✅ Ajouté dans "Repas aujourd'hui"

Restant: ${targetCals - consumed.kcal - detectedMeal.kcal} kcal | P${protein - consumed.p - detectedMeal.p}g`;
                setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
                return;
              }
            } catch (e) {
              // JSON parse failed, show raw response
              setMessages(prev => [...prev, { role: 'ai', content: text }]);
              return;
            }
          }
          setMessages(prev => [...prev, { role: 'ai', content: '❌ Erreur analyse photo' }]);
        };
        return;
      } catch (err) {
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'ai', content: '❌ Erreur: ' + err.message }]);
        return;
      }
    }

    // Fallback: simulated analysis
    setTimeout(() => {
      const detectedMeal = {
        name: '🍗 Repas (estimation)',
        kcal: 450,
        p: 35,
        c: 40,
        f: 15
      };
      setMeals(prev => [...prev, { id: Date.now(), ...detectedMeal }]);

      const response = `📸 Repas estimé (sans API):

${detectedMeal.name}
• ${detectedMeal.kcal} kcal (estimation)

💡 Configure une clé API Gemini (gratuit) dans ⚙️ pour une vraie analyse!`;
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    }, 1000);
  };

  // Process Renpho screenshot via Gemini Vision OCR
  const processRenphoPhoto = async (blob) => {
    if (!apiKey || apiProvider !== 'gemini') {
      setRenphoScanError('Configure une clé API Gemini dans ⚙️ pour scanner');
      return;
    }

    setIsLoading(true);
    setRenphoScanError(null);
    setRenphoScanResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: RENPHO_OCR_PROMPT },
                  { inline_data: { mime_type: 'image/jpeg', data: base64data } }
                ]
              }]
            })
          }
        );

        const data = await response.json();
        setIsLoading(false);

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text;
          try {
            const parsed = parseAIJSON(text);
            if (parsed) {
              if (parsed.error) {
                setRenphoScanError(parsed.error);
              } else {
                setRenphoScanResult(parsed);
              }
              return;
            }
          } catch (e) {
            // JSON parse failed
          }
          setRenphoScanError('Impossible de lire les données. Essaie la saisie manuelle.');
        } else {
          setRenphoScanError('Erreur API: pas de réponse');
        }
      };
    } catch (err) {
      setIsLoading(false);
      setRenphoScanError('Erreur: ' + err.message);
    }
  };

  const handleRenphoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processRenphoPhoto(file);
    }
  };

  // Copy meal photo prompt for Claude.ai
  const copyMealPhotoPrompt = () => {
    copyToClipboard(MEAL_PHOTO_PROMPT, `📷 Copié! Claude.ai s'ouvre...\n\n→ Colle (Ctrl+V)\n→ Upload ta photo (📎)\n→ Copie la réponse JSON!`, true);
  };

  // Parse pasted AI meal response
  const handlePasteMeal = (text) => {
    const meal = parseAIJSON(text);
    if (meal && meal.name) {
      const newMeal = {
        id: Date.now(),
        name: `📋 ${meal.name}`,
        kcal: parseInt(meal.kcal) || 0,
        p: parseInt(meal.p) || 0,
        c: parseInt(meal.c) || 0,
        f: parseInt(meal.f) || 0
      };
      setMeals(prev => [...prev, newMeal]);
      return newMeal;
    }
    return null;
  };

  // Workout handlers
  const copyWorkoutPrompt = () => {
    copyToClipboard(WORKOUT_PROMPT, `🏋️ Copié! Claude.ai s'ouvre...\n\n→ Colle (Ctrl+V)\n→ Ajoute tes données workout\n→ Copie la réponse JSON!`, true);
  };

  const handlePasteWorkout = (text) => {
    const workout = parseAIJSON(text);
    if (workout && workout.exercises && workout.exercises.length > 0) {
      const entry = {
        ...workout,
        date: new Date().toISOString(),
        source: workout.source || 'claude'
      };
      setTodayWorkout(entry);
      return entry;
    }
    return null;
  };

  const handleImportWorkoutCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = parseWorkoutCSV(ev.target.result);
      if (result) {
        const entry = { ...result, date: new Date().toISOString() };
        setTodayWorkout(entry);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const clearTodayWorkout = () => {
    setTodayWorkout(null);
  };

  // User profile handler
  const updateUserProfile = (field, value) => {
    setUserProfile(prev => {
      const next = { ...prev, [field]: value };
      if (next.autoTDEE && ['weight', 'height', 'age', 'activity', 'autoTDEE'].includes(field)) {
        next.tdee = calcTDEE(next.weight, next.height, next.age, next.activity);
      }
      return next;
    });
  };

  // Sprint photos handlers
  const handleSprintPhotoBefore = (base64) => {
    setSprintPhotos(prev => ({ ...prev, before: base64 }));
  };

  const handleSprintPhotoAfter = (base64) => {
    setSprintPhotos(prev => ({ ...prev, after: base64 }));
  };

  const handleSaveAiComparison = (json) => {
    setSprintPhotos(prev => ({ ...prev, aiComparison: json }));
  };

  // Sprint completed?
  const isSprintCompleted = startDate && daysLeft === 0;

  const handleNewSprint = () => {
    setSprintPhotos({ before: null, after: null, aiComparison: null });
    setStartDate(null);
    setChecks({});
    setWeights([]);
    setMeals([]);
    setMealHistory({});
    setTodayWorkout(null);
    setWorkoutHistory({});
    setBodyCompositions([]);
    setMessages([]);
    setStreak(0);
    setShowSetup(true);
    localStorage.removeItem('shredos');
  };

  const handleReset = () => {
    if (confirm('R\u00e9initialiser le sprint? Toutes les donn\u00e9es seront effac\u00e9es.')) {
      handleNewSprint();
    }
  };

  const handleExportJSON = () => {
    const data = localStorage.getItem('shredos');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shredos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    // State
    view, setView, startDate, showSetup, setShowSetup, setupDate, setSetupDate,
    checks, weights, weightInput, setWeightInput, streak,
    messages, chatInput, setChatInput, meals, mealHistory, mealForm, setMealForm,
    showCamera, confetti, showSettings, setShowSettings,
    apiKey, setApiKey, apiProvider, setApiProvider, isLoading,
    checklistItems, editingItem, setEditingItem,
    showCopySuccess,
    bodyCompositions, showCompForm, setShowCompForm, handleLogComposition,
    showRenphoScan, setShowRenphoScan, renphoScanResult, setRenphoScanResult,
    renphoScanError, setRenphoScanError, processRenphoPhoto, handleRenphoFileSelect, renphoFileRef,
    // User profile
    userProfile, updateUserProfile,
    // Sprint photos
    sprintPhotos, handleSprintPhotoBefore, handleSprintPhotoAfter, handleSaveAiComparison,
    isSprintCompleted, handleNewSprint,
    // Refs
    videoRef, streamRef, fileInputRef,
    // Computed
    today, week, daysLeft, phase, targetCals, adjustedTargetCals, workoutCalories,
    protein, fat, carbs, consumed, checkedCount, pct, weightDelta,
    // Handlers
    handleStartSprint, handleCheck, handleLogWeight, handleAddMeal, handleDeleteMeal,
    handleQuickPrompt, handleSendMessage, onTouchStart, onTouchMove, onTouchEnd,
    clearMessages, updateChecklistItem, deleteChecklistItem, addChecklistItem,
    // AI
    generateClaudeContext, copyForClaude, copyOneBetterPrompt, copyPhotoAnalysisPrompt,
    copyMealPhotoPrompt, handlePasteMeal,
    // Workout
    todayWorkout, workoutHistory, workoutFileRef,
    copyWorkoutPrompt, handlePasteWorkout, handleImportWorkoutCSV, clearTodayWorkout,
    // Camera
    startCamera, stopCamera, capturePhoto, handleFileSelect, handleReset,
    // Export
    handleExportJSON,
  };
}
