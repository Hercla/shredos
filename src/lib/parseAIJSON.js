/**
 * Parse JSON from AI response text (Gemini, Claude, etc.)
 * Tries multiple strategies: clean text, direct parse, strip markdown, regex fallback.
 * Returns parsed object or null on failure.
 */

/** Strip BOM, JS comments, and trailing commas from text */
function cleanText(text) {
  return text
    .replace(/^\uFEFF/, '')           // Strip BOM
    .replace(/\/\/[^\n]*/g, '')       // Strip // comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Strip /* */ comments
    .replace(/,\s*([}\]])/g, '$1');   // Strip trailing commas
}

export default function parseAIJSON(text) {
  if (!text || typeof text !== 'string') return null;

  const cleaned = cleanText(text.trim());

  // 1. Try direct parse (response is pure JSON)
  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  // 2. Strip markdown code blocks: ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(cleanText(codeBlockMatch[1].trim()));
    } catch (e) {}
  }

  // 3. Regex fallback: find first balanced { ... } (non-greedy approach)
  const jsonMatch = cleaned.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {}
  }

  // 4. Last resort: greedy match (original behavior)
  const greedyMatch = cleaned.match(/\{[\s\S]*\}/);
  if (greedyMatch) {
    try {
      return JSON.parse(greedyMatch[0]);
    } catch (e) {}
  }

  console.warn('[parseAIJSON] All strategies failed for input:', text.slice(0, 200));
  return null;
}
