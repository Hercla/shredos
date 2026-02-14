/**
 * Parse JSON from AI response text (Gemini, Claude, etc.)
 * Tries multiple strategies: direct parse, strip markdown, regex fallback.
 * Returns parsed object or null on failure.
 */
export default function parseAIJSON(text) {
  if (!text || typeof text !== 'string') return null;

  // 1. Try direct parse (response is pure JSON)
  try {
    return JSON.parse(text.trim());
  } catch (e) {}

  // 2. Strip markdown code blocks: ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {}
  }

  // 3. Regex fallback: find first balanced { ... } (non-greedy approach)
  const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {}
  }

  // 4. Last resort: greedy match (original behavior)
  const greedyMatch = text.match(/\{[\s\S]*\}/);
  if (greedyMatch) {
    try {
      return JSON.parse(greedyMatch[0]);
    } catch (e) {}
  }

  return null;
}
