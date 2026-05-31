"use client";

import { useState } from "react";
import { AlgorithmType, DetectionConfig as EngineConfig } from "../../lib/algorithms/anomalyEngine";
import "./DetectionConfig.css";

interface DetectionConfigProps {
  columns: string[];
  onStartAnalysis: (config: EngineConfig[]) => void;
  onBack: () => void;
}

export default function DetectionConfig({ columns, onStartAnalysis, onBack }: DetectionConfigProps) {
  // Map columns to their individual algorithm configurations
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col]: true }), {})
  );

  const [colConfigs, setColConfigs] = useState<Record<string, { algorithm: AlgorithmType; sensitivity: number }>>(
    columns.reduce(
      (acc, col) => ({
        ...acc,
        [col]: { algorithm: "auto", sensitivity: 3 }
      }),
      {}
    )
  );

  const handleToggleColumn = (col: string) => {
    setSelectedColumns(prev => ({
      ...prev,
      [col]: !prev[col]
    }));
  };

  const handleAlgoChange = (col: string, algo: AlgorithmType) => {
    setColConfigs(prev => ({
      ...prev,
      [col]: { ...prev[col], algorithm: algo }
    }));
  };

  const handleSensitivityChange = (col: string, val: number) => {
    setColConfigs(prev => ({
      ...prev,
      [col]: { ...prev[col], sensitivity: val }
    }));
  };

  const handleSubmit = () => {
    const activeConfigs: EngineConfig[] = Object.keys(selectedColumns)
      .filter(col => selectedColumns[col])
      .map(col => ({
        column: col,
        algorithm: colConfigs[col].algorithm,
        sensitivity: colConfigs[col].sensitivity
      }));

    if (activeConfigs.length === 0) {
      alert("Please select at least one column to analyze.");
      return;
    }

    onStartAnalysis(activeConfigs);
  };

  return (
    <div className="detection-config-panel">
      <div className="panel-header">
        <h2>Pipeline Customization</h2>
        <p>Select features and fine-tune classifiers to isolate anomalous patterns.</p>
      </div>

      <div className="column-configs-list">
        {columns.map(col => {
          const isSelected = selectedColumns[col];
          const config = colConfigs[col];

          return (
            <div key={col} className={`col-config-card glass ${isSelected ? "selected" : "disabled"}`}>
              <div className="card-top">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => handleToggleColumn(col)} 
                  />
                  <span className="checkmark"></span>
                  <span className="column-name">{col}</span>
                </label>
                <span className="datatype-badge">Numeric</span>
              </div>

              {isSelected && (
                <div className="card-settings animate-fadeIn">
                  <div className="setting-group">
                    <label>Detection Algorithm</label>
                    <div className="algo-selector">
                      <button 
                        onClick={() => handleAlgoChange(col, "auto")}
                        className={`algo-btn ${config.algorithm === "auto" ? "active" : ""}`}
                      >
                        Auto (Z-Score)
                      </button>
                      <button 
                        onClick={() => handleAlgoChange(col, "zscore")}
                        className={`algo-btn ${config.algorithm === "zscore" ? "active" : ""}`}
                      >
                        Z-Score
                      </button>
                      <button 
                        onClick={() => handleAlgoChange(col, "iqr")}
                        className={`algo-btn ${config.algorithm === "iqr" ? "active" : ""}`}
                      >
                        IQR Bounds
                      </button>
                      <button 
                        onClick={() => handleAlgoChange(col, "rolling_mean")}
                        className={`algo-btn ${config.algorithm === "rolling_mean" ? "active" : ""}`}
                      >
                        Rolling Mean
                      </button>
                    </div>
                  </div>

                  <div className="setting-group">
                    <div className="sensitivity-label-row">
                      <label>Detection Sensitivity</label>
                      <span className="sensitivity-value">Level {config.sensitivity}/5</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={config.sensitivity}
                      onChange={(e) => handleSensitivityChange(col, parseInt(e.target.value))}
                      className="sensitivity-slider"
                    />
                    <div className="slider-labels">
                      <span>Strict (Fewer)</span>
                      <span>Moderate</span>
                      <span>Aggressive (More)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel-actions">
        <button onClick={onBack} className="btn-secondary">
          ← Upload Different Data
        </button>
        <button onClick={handleSubmit} className="btn-primary animate-glow">
          Execute Anomaly Detection Pipeline ⚡
        </button>
      </div>
    </div>
  );
}
