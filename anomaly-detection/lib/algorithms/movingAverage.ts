import { AnomalyResult } from "./zscore";

export function movingAverageDetect(
  values: number[], 
  windowSize: number = 5, 
  threshold: number = 2.0
): AnomalyResult[] {
  if (values.length < windowSize) return [];

  const results: AnomalyResult[] = [];

  for (let i = 0; i < values.length; i++) {
    // Determine the start and end of the window (sliding)
    const start = Math.max(0, i - windowSize + 1);
    const end = i + 1;
    const window = values.slice(start, end);

    // Calculate window mean
    const mean = window.reduce((sum, v) => sum + v, 0) / window.length;

    // Calculate window standard deviation
    const variance = window.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / window.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) continue;

    const val = values[i];
    const deviation = Math.abs((val - mean) / stdDev);

    if (deviation > threshold) {
      let severity: "low" | "medium" | "high" = "low";
      if (deviation > threshold * 1.5) severity = "high";
      else if (deviation > threshold * 1.2) severity = "medium";

      results.push({
        index: i,
        value: val,
        score: +deviation.toFixed(2),
        severity,
        reason: `Value ${val} deviates by ${deviation.toFixed(2)} std devs from rolling window mean (${mean.toFixed(2)}).`,
      });
    }
  }

  return results;
}
