export interface AnomalyResult {
  index: number;
  value: number;
  score: number;
  severity: "low" | "medium" | "high";
  reason: string;
}

export function zScoreDetect(values: number[], threshold: number = 2.5): AnomalyResult[] {
  if (values.length < 3) return [];

  // Calculate Mean
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  // Calculate Standard Deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  const results: AnomalyResult[] = [];

  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);

    if (zScore > threshold) {
      // Determine severity
      let severity: "low" | "medium" | "high" = "low";
      if (zScore > threshold * 1.5) severity = "high";
      else if (zScore > threshold * 1.2) severity = "medium";

      results.push({
        index,
        value,
        score: +zScore.toFixed(2),
        severity,
        reason: `Z-Score of ${zScore.toFixed(2)} exceeds threshold (${threshold}). Mean: ${mean.toFixed(2)}, StdDev: ${stdDev.toFixed(2)}`,
      });
    }
  });

  return results;
}
