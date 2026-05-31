import { zScoreDetect, AnomalyResult } from "./zscore";
import { iqrDetect } from "./iqr";
import { movingAverageDetect } from "./movingAverage";

export type AlgorithmType = "zscore" | "iqr" | "rolling_mean" | "auto";

export interface DetectionConfig {
  column: string;
  algorithm: AlgorithmType;
  sensitivity: number; // Scale: 1 to 5 (maps to thresholds)
}

export interface DetailedAnomalyReport {
  timestamp: string;
  totalRows: number;
  columnsAnalyzed: string[];
  anomalies: {
    column: string;
    index: number;
    value: number;
    score: number;
    severity: "low" | "medium" | "high";
    reason: string;
  }[];
  summary: {
    anomalyRate: number;
    highSeverityCount: number;
    mediumSeverityCount: number;
    lowSeverityCount: number;
    columnStats: Record<string, {
      mean: number;
      min: number;
      max: number;
      anomalyCount: number;
    }>;
  };
}

export function runAnomalyDetection(
  data: Record<string, any>[],
  config: DetectionConfig[]
): DetailedAnomalyReport {
  const anomalies: DetailedAnomalyReport["anomalies"] = [];
  const columnStats: DetailedAnomalyReport["summary"]["columnStats"] = {};
  const columnsAnalyzed = config.map(c => c.column);

  config.forEach(colConfig => {
    const colName = colConfig.column;
    // Extract numeric values, preserving their original index
    const numericEntries = data
      .map((row, index) => ({ value: Number(row[colName]), index }))
      .filter(item => !isNaN(item.value) && item.value !== null);

    const values = numericEntries.map(item => item.value);

    if (values.length === 0) return;

    // Calculate column stats
    const sum = values.reduce((s, v) => s + v, 0);
    const mean = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Determine algorithmic threshold parameters based on slider sensitivity (1 to 5)
    // Slider 1: low sensitivity (higher thresholds, fewer anomalies)
    // Slider 3: standard (default)
    // Slider 5: high sensitivity (lower thresholds, more anomalies)
    const sens = colConfig.sensitivity;
    
    let rawResults: AnomalyResult[] = [];
    const algo = colConfig.algorithm === "auto" ? "zscore" : colConfig.algorithm;

    if (algo === "zscore") {
      // Sensitivity maps: 5 -> 1.8, 4 -> 2.2, 3 -> 2.5, 2 -> 3.0, 1 -> 3.5
      const threshold = 3.5 - (sens - 1) * 0.42;
      rawResults = zScoreDetect(values, threshold);
    } else if (algo === "iqr") {
      // Sensitivity maps: 5 -> 1.0, 4 -> 1.25, 3 -> 1.5, 2 -> 1.8, 1 -> 2.2
      const multiplier = 2.2 - (sens - 1) * 0.3;
      rawResults = iqrDetect(values, multiplier);
    } else if (algo === "rolling_mean") {
      // Sensitivity maps: 5 -> 1.5, 4 -> 1.8, 3 -> 2.0, 2 -> 2.5, 1 -> 3.0
      const threshold = 3.0 - (sens - 1) * 0.375;
      rawResults = movingAverageDetect(values, 5, threshold);
    }

    // Map anomaly indices back to original row indices
    rawResults.forEach(res => {
      const originalIndex = numericEntries[res.index].index;
      anomalies.push({
        column: colName,
        index: originalIndex,
        value: res.value,
        score: res.score,
        severity: res.severity,
        reason: res.reason,
      });
    });

    columnStats[colName] = {
      mean: +mean.toFixed(2),
      min: +min.toFixed(2),
      max: +max.toFixed(2),
      anomalyCount: rawResults.length,
    };
  });

  const highSeverityCount = anomalies.filter(a => a.severity === "high").length;
  const mediumSeverityCount = anomalies.filter(a => a.severity === "medium").length;
  const lowSeverityCount = anomalies.filter(a => a.severity === "low").length;
  const anomalyRate = data.length > 0 ? +(anomalies.length / (data.length * columnsAnalyzed.length) * 100).toFixed(2) : 0;

  return {
    timestamp: new Date().toISOString(),
    totalRows: data.length,
    columnsAnalyzed,
    anomalies: anomalies.sort((a, b) => b.score - a.score),
    summary: {
      anomalyRate,
      highSeverityCount,
      mediumSeverityCount,
      lowSeverityCount,
      columnStats,
    },
  };
}
