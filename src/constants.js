export const PHASES = [
  { name: 'IGNITION', weeks: [1,2,3,4], deficit: 300, color: '#22d3ee' },
  { name: 'BURN', weeks: [5,6,7,8], deficit: 400, color: '#f59e0b' },
  { name: 'SHRED', weeks: [9,10,11,12], deficit: 500, color: '#ef4444' }
];

export const DEFAULT_CHECKLIST = [
  { id: 'weight', label: 'Poids du jour', category: 'TRACK', icon: '⚖️' },
  { id: 'photos', label: 'Photos progress', category: 'TRACK', icon: '📸' },
  { id: 'calories', label: 'Calories trackées', category: 'EAT', icon: '🔥' },
  { id: 'protein', label: 'Objectif protéines', category: 'EAT', icon: '🥩' },
  { id: 'steps', label: '10k steps', category: 'MOVE', icon: '👟' },
  { id: 'workout', label: 'Training done', category: 'MOVE', icon: '🏋️' },
  { id: 'sleep', label: '7h+ sommeil', category: 'REST', icon: '😴' },
  { id: 'water', label: '3L eau', category: 'REST', icon: '💧' }
];

export const CATEGORIES = ['TRACK', 'EAT', 'MOVE', 'REST'];

export const USER = { tdee: 2752, weight: 96, height: 190, age: 57 };

export const COMPOSITION_FIELDS = {
  essential: [
    { key: 'weight', label: 'Poids', unit: 'kg', icon: '⚖️' },
    { key: 'bodyFatPct', label: 'Graisse corporelle', unit: '%', icon: '🔻' },
    { key: 'skeletalMusclePct', label: 'Muscle squelettique', unit: '%', icon: '💪' },
    { key: 'bmr', label: 'Métabolisme de base', unit: 'kcal', icon: '🔥' }
  ],
  secondary: [
    { key: 'bmi', label: 'IMC', unit: '' },
    { key: 'fatFreeMass', label: 'Masse maigre', unit: 'kg' },
    { key: 'subcutaneousFatPct', label: 'Gras sous-cutané', unit: '%' },
    { key: 'visceralFat', label: 'Graisse viscérale', unit: '/59' },
    { key: 'bodyWaterPct', label: 'Eau corporelle', unit: '%' },
    { key: 'muscleMass', label: 'Masse musculaire', unit: 'kg' },
    { key: 'boneMass', label: 'Masse osseuse', unit: 'kg' },
    { key: 'proteinPct', label: 'Protéines', unit: '%' },
    { key: 'metabolicAge', label: 'Âge métabolique', unit: 'ans' }
  ]
};

export const COMPOSITION_RANGES = {
  weight:             { min: 40,   max: 200,  decimals: 2 },
  bodyFatPct:         { min: 3,    max: 60,   decimals: 1 },
  skeletalMusclePct:  { min: 20,   max: 70,   decimals: 1 },
  bmr:                { min: 800,  max: 4000, decimals: 0 },
  bmi:                { min: 10,   max: 50,   decimals: 1 },
  fatFreeMass:        { min: 30,   max: 150,  decimals: 2 },
  subcutaneousFatPct: { min: 2,    max: 50,   decimals: 1 },
  visceralFat:        { min: 1,    max: 59,   decimals: 0 },
  bodyWaterPct:       { min: 35,   max: 75,   decimals: 1 },
  muscleMass:         { min: 20,   max: 120,  decimals: 2 },
  boneMass:           { min: 1,    max: 8,    decimals: 2 },
  proteinPct:         { min: 5,    max: 30,   decimals: 1 },
  metabolicAge:       { min: 15,   max: 99,   decimals: 0 }
};

export const RENPHO_OCR_PROMPT = `Tu es un extracteur de données OCR spécialisé pour les screenshots de l'app Renpho (balance connectée).

Analyse cette image et extrais TOUTES les métriques de composition corporelle visibles.

L'app Renpho affiche typiquement ces champs (en français ou anglais):
- Poids / Weight (kg)
- IMC / BMI
- Graisse corporelle / Body Fat (%)
- Muscle squelettique / Skeletal Muscle (%)
- Poids hors masse grasse / Fat-Free Body Weight (kg)
- Gras sous-cutané / Subcutaneous Fat (%)
- Graisse viscérale / Visceral Fat (score 1-59)
- Eau Corporelle / Body Water (%)
- Masse musculaire / Muscle Mass (kg)
- Masse osseuse / Bone Mass (kg)
- Protéines / Protein (%)
- Métabolisme de base / BMR (kcal)
- Âge métabolique / Metabolic Age

Réponds UNIQUEMENT avec ce format JSON (rien d'autre, pas de markdown, pas de commentaires):
{"weight":nombre_ou_null,"bmi":nombre_ou_null,"bodyFatPct":nombre_ou_null,"skeletalMusclePct":nombre_ou_null,"fatFreeMass":nombre_ou_null,"subcutaneousFatPct":nombre_ou_null,"visceralFat":nombre_ou_null,"bodyWaterPct":nombre_ou_null,"muscleMass":nombre_ou_null,"boneMass":nombre_ou_null,"proteinPct":nombre_ou_null,"bmr":nombre_ou_null,"metabolicAge":nombre_ou_null}

Règles:
- Utilise null pour les champs non visibles dans l'image
- Les nombres doivent être des nombres, pas des strings
- Le poids en kg, le BMR en kcal
- Ignore les deltas affichés (ex: "+0.1"), ne garde que la valeur principale
- Si l'image n'est pas un screenshot Renpho, retourne {"error": "Image non reconnue comme screenshot Renpho"}`;
