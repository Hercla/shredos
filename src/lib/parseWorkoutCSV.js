/**
 * Parse workout CSV from common apps (Reps & Sets, Strong, FitNotes, etc.)
 * Handles various column formats and returns structured workout data.
 */
export default function parseWorkoutCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return null;

  const lines = csvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  // Detect separator
  const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  // Map common column names
  const colMap = {};
  headers.forEach((h, i) => {
    if (/exerci|name|nom/.test(h)) colMap.exercise = i;
    if (/set|serie|s[eé]rie/.test(h) && !colMap.sets) colMap.sets = i;
    if (/rep|r[eé]p/.test(h)) colMap.reps = i;
    if (/weight|poids|kg|load/.test(h)) colMap.weight = i;
    if (/date/.test(h)) colMap.date = i;
    if (/duration|dur[eé]e|time|temps/.test(h)) colMap.duration = i;
    if (/note/.test(h)) colMap.notes = i;
  });

  if (colMap.exercise === undefined) return null;

  // Parse rows into exercises
  const exerciseMap = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^['"]|['"]$/g, ''));
    const name = cols[colMap.exercise] || '';
    if (!name) continue;

    const reps = colMap.reps !== undefined ? parseInt(cols[colMap.reps]) || 0 : 0;
    const weight = colMap.weight !== undefined ? parseFloat(cols[colMap.weight]) || 0 : 0;

    if (!exerciseMap[name]) {
      exerciseMap[name] = { name, sets: [] };
    }
    exerciseMap[name].sets.push({ reps, weight });
  }

  const exercises = Object.values(exerciseMap);
  if (exercises.length === 0) return null;

  // Calculate totals
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  exercises.forEach(ex => {
    ex.sets.forEach(s => {
      totalVolume += s.reps * s.weight;
      totalReps += s.reps;
    });
    totalSets += ex.sets.length;
  });

  // Estimate calories: ~5 kcal per set (strength training average)
  const estimatedCalories = Math.round(totalSets * 5 + totalReps * 0.5);

  return {
    exercises,
    totalVolume: Math.round(totalVolume),
    totalSets,
    totalReps,
    estimatedCalories,
    source: 'csv'
  };
}
