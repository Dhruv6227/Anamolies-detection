import { AnomalyResult } from "./zscore";

export function iqrDetect(values: number[], multiplier: number = 1.5): AnomalyResult[] {
  if (values.length < 4) return [];

  // Sort values to calculate quartiles
  const sorted = [...values].sort((a, b) => a - b);
  
  const q1 = getPercentile(sorted, 25);
  const q3 = getPercentile(sorted, 75);
  const iqr = q3 - q1;

  if (iqr === 0) return [];

  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;

  const results: AnomalyResult[] = [];

  values.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      // Calculate deviation score relative to bounds
      const deviation = value > upperBound ? value - upperBound : lowerBound - value;
      const relativeScore = +(deviation / iqr).toFixed(2);
      
      let severity: "low" | "medium" | "high" = "low";
      if (relativeScore > 2.0) severity = "high";
      else if (relativeScore > 1.0) severity = "medium";

      results.push({
        index,
        value,
        score: relativeScore,
        severity,
        reason: value > upperBound 
          ? `Value ${value} is above upper IQR bound (${upperBound.toFixed(2)}). Q1: ${q1.toFixed(2)}, Q3: ${q3.toFixed(2)}` 
          : `Value ${value} is below lower IQR bound (${lowerBound.toFixed(2)}). Q1: ${q1.toFixed(2)}, Q3: ${q3.toFixed(2)}`,
      });
    }
  });

  return results;
}

function getPercentile(sortedValues: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}
