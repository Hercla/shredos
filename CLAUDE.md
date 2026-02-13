# CLAUDE.md — ShredOS v7

ShredOS v7 est un tracker de shred fitness 12 semaines base sur la methode Paul Revelia (deficit calorique progressif).
Utilisateur principal : Hercl, 57 ans, 96kg, 190cm, TDEE 2752 kcal — objectif seche avec suivi quotidien.
App PWA React deployee sur Vercel, utilisee quotidiennement sur mobile (Samsung Galaxy) et desktop.

---

## Stack technique

| Couche | Techno |
|--------|--------|
| Framework | React 18.2.0 (sans TypeScript) |
| Build | Vite 5.0.0 |
| PWA | vite-plugin-pwa 0.17.4 (autoUpdate) |
| Hosting | Vercel (SPA rewrite) |
| Backend | Aucun — localStorage uniquement |
| IA | Gemini 1.5 Flash (chat + vision, gratuit, cle API cote front) |
| Styles | Inline CSS-in-JS dans App.jsx (pas de framework CSS) |

---

## Architecture

- **Modulaire** : code refactorise en composants, hooks et modules dedies :

```
src/
├── App.jsx              (120 lignes — orchestrateur, imports + assemblage)
├── main.jsx             (point d'entree, inchange)
├── constants.js         (PHASES, DEFAULT_CHECKLIST, CATEGORIES, USER)
├── styles.js            (CSS global inline, ~1060 lignes)
├── hooks/
│   └── useShredOS.js    (state management, localStorage, computed values, handlers, AI/API logic, camera)
└── components/
    ├── Header.jsx       (logo, phase badge, progress bar, nav tabs)
    ├── DashboardView.jsx (score card, macro rings, meals tracker, weight chart, timeline, sprint info)
    ├── PlanView.jsx     (checklist editable, targets weekly)
    ├── CoachView.jsx    (chat IA, quick prompts, Claude buttons, photo section)
    ├── MacroRing.jsx    (composant SVG ring reutilisable pour P/C/F)
    ├── WeightChart.jsx  (composant SVG chart poids + input)
    └── Overlays.jsx     (setup modal, settings modal, confetti, copy success, loading)
```

- **Persistance** : localStorage, cle unique `'shredos'`
- **State management** : hook custom `useShredOS` (centralise useState, useEffect, useRef)
- **3 vues** : `dash` (DashboardView), `plan` (PlanView), `ai` (CoachView)
- **Navigation** : swipe touch (seuil 50px) + bottom nav bar (Header)
- **Responsive** : mobile-first (max-width 430px)

---

## Conventions de code

- **Langue du code** : anglais (variables, fonctions)
- **Langue de l'UI** : francais
- **Styles** : module `styles.js` dedie, inline uniquement
- **Composants** : un fichier par composant dans `components/`, hook custom dans `hooks/`, constantes dans `constants.js`
- **Animations CSS** : keyframes definis inline (`fadeIn`, `slideUp`, `pulse`, `confetti`, `ringFill`, `barFill`, `glowBorder`)
- **Palette** : cyan `#22d3ee`, indigo `#818cf8`, amber `#f59e0b`, fond dark `#0a0a0f`
- **Persistance** : lecture/ecriture via localStorage cle `'shredos'`

---

## Features implementees

- Dashboard : score %, macro rings (P/C/F), meals tracker, weight chart, timeline 12 semaines
- Checklist editable : 8 items par defaut, 4 categories (TRACK/EAT/MOVE/REST), double-click pour editer
- Coach IA : quick responses locales + Gemini API chat + fallback copier vers Claude.ai
- Photo repas : camera mobile (capture native) + desktop (`getUserMedia`) -> Gemini Vision -> auto-log macros
- Swipe navigation : seuil 50px, transitions entre vues
- PWA installable : manifest, service worker, icones 192/512
- Boutons "1% Better Today" et "Copier pour Claude"
- Confetti animation a 100% score

---

## Constantes metier cles

```
PHASES:
  IGNITION  (sem 1-4)   deficit 300 kcal
  BURN      (sem 5-8)   deficit 400 kcal
  SHRED     (sem 9-12)  deficit 500 kcal

USER:
  tdee: 2752, weight: 96, height: 190, age: 57

DEFAULT_CHECKLIST (8 items):
  peser, tracker macros, deficit, proteines,
  entrainement, 10k pas, 7h sommeil, pas d'alcool

Macros: calcules dynamiquement selon la phase courante
```

---

## Commandes cles

```bash
npm run dev      # Dev server Vite (hot reload)
npm run build    # Build production -> /dist
npm run preview  # Preview build local
# Deploiement : push vers Vercel (auto-deploy)
```

---

## Dette technique / Points d'attention

- Profil utilisateur hardcode (pas editable dans l'UI)
- Claude API desactive (CORS) — necessite un backend proxy
- Parsing JSON Gemini fragile (regex)
- Repas reset quotidien — historique perdu
- Pas de Git initialise

---

## Prochains chantiers

1. Garmin Fenix 8 -> Google Sheets -> auto-inject poids/steps dans l'app
2. Notion sync (Hercla_2_Brain)
3. Notifications push
4. Profil utilisateur editable
5. Initialisation Git

---

## Patterns recurrents dans l'ecosysteme Hercl

| Pattern | Usage |
|---------|-------|
| Notion API | Utilise dans d'autres projets (Hercla_2_Brain), potentiel sync bidirectionnel |
| Make/Integromat webhooks | Automatisation entre services (Garmin -> Sheets -> App) |
| VBA Macros | Planning Excel (autre projet), parsing et generation de donnees structurees |
| Google Sheets comme BDD legere | Pattern recurrent pour stocker des donnees sans backend |
| Gemini API gratuit | Pattern privilegie pour l'IA cote client (pas de CORS, cle API cote front) |
