"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/nav/Navbar";
import DataUploader from "@/components/upload/DataUploader";
import DetectionConfig from "@/components/detection/DetectionConfig";
import AnomalyChart from "@/components/chart/AnomalyChart";
import ReportSummary from "@/components/report/ReportSummary";
import { runAnomalyDetection, DetailedAnomalyReport, DetectionConfig as EngineConfig } from "@/lib/algorithms/anomalyEngine";
import "./analyze.css";

type Step = "upload" | "configure" | "processing" | "results";

export default function AnalyzePage() {
  const [step, setStep] = useState<Step>("upload");
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [activeColumn, setActiveColumn] = useState<string>("");
  
  const [engineConfigs, setEngineConfigs] = useState<EngineConfig[]>([]);
  const [report, setReport] = useState<DetailedAnomalyReport | null>(null);
  
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("Initializing models...");

  // Extract columns when data is parsed
  const handleDataParsed = (data: Record<string, any>[], name: string) => {
    setParsedData(data);
    setFileName(name);
    
    // Find numeric columns
    if (data.length > 0) {
      const firstRow = data[0];
      const numericCols = Object.keys(firstRow).filter(key => {
        const val = firstRow[key];
        return typeof val === "number" || (!isNaN(Number(val)) && val !== "" && val !== null && typeof val !== "boolean");
      });
      
      setColumns(numericCols);
      if (numericCols.length > 0) {
        setActiveColumn(numericCols[0]);
      }
      setStep("configure");
    }
  };

  const handleStartAnalysis = (configs: EngineConfig[]) => {
    setEngineConfigs(configs);
    setStep("processing");
    setProcessingProgress(0);
  };

  // Run detection with scanning animation simulation
  useEffect(() => {
    if (step !== "processing") return;

    const statuses = [
      "Initializing engine context...",
      "Mapping dataset matrices...",
      "Executing outlier classifiers...",
      "Isolating anomalies...",
      "Compiling diagnostic reports..."
    ];

    let currentStatusIndex = 0;
    
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Run actual detection logic
          const resultsReport = runAnomalyDetection(parsedData, engineConfigs);
          setReport(resultsReport);
          
          // Switch to results step
          setTimeout(() => {
            setStep("results");
          }, 500);
          return 100;
        }

        // Cycle statuses
        const nextProgress = prev + Math.floor(Math.random() * 15) + 5;
        const statusIdx = Math.min(
          Math.floor((nextProgress / 100) * statuses.length),
          statuses.length - 1
        );
        setProcessingStatus(statuses[statusIdx]);
        
        return Math.min(nextProgress, 100);
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, [step, parsedData, engineConfigs]);

  const handleReset = () => {
    setStep("upload");
    setParsedData([]);
    setFileName("");
    setColumns([]);
    setActiveColumn("");
    setEngineConfigs([]);
    setReport(null);
  };

  return (
    <div className="analyze-page-container">
      <Navbar />
      <div className="glow-spot" style={{ top: "20%", left: "10%" }}></div>
      <div className="glow-spot" style={{ top: "60%", right: "10%" }}></div>

      <main className="analyze-main">
        {/* Stepper Progress Indicator */}
        <div className="stepper-indicator glass">
          <div className={`step-node ${step === "upload" ? "active" : ""} ${parsedData.length > 0 ? "completed" : ""}`}>
            <span className="step-num">{parsedData.length > 0 ? "✓" : "1"}</span>
            <span className="step-label">Upload Data</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-node ${step === "configure" ? "active" : ""} ${engineConfigs.length > 0 ? "completed" : ""}`}>
            <span className="step-num">{engineConfigs.length > 0 ? "✓" : "2"}</span>
            <span className="step-label">Configure Pipeline</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-node ${step === "processing" ? "active" : ""} ${report ? "completed" : ""}`}>
            <span className="step-num">{report ? "✓" : "3"}</span>
            <span className="step-label">Detecting</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-node ${step === "results" ? "active" : ""}`}>
            <span className="step-num">4</span>
            <span className="step-label">Structured Report</span>
          </div>
        </div>

        {/* Dynamic Step Renderer */}
        <div className="step-content-area">
          {step === "upload" && (
            <div className="fade-in">
              <div className="step-title-block">
                <h1>Ingest Your Dataset</h1>
                <p>Upload a CSV, JSON, or paste your log stream to start locating anomalies.</p>
              </div>
              <DataUploader onDataParsed={handleDataParsed} />
            </div>
          )}

          {step === "configure" && (
            <div className="fade-in">
              <DetectionConfig 
                columns={columns}
                onStartAnalysis={handleStartAnalysis}
                onBack={handleReset}
              />
            </div>
          )}

          {step === "processing" && (
            <div className="processing-viewport glass">
              <div className="processing-glow-ring">
                <div className="ring-pulse"></div>
                <div className="scanner-line"></div>
                <span className="processing-percentage">{processingProgress}%</span>
              </div>
              <h3>Analyzing Signal Matrix</h3>
              <p className="processing-status-text">{processingStatus}</p>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${processingProgress}%` }}></div>
              </div>
            </div>
          )}

          {step === "results" && report && (
            <div className="fade-in results-layout">
              {/* Visualizations (Interactive Chart) */}
              <div className="chart-section-wrapper glass">
                <div className="chart-header-row">
                  <div>
                    <h2>Interactive Signal Chart</h2>
                    <p>Visualizing anomalous spikes within selected parameter spaces.</p>
                  </div>
                  
                  {/* Dropdown to switch active column chart */}
                  {columns.length > 1 && (
                    <div className="column-select-dropdown-container">
                      <label htmlFor="column-select">Feature View:</label>
                      <select 
                        id="column-select"
                        value={activeColumn}
                        onChange={(e) => setActiveColumn(e.target.value)}
                        className="column-select-dropdown"
                      >
                        {engineConfigs.map(c => (
                          <option key={c.column} value={c.column}>{c.column}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <AnomalyChart 
                  data={parsedData}
                  activeColumn={activeColumn}
                  anomalies={report.anomalies.filter(a => a.column === activeColumn)}
                />
              </div>

              {/* Structured diagnostics and PDF report generator */}
              <ReportSummary 
                report={report}
                fileName={fileName}
                onReset={handleReset}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
