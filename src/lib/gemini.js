const GEMINI_MODEL = 'gemini-2.0-flash';

const TRANSFORMATION_PROMPT = `Tu es un coach fitness expert en transformation physique.

Compare ces deux photos (AVANT et APRES) d'une meme personne durant un sprint de 12 semaines de seche.

Analyse et reponds UNIQUEMENT avec ce format JSON (rien d'autre):
{
  "score": nombre_de_1_a_10,
  "observations": ["observation 1", "observation 2", "observation 3"],
  "zonesAmeliorees": ["zone 1", "zone 2"],
  "conseil": "un conseil personnalise pour la suite"
}

Regles:
- Score de 1 (aucun changement visible) a 10 (transformation spectaculaire)
- 3 observations precises sur les changements visibles (posture, masse grasse, definition musculaire, etc.)
- 2-3 zones du corps ameliorees (ex: "abdominaux", "bras", "epaules", "jambes")
- 1 conseil actionnable pour continuer la progression
- Sois encourageant mais honnete
- Reponds en francais`;

export async function analyzeTransformation(beforeBase64, afterBase64, apiKey) {
  if (!apiKey) {
    return { error: 'Cle API Gemini requise' };
  }

  const beforeData = beforeBase64.includes(',') ? beforeBase64.split(',')[1] : beforeBase64;
  const afterData = afterBase64.includes(',') ? afterBase64.split(',')[1] : afterBase64;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: TRANSFORMATION_PROMPT },
              { inline_data: { mime_type: 'image/jpeg', data: beforeData } },
              { inline_data: { mime_type: 'image/jpeg', data: afterData } }
            ]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return { error: 'Reponse API invalide' };
  } catch (err) {
    return { error: err.message };
  }
}
