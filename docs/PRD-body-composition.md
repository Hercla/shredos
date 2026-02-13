# PRD - Body Composition Tracking (Renpho Integration)

**Version:** 1.0
**Date:** 2026-02-09
**Auteur:** ShredOS Product Team
**Statut:** Draft
**Feature:** Body Composition Logging via Renpho Screenshot OCR + Manual Input

---

## 1. Objectif

### Pourquoi cette feature est critique pour le shred

Actuellement, ShredOS ne track qu'un seul chiffre : le poids brut. Or, pendant un shred de 12 semaines avec deficit calorique progressif (methode Paul Revelia), **le poids seul est trompeur** :

- Un plateau de poids peut masquer une **recomposition corporelle** (perte de gras + gain musculaire simultane).
- Sans le % de graisse corporelle, le coach IA ne peut pas distinguer une "bonne" prise de 0.5 kg (muscle) d'une "mauvaise" (gras).
- Le metabolisme de base (BMR) change au fil du shred. Si l'app connait le BMR reel mesure par la balance, elle peut **ajuster dynamiquement les targets caloriques** au lieu de se baser sur un TDEE fixe de 2752 kcal.
- La masse musculaire squelettique (54.5%) et le taux de proteines (19.2%) sont des indicateurs directs de l'efficacite du protocole : deficit trop agressif = perte musculaire, deficit correct = preservation musculaire.
- La graisse viscerale (score 9) est un indicateur de sante metabolique plus important que le poids sur la balance.

### Impact concret

| Metrique | Avant | Apres |
|----------|-------|-------|
| Donnees poids | 1 nombre (96.35 kg) | 13 metriques de composition corporelle |
| Contexte coach IA | "Poids: 96.35 kg" | Analyse complete gras/muscle/eau/os/metabolisme |
| Decisions macro | Basees sur TDEE fixe | Basees sur BMR reel mesure + tendances composition |
| Detection plateau | Uniquement poids | Differenciation plateau gras vs recomp |

---

## 2. User Stories

### US-1 : Log par photo (flow principal)

**En tant que** utilisateur qui se pese chaque matin sur sa Renpho,
**je veux** prendre une photo / uploader un screenshot de l'app Renpho,
**afin que** toutes mes metriques de composition soient automatiquement extraites et loguees.

**Criteres d'acceptation :**
- [ ] Bouton "Scanner Renpho" visible sur le dashboard (pres de la carte poids actuelle)
- [ ] Supporte camera directe (mobile) et upload galerie (mobile + desktop)
- [ ] Gemini Vision extrait au minimum : poids, graisse corporelle %, muscle squelettique %, masse musculaire kg, BMR kcal
- [ ] Affiche un ecran de confirmation avec les valeurs extraites AVANT de sauvegarder (l'utilisateur peut corriger)
- [ ] En cas d'echec OCR, propose le fallback saisie manuelle pre-remplie avec les valeurs detectees
- [ ] Les donnees sont sauvegardees dans localStorage avec la date

### US-2 : Log manuel (fallback)

**En tant que** utilisateur,
**je veux** saisir manuellement mes metriques de composition corporelle,
**afin de** pouvoir logger mes donnees meme sans photo ou si l'OCR echoue.

**Criteres d'acceptation :**
- [ ] Formulaire de saisie manuelle accessible en 1 tap depuis le dashboard
- [ ] Champs pre-organises par categories (essentiels vs secondaires)
- [ ] Les champs essentiels sont : poids, graisse corporelle %, muscle squelettique %, BMR
- [ ] Les champs secondaires (accordeon) : masse musculaire, masse osseuse, eau corporelle, graisse viscerale, gras sous-cutane, proteines %, age metabolique, IMC, poids hors masse grasse
- [ ] Validation des ranges (ex: graisse corporelle 3-60%, BMR 800-4000 kcal)
- [ ] Auto-remplissage du poids dans le champ existant de WeightChart

### US-3 : Visualisation composition sur le dashboard

**En tant que** utilisateur,
**je veux** voir mes metriques cles de composition sur mon dashboard,
**afin de** suivre ma progression au-dela du simple poids.

**Criteres d'acceptation :**
- [ ] Nouvelle carte "BODY COMPOSITION" sur le dashboard, placee juste en dessous de la carte poids
- [ ] Affiche les 4 metriques cles : graisse corporelle %, muscle squelettique %, BMR, graisse viscerale
- [ ] Delta affiche par rapport a la mesure precedente (ex: "+0.1%" en rouge, "-0.3%" en vert)
- [ ] Code couleur : gras en baisse = vert, muscle en hausse = vert, inverse = orange/rouge
- [ ] Date de la derniere mesure affichee

### US-4 : Tendances composition corporelle

**En tant que** utilisateur,
**je veux** voir l'evolution de ma composition corporelle dans le temps,
**afin de** detecter les tendances (recomp, plateau, perte musculaire).

**Criteres d'acceptation :**
- [ ] Graphique multi-lignes (graisse % + muscle %) sous la carte body composition
- [ ] Les courbes partagent le meme axe X (dates) mais des axes Y distincts
- [ ] Au minimum 2 entrees pour afficher le graphique
- [ ] Graisse en cyan descendant, muscle en indigo montant (palette ShredOS)
- [ ] Hover/tap sur un point = tooltip avec toutes les metriques de ce jour

### US-5 : Coach IA enrichi avec composition

**En tant que** utilisateur qui consulte le coach IA,
**je veux** que le coach ait acces a mes donnees de composition corporelle,
**afin qu'il** puisse me donner des conseils macro/training plus precis.

**Criteres d'acceptation :**
- [ ] La fonction `generateClaudeContext()` inclut les dernieres metriques de composition
- [ ] Le coach peut detecter une perte musculaire et recommander d'augmenter les proteines
- [ ] Le coach utilise le BMR reel au lieu du TDEE fixe pour affiner les recommandations caloriques
- [ ] Le prompt "1% Better Today" integre l'analyse composition (ex: "Ton muscle est stable a 54.5%, bon signe")

---

## 3. Data Model

### 3.1 Structure d'une entree composition

```javascript
// Une entree de body composition
{
  date: "2026-02-09T07:30:00.000Z",  // ISO string, date de la mesure
  source: "photo" | "manual",         // methode de saisie

  // --- Metriques essentielles (toujours presentes) ---
  weight: 96.35,           // kg - poids total
  bodyFatPct: 15.6,        // % - graisse corporelle
  skeletalMusclePct: 54.5, // % - muscle squelettique
  bmr: 2118,               // kcal - metabolisme de base

  // --- Metriques secondaires (optionnelles, null si non saisies) ---
  bmi: 26.7,               // IMC
  fatFreeMass: 81.32,      // kg - poids hors masse grasse
  subcutaneousFatPct: 13.0,// % - gras sous-cutane
  visceralFat: 9,          // score 1-59
  bodyWaterPct: 60.9,      // % - eau corporelle totale
  muscleMass: 77.27,       // kg - masse musculaire
  boneMass: 4.05,          // kg - masse osseuse
  proteinPct: 19.2,        // % - proteines
  metabolicAge: 57         // ans - age metabolique
}
```

### 3.2 Validation des ranges

```javascript
const COMPOSITION_RANGES = {
  weight:             { min: 40,   max: 200,  unit: 'kg',    decimals: 2 },
  bodyFatPct:         { min: 3,    max: 60,   unit: '%',     decimals: 1 },
  skeletalMusclePct:  { min: 20,   max: 70,   unit: '%',     decimals: 1 },
  bmr:                { min: 800,  max: 4000, unit: 'kcal',  decimals: 0 },
  bmi:                { min: 10,   max: 50,   unit: '',      decimals: 1 },
  fatFreeMass:        { min: 30,   max: 150,  unit: 'kg',    decimals: 2 },
  subcutaneousFatPct: { min: 2,    max: 50,   unit: '%',     decimals: 1 },
  visceralFat:        { min: 1,    max: 59,   unit: '',      decimals: 0 },
  bodyWaterPct:       { min: 35,   max: 75,   unit: '%',     decimals: 1 },
  muscleMass:         { min: 20,   max: 120,  unit: 'kg',    decimals: 2 },
  boneMass:           { min: 1,    max: 8,    unit: 'kg',    decimals: 2 },
  proteinPct:         { min: 5,    max: 30,   unit: '%',     decimals: 1 },
  metabolicAge:       { min: 15,   max: 99,   unit: 'ans',   decimals: 0 }
};
```

### 3.3 localStorage structure

Le stockage actuel sous la cle `'shredos'` est enrichi :

```javascript
// Avant
{
  startDate, checks, weights, streak, messages, meals, mealsDate,
  apiKey, apiProvider, checklistItems
}

// Apres
{
  startDate, checks, weights, streak, messages, meals, mealsDate,
  apiKey, apiProvider, checklistItems,

  // NOUVEAU
  bodyCompositions: [
    { date: "2026-02-09T...", source: "photo", weight: 96.35, bodyFatPct: 15.6, ... },
    { date: "2026-02-08T...", source: "manual", weight: 96.10, bodyFatPct: 15.5, ... }
  ]
}
```

**Notes :**
- Le tableau `bodyCompositions` est ordonne par date (le plus recent en dernier, comme `weights`).
- Maximum 84 entrees (1 par jour pendant 12 semaines). Pas de purge necessaire.
- Quand une composition est loguee, le poids est automatiquement ajoute au tableau `weights` existant pour maintenir la retro-compatibilite du graphique poids.
- Une seule entree par jour. Si l'utilisateur rescanne le meme jour, la derniere entree remplace la precedente.

---

## 4. UI/UX

### 4.1 Dashboard - Placement des elements

L'ordre des cartes sur le dashboard (DashboardView.jsx) devient :

1. **SCORE DU JOUR** (existant, inchange)
2. **MACROS - LIVE TRACKER** (existant, inchange)
3. **COURBE DE POIDS** (existant, enrichi)
4. **BODY COMPOSITION** (NOUVEAU) -- nouvelle carte
5. **TIMELINE** (existant, inchange)
6. **Sprint info** (existant, inchange)

### 4.2 Carte poids enrichie

La carte poids existante (`WeightChart.jsx`) est enrichie :
- Le bouton "Log" existant reste pour le log rapide du poids seul.
- Un nouveau bouton "Scanner Renpho" est ajoute a cote du bouton "Log".
- Ce bouton ouvre le flow photo/saisie manuelle complet.

```
[ Input poids: 96.35 ]  [Log]  [Scanner Renpho]
```

### 4.3 Nouvelle carte BODY COMPOSITION

Design de la carte (meme style que les cartes existantes) :

```
+------------------------------------------+
| BODY COMPOSITION          09 fev. 07:30  |
|                                          |
|  Graisse     Muscle      BMR     Visc.   |
|  15.6%       54.5%       2118    9       |
|  +0.1 !!     -0.1 !!     +9      =      |
|  (rouge)     (orange)    (vert)  (gris)  |
|                                          |
|  [--- Graphique dual-line ---]           |
|  [--- Graisse % (cyan) ---]             |
|  [--- Muscle % (indigo) ---]            |
|                                          |
|  Derniere mesure: Aujourd'hui 07:30      |
+------------------------------------------+
```

**Regles de couleur pour les deltas :**
- Graisse en baisse : `#22c55e` (vert) -- bon signe
- Graisse en hausse : `#ef4444` (rouge) -- attention
- Muscle en hausse : `#22c55e` (vert) -- bon signe
- Muscle en baisse : `#f59e0b` (orange) -- alarme
- BMR en hausse : `#22c55e` (vert) -- bon signe
- Graisse viscerale stable/baisse : `#64748b` (gris neutre)
- Graisse viscerale en hausse : `#ef4444` (rouge)

### 4.4 Flow de scan Renpho (photo)

1. **Tap "Scanner Renpho"** depuis la carte poids
2. **Choix de la source** : Camera / Galerie (reutilise le meme pattern que la photo repas dans CoachView)
3. **Envoi a Gemini Vision** avec prompt OCR specialise
4. **Ecran de confirmation** : toutes les valeurs extraites sont affichees dans un formulaire editable
   - Les champs remplis sont sur fond vert leger
   - Les champs non detectes sont vides (saisissables)
   - Bouton "Valider" pour sauvegarder
   - Bouton "Annuler" pour quitter
5. **Sauvegarde** : ajout dans `bodyCompositions[]` + sync avec `weights[]`

### 4.5 Flow de saisie manuelle

1. **Tap "Scanner Renpho"** > Bouton "Saisie manuelle" en bas de l'ecran photo (ou echec OCR)
2. **Formulaire en 2 sections** :
   - **Essentiels** (toujours visibles) : Poids, Graisse %, Muscle squelettique %, BMR
   - **Secondaires** (accordeon "Plus de details") : les 9 autres metriques
3. **Validation** : ranges respectes, au moins poids + graisse % remplis
4. **Sauvegarde** : identique au flow photo

### 4.6 Modal / Overlay

Le scan Renpho utilise un **overlay fullscreen** (meme pattern que `setup-overlay` et `settings-overlay` existants) plutot qu'une navigation vers une nouvelle page. Cela garde le contexte du dashboard visible en arriere-plan.

---

## 5. AI Integration

### 5.1 Enrichissement du contexte coach

La fonction `generateClaudeContext()` dans `useShredOS.js` (ligne 182) est modifiee pour inclure la composition :

```javascript
// AJOUT dans generateClaudeContext()
const lastComposition = bodyCompositions.length > 0
  ? bodyCompositions[bodyCompositions.length - 1]
  : null;

const compositionTrend = bodyCompositions.length > 1
  ? {
      fatDelta: (bodyCompositions[bodyCompositions.length - 1].bodyFatPct
                 - bodyCompositions[bodyCompositions.length - 2].bodyFatPct).toFixed(1),
      muscleDelta: (bodyCompositions[bodyCompositions.length - 1].skeletalMusclePct
                    - bodyCompositions[bodyCompositions.length - 2].skeletalMusclePct).toFixed(1),
      bmrDelta: bodyCompositions[bodyCompositions.length - 1].bmr
                - bodyCompositions[bodyCompositions.length - 2].bmr
    }
  : null;
```

Nouveau bloc dans le prompt contexte :

```
BODY COMPOSITION (derniere mesure: {date}):
- Graisse corporelle: {bodyFatPct}% (delta: {fatDelta}%)
- Muscle squelettique: {skeletalMusclePct}% (delta: {muscleDelta}%)
- Masse musculaire: {muscleMass} kg
- BMR mesure: {bmr} kcal (delta: {bmrDelta} kcal)
- Graisse viscerale: {visceralFat}/59
- Eau corporelle: {bodyWaterPct}%
- Proteines: {proteinPct}%
- Age metabolique: {metabolicAge} ans
- IMC: {bmi}

ANALYSE COMPOSITION:
- Ratio muscle/gras: {skeletalMusclePct / bodyFatPct} (>3.0 = excellent, >2.5 = bon)
- BMR mesure vs TDEE fixe: {bmr} vs {USER.tdee} (ecart: {delta} kcal)
- Tendance sur {n} mesures: gras {direction}, muscle {direction}
```

### 5.2 Impact sur les recommandations macro

Le coach IA recevra les signaux suivants pour affiner ses reponses :

| Signal | Interpretation IA | Recommandation attendue |
|--------|-------------------|------------------------|
| Graisse en baisse + muscle stable | Shred optimal | "Continue comme ca, maintiens les proteines" |
| Graisse en baisse + muscle en baisse | Deficit trop agressif | "Augmente les proteines a 2.4g/kg, reduis le deficit de 100 kcal" |
| Graisse stable + muscle en hausse | Recomposition | "Recomp en cours, ignore le plateau de poids" |
| Graisse en hausse | Surplus calorique | "Verifie tes portions, tu es probablement au-dessus du deficit" |
| BMR en baisse significative (>50 kcal) | Adaptation metabolique | "Envisage un refeed ou une diet break de 1-2 jours" |
| Graisse viscerale en hausse | Risque sante | "Priorise le cardio LISS et reduis l'alcool" |

### 5.3 BMR dynamique (Nice-to-have)

Si le BMR reel est disponible, le coach peut le comparer au TDEE fixe (2752 kcal) et suggerer des ajustements :

```
BMR mesure: 2118 kcal
TDEE estime (x1.3 facteur activite): 2118 * 1.3 = 2753 kcal  -- tres proche du 2752 actuel
Si BMR descend a 2000: TDEE re-estime = 2600 kcal -> deficit reel change
```

---

## 6. Photo OCR Flow (Gemini Vision)

### 6.1 Architecture du flow

```
[Photo Renpho]
    |
    v
[Base64 encode]
    |
    v
[Gemini 1.5 Flash Vision API] <-- prompt OCR specialise
    |
    v
[JSON response parsing]
    |
    v
[Ecran confirmation editable]
    |
    v
[Sauvegarde localStorage]
```

### 6.2 Prompt OCR optimise pour Renpho

```javascript
const RENPHO_OCR_PROMPT = `Tu es un extracteur de donnees OCR specialise pour les screenshots de l'app Renpho (balance connectee).

Analyse cette image et extrais TOUTES les metriques de composition corporelle visibles.

L'app Renpho affiche typiquement ces champs (en francais ou anglais):
- Poids / Weight (kg)
- IMC / BMI
- Graisse corporelle / Body Fat (%)
- Muscle squelettique / Skeletal Muscle (%)
- Poids hors masse grasse / Fat-Free Body Weight (kg)
- Gras sous-cutane / Subcutaneous Fat (%)
- Graisse viscerale / Visceral Fat (score 1-59)
- Eau Corporelle / Body Water (%)
- Masse musculaire / Muscle Mass (kg)
- Masse osseuse / Bone Mass (kg)
- Proteines / Protein (%)
- Metabolisme de base / BMR (kcal)
- Age metabolique / Metabolic Age

Reponds UNIQUEMENT avec ce format JSON (rien d'autre, pas de markdown, pas de commentaires):
{
  "weight": nombre_ou_null,
  "bmi": nombre_ou_null,
  "bodyFatPct": nombre_ou_null,
  "skeletalMusclePct": nombre_ou_null,
  "fatFreeMass": nombre_ou_null,
  "subcutaneousFatPct": nombre_ou_null,
  "visceralFat": nombre_ou_null,
  "bodyWaterPct": nombre_ou_null,
  "muscleMass": nombre_ou_null,
  "boneMass": nombre_ou_null,
  "proteinPct": nombre_ou_null,
  "bmr": nombre_ou_null,
  "metabolicAge": nombre_ou_null
}

Regles:
- Utilise null pour les champs non visibles dans l'image
- Les nombres doivent etre des nombres, pas des strings
- Le poids en kg, le BMR en kcal
- Ignore les deltas affiches (ex: "+0.1"), ne garde que la valeur principale
- Si l'image n'est pas un screenshot Renpho, retourne {"error": "Image non reconnue comme screenshot Renpho"}`;
```

### 6.3 Implementation technique (reutilise le pattern existant)

Le flow est quasi-identique a `processPhoto()` (ligne 535 de useShredOS.js) qui analyse deja les photos de repas via Gemini Vision. La seule difference :
- Prompt different (OCR au lieu d'estimation macros)
- Parsing JSON different (13 champs composition au lieu de 5 champs repas)
- Destination differente (bodyCompositions[] au lieu de meals[])

```javascript
// Meme appel API que processPhoto, seul le prompt change
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
```

### 6.4 Gestion des erreurs OCR

| Cas | Comportement |
|-----|-------------|
| Gemini retourne un JSON valide | Afficher ecran confirmation editable |
| Gemini retourne un JSON partiel (certains champs null) | Afficher ecran confirmation, champs null vides et editables |
| Gemini retourne `{"error": "..."}` | Message "Image non reconnue" + proposer saisie manuelle |
| Gemini retourne du texte non-JSON | Tenter regex extraction comme pour les repas + fallback saisie manuelle |
| Erreur reseau / API | Message erreur + proposer saisie manuelle |
| Pas de cle API Gemini | Directement proposer saisie manuelle |

---

## 7. Technical Implementation

### 7.1 Fichiers a modifier

| Fichier | Modifications | Lignes estimees |
|---------|--------------|-----------------|
| `src/constants.js` | Ajouter `COMPOSITION_RANGES`, `COMPOSITION_FIELDS` (labels, categories) | +40 lignes |
| `src/hooks/useShredOS.js` | State `bodyCompositions`, load/save localStorage, handlers `handleLogComposition`, `processRenphoPhoto`, enrichir `generateClaudeContext()` | +120 lignes |
| `src/components/DashboardView.jsx` | Importer et placer `BodyCompositionCard`, passer props, ajouter bouton scanner dans zone poids | +15 lignes |
| `src/components/WeightChart.jsx` | Ajouter bouton "Scanner Renpho" a cote de "Log" | +8 lignes |
| `src/styles.js` | Styles pour carte composition, graphique dual-line, overlay scan, formulaire confirmation | +150 lignes |
| `src/App.jsx` | Passer nouvelles props (bodyCompositions, handlers) a DashboardView | +8 lignes |

### 7.2 Nouveaux fichiers a creer

| Fichier | Responsabilite | Lignes estimees |
|---------|---------------|-----------------|
| `src/components/BodyCompositionCard.jsx` | Carte dashboard avec 4 KPI + deltas + mini-graphique | ~120 lignes |
| `src/components/CompositionChart.jsx` | Graphique SVG dual-line (graisse % + muscle %) | ~100 lignes |
| `src/components/RenphoScanOverlay.jsx` | Overlay fullscreen : camera/galerie -> confirmation -> save | ~200 lignes |

### 7.3 Modifications detaillees par fichier

#### `src/constants.js`

```javascript
// AJOUTER apres USER
export const COMPOSITION_FIELDS = {
  essential: [
    { key: 'weight', label: 'Poids', unit: 'kg', icon: '????' },
    { key: 'bodyFatPct', label: 'Graisse corporelle', unit: '%', icon: '????' },
    { key: 'skeletalMusclePct', label: 'Muscle squelettique', unit: '%', icon: '????' },
    { key: 'bmr', label: 'Metabolisme de base', unit: 'kcal', icon: '????' }
  ],
  secondary: [
    { key: 'bmi', label: 'IMC', unit: '' },
    { key: 'fatFreeMass', label: 'Masse maigre', unit: 'kg' },
    { key: 'subcutaneousFatPct', label: 'Gras sous-cutane', unit: '%' },
    { key: 'visceralFat', label: 'Graisse viscerale', unit: '/59' },
    { key: 'bodyWaterPct', label: 'Eau corporelle', unit: '%' },
    { key: 'muscleMass', label: 'Masse musculaire', unit: 'kg' },
    { key: 'boneMass', label: 'Masse osseuse', unit: 'kg' },
    { key: 'proteinPct', label: 'Proteines', unit: '%' },
    { key: 'metabolicAge', label: 'Age metabolique', unit: 'ans' }
  ]
};

export const COMPOSITION_RANGES = { /* ... voir section 3.2 ... */ };
```

#### `src/hooks/useShredOS.js`

Modifications cles :
1. **Ligne ~11** : Ajouter state `const [bodyCompositions, setBodyCompositions] = useState([]);`
2. **Ligne ~55** : Charger depuis localStorage `if (data.bodyCompositions) setBodyCompositions(data.bodyCompositions);`
3. **Ligne ~74** : Sauvegarder dans localStorage `bodyCompositions` dans l'objet persiste
4. **Ligne ~87** : Ajouter dans les deps du useEffect de save : `bodyCompositions`
5. **Ligne ~152** : Nouveau handler `handleLogComposition(compositionData)` :
   - Valide les ranges
   - Ajoute ou remplace dans `bodyCompositions[]` (1 par jour)
   - Sync le poids dans `weights[]`
6. **Ligne ~535** : Nouveau handler `processRenphoPhoto(blob)` (clone de `processPhoto` avec prompt OCR)
7. **Ligne ~196** : Enrichir `generateClaudeContext()` avec le bloc composition (voir section 5.1)
8. **Ligne ~653** : Exporter les nouveaux states et handlers dans le return

#### `src/components/DashboardView.jsx`

```jsx
// Ajouter import
import BodyCompositionCard from './BodyCompositionCard';

// Dans le JSX, apres WeightChart (ligne ~131)
{bodyCompositions.length > 0 && (
  <BodyCompositionCard
    compositions={bodyCompositions}
  />
)}
```

#### `src/components/WeightChart.jsx`

Ajouter un bouton "Scanner Renpho" dans la `weight-input-row` :

```jsx
<div className="weight-input-row">
  <input ... />
  <button className="weight-btn" onClick={handleLogWeight}>Log</button>
  <button className="scan-renpho-btn" onClick={onScanRenpho}>Scan</button>
</div>
```

### 7.4 Diagramme de flux

```
Utilisateur ouvre dashboard
    |
    +-- Carte poids affichee (existant)
    |     |
    |     +-- [Log] poids simple (existant, inchange)
    |     +-- [Scan Renpho] (NOUVEAU)
    |           |
    |           +-- Overlay s'ouvre
    |           |     |
    |           |     +-- [Camera] ou [Galerie] ou [Saisie manuelle]
    |           |     |
    |           |     +-- Si photo: Gemini Vision OCR
    |           |     |     |
    |           |     |     +-- Succes: ecran confirmation editable
    |           |     |     +-- Echec: fallback saisie manuelle
    |           |     |
    |           |     +-- Confirmation/Saisie -> Valider
    |           |           |
    |           |           +-- bodyCompositions[] mis a jour
    |           |           +-- weights[] synchronise
    |           |           +-- Overlay se ferme
    |           |
    |           +-- Carte BODY COMPOSITION apparait/se met a jour
    |
    +-- Carte BODY COMPOSITION (NOUVEAU, si donnees existent)
    |     |
    |     +-- 4 KPI avec deltas
    |     +-- Graphique dual-line (si >= 2 entrees)
    |
    +-- Coach IA contexte enrichi (automatique)
```

---

## 8. Prioritization

### MVP (Sprint 1 - a implementer en premier)

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Data model + localStorage (bodyCompositions[]) | S | Fondation |
| 2 | Saisie manuelle (formulaire essentiels) | M | Permet de logger immediatement |
| 3 | Carte dashboard BODY COMPOSITION (4 KPI + deltas) | M | Visibilite quotidienne |
| 4 | Enrichissement generateClaudeContext() | S | Coach IA plus intelligent |
| 5 | Sync poids vers weights[] | S | Retro-compatibilite |

**Estimation MVP : 4-6 heures de dev**

### Phase 2 (apres validation MVP)

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 6 | Photo OCR Renpho via Gemini Vision | L | Gain de temps quotidien (le vrai game-changer) |
| 7 | Ecran confirmation editable (post-OCR) | M | Correction des erreurs OCR |
| 8 | Graphique dual-line composition | M | Visualisation tendances |
| 9 | Formulaire secondaires (accordeon) | S | Completude des donnees |

**Estimation Phase 2 : 4-6 heures de dev**

### Nice-to-have (Phase 3)

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 10 | BMR dynamique -> recalcul auto TDEE | M | Precision maximale |
| 11 | Export CSV des donnees composition | S | Analyse externe |
| 12 | Objectifs composition (ex: atteindre 12% BF) | M | Gamification |
| 13 | Comparaison semaine 1 vs semaine actuelle (side-by-side) | M | Motivation |
| 14 | Notifications "N'oublie pas ton scan Renpho" | S | Adherence |

---

## 9. Risks & Mitigations

### 9.1 OCR Accuracy

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Gemini ne reconnait pas le layout Renpho | Moyenne | Fort | Ecran confirmation editable + fallback saisie manuelle. Le prompt est tres detaille avec les noms FR/EN. |
| Renpho change son UI (couleurs, layout) | Faible | Moyen | Le prompt OCR est generique et cherche des labels texte, pas du positionnement pixel. |
| Qualite photo insuffisante (flou, reflets) | Moyenne | Moyen | Message "Photo pas claire, reessaye" si Gemini retourne peu de champs. Saisie manuelle en fallback. |
| Confusion entre valeur et delta (ex: "15.6% +0.1") | Haute | Fort | Instruction explicite dans le prompt : "Ignore les deltas affiches, ne garde que la valeur principale". |
| Screenshot partiel (pas toutes les metriques visibles) | Moyenne | Faible | Les champs non detectes sont null. L'utilisateur scrolle et prend 2 photos, ou complete manuellement. |

### 9.2 Donnees et stockage

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| localStorage plein | Tres faible | Fort | 84 entrees * ~500 bytes = ~42 KB. Negligeable (localStorage = 5-10 MB). |
| Perte de donnees (clear browser) | Moyenne | Fort | Deja un risque existant pour tout ShredOS. Futur chantier : sync Google Sheets. |
| Doublons si 2 scans le meme jour | Moyenne | Faible | Logique de remplacement : 1 entree par jour max. |

### 9.3 UX

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Trop de champs dans le formulaire | Moyenne | Moyen | Accordeon : 4 essentiels visibles, 9 secondaires caches. |
| Friction quotidienne (trop long a remplir) | Haute | Fort | Photo OCR = 1 tap. C'est tout l'interet de la feature. La saisie manuelle n'est que le fallback. |
| Dashboard surcharge avec la nouvelle carte | Faible | Moyen | La carte n'apparait que si des donnees existent. Design compact (4 KPI en ligne). |

### 9.4 API / Technique

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Gemini API rate limit / couts | Tres faible | Faible | 1 scan/jour = ~30 appels/mois. Largement dans le tier gratuit Gemini. |
| CORS ou erreur reseau | Faible | Moyen | Deja gere dans le code existant (`processPhoto`). Meme pattern d'erreur. |
| Gemini retourne du texte invalide | Moyenne | Moyen | Regex extraction JSON (meme pattern que ligne 578 existante). Fallback saisie manuelle. |

---

## Annexe A : Mapping Renpho FR -> Data Model

| Label Renpho (francais) | Label Renpho (anglais) | Champ data model | Exemple |
|------------------------|----------------------|------------------|---------|
| Poids | Weight | weight | 96.35 |
| IMC | BMI | bmi | 26.7 |
| Graisse corporelle | Body Fat | bodyFatPct | 15.6 |
| Muscle squelettique | Skeletal Muscle | skeletalMusclePct | 54.5 |
| Poids hors masse grasse | Fat-Free Body Weight | fatFreeMass | 81.32 |
| Gras sous-cutane | Subcutaneous Fat | subcutaneousFatPct | 13.0 |
| Graisse viscerale | Visceral Fat | visceralFat | 9 |
| Eau Corporelle Totale | Total Body Water | bodyWaterPct | 60.9 |
| Masse musculaire | Muscle Mass | muscleMass | 77.27 |
| Masse osseuse | Bone Mass | boneMass | 4.05 |
| Proteines | Protein | proteinPct | 19.2 |
| Metabolisme de base | BMR | bmr | 2118 |
| Age metabolique | Metabolic Age | metabolicAge | 57 |

## Annexe B : Exemples de reponses IA enrichies

### Avant (contexte actuel)

> "Tu es a 96.35 kg. Continue le deficit."

### Apres (avec composition)

> "Tu es a 96.35 kg avec 15.6% de graisse corporelle et 54.5% de muscle squelettique. Ton ratio muscle/gras est de 3.49 (excellent). Ton BMR mesure (2118 kcal) confirme que ton TDEE de 2752 kcal est coherent. La legere hausse de gras (+0.1%) est probablement due a la retention d'eau -- tes proteines sont a 19.2% ce qui est bon. Maintiens 211g de proteines/jour et surveille ton hydratation (60.9% d'eau, legere baisse)."

---

*Fin du PRD. Ce document sert de specification pour l'implementation. Toute deviation majeure doit etre validee avant codage.*
