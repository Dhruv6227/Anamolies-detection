"use client";

import { useRef, useState } from "react";
import { DetailedAnomalyReport } from "../../lib/algorithms/anomalyEngine";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Report.css";

interface ReportSummaryProps {
  report: DetailedAnomalyReport;
  fileName: string;
  onReset: () => void;
}

export default function ReportSummary({ report, fileName, onReset }: ReportSummaryProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Generate and export PDF Report
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#050508",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      const x = (pdfWidth - finalWidth) / 2;
      const y = 0;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`Anomaly_Report_${fileName.replace(/\.[^/.]+$/, "")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to compile PDF. You can still download the raw JSON report.");
    } finally {
      setDownloading(false);
    }
  };

  // Export JSON Report
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Anomaly_Report_${fileName.replace(/\.[^/.]+$/, "")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const severityRate = (report.summary.anomalyRate).toFixed(2);

  return (
    <div className="report-dashboard">
      <div className="report-actions-top">
        <button onClick={onReset} className="btn-secondary">
          ← Analyze New Dataset
        </button>
        <div className="export-btn-group">
          <button 
            onClick={handleExportJSON} 
            className="btn-secondary"
            disabled={downloading}
          >
            📥 Download JSON
          </button>
          <button 
            onClick={handleExportPDF} 
            className="btn-primary animate-glow"
            disabled={downloading}
          >
            {downloading ? "Compiling PDF..." : "📄 Export Premium PDF Report"}
          </button>
        </div>
      </div>

      {/* Structured printable report canvas */}
      <div ref={reportRef} className="report-canvas glass">
        {/* Header Block */}
        <div className="report-header">
          <div className="report-brand">
            <span className="logo-hex">⬡</span>
            <div>
              <h2>AnomalyAI Diagnostics</h2>
              <p className="report-meta">Automated Statistical Outlier Report</p>
            </div>
          </div>
          <div className="report-details">
            <p><strong>File:</strong> {fileName}</p>
            <p><strong>Date:</strong> {new Date(report.timestamp).toLocaleString()}</p>
          </div>
        </div>

        {/* Executive summary widgets */}
        <div className="summary-grid">
          <div className="summary-widget glass">
            <span className="widget-label">Total Outliers</span>
            <span className="widget-value text-danger">{report.anomalies.length}</span>
            <p className="widget-sub">Across all features</p>
          </div>
          <div className="summary-widget glass">
            <span className="widget-label">Anomaly Rate</span>
            <span className="widget-value text-warning">{severityRate}%</span>
            <p className="widget-sub">Total values percentage</p>
          </div>
          <div className="summary-widget glass">
            <span className="widget-label">Analyzed Columns</span>
            <span className="widget-value text-info">{report.columnsAnalyzed.length}</span>
            <p className="widget-sub">Active numeric series</p>
          </div>
          <div className="summary-widget glass">
            <span className="widget-label">Total Records</span>
            <span className="widget-value">{report.totalRows}</span>
            <p className="widget-sub">Rows processed</p>
          </div>
        </div>

        {/* Severity levels gauges */}
        <div className="severity-section glass">
          <h3>Anomaly Severity Profile</h3>
          <div className="severity-bars">
            <div className="severity-bar-item">
              <div className="bar-labels">
                <span>Critical / High Severity Outliers</span>
                <span>{report.summary.highSeverityCount}</span>
              </div>
              <div className="bar-outer">
                <div 
                  className="bar-inner bg-danger" 
                  style={{ width: `${report.anomalies.length > 0 ? (report.summary.highSeverityCount / report.anomalies.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="severity-bar-item">
              <div className="bar-labels">
                <span>Moderate / Medium Outliers</span>
                <span>{report.summary.mediumSeverityCount}</span>
              </div>
              <div className="bar-outer">
                <div 
                  className="bar-inner bg-warning" 
                  style={{ width: `${report.anomalies.length > 0 ? (report.summary.mediumSeverityCount / report.anomalies.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="severity-bar-item">
              <div className="bar-labels">
                <span>Trace / Low Severity Outliers</span>
                <span>{report.summary.lowSeverityCount}</span>
              </div>
              <div className="bar-outer">
                <div 
                  className="bar-inner bg-success" 
                  style={{ width: `${report.anomalies.length > 0 ? (report.summary.lowSeverityCount / report.anomalies.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithmic Narrative Summary Block */}
        <div className="narrative-block glass">
          <h3>Analytical Narrative Insights</h3>
          <p>
            The anomaly detection pipeline scanned <strong>{report.totalRows}</strong> rows across <strong>{report.columnsAnalyzed.length}</strong> parameters. 
            A total of <strong>{report.anomalies.length}</strong> outliers were isolated, yielding an anomaly incidence rate of <strong>{severityRate}%</strong>.
          </p>
          {report.anomalies.length > 0 ? (
            <p>
              Primary deviations occurred in column <strong>{report.anomalies[0].column}</strong> with a peak outlier scoring <strong>{report.anomalies[0].score}</strong> (value: {report.anomalies[0].value}). 
              We recommend reviewing critical data spikes listed below to confirm hardware sensor errors or business transaction outliers.
            </p>
          ) : (
            <p>
              No notable outlier spikes were identified. The dataset exhibits typical Gaussian distributed parameters within normal operating standard deviations.
            </p>
          )}
        </div>

        {/* Per-column analysis reports */}
        <div className="features-breakdown">
          <h3>Feature Statistical Breakdown</h3>
          <div className="feature-cards-grid">
            {report.columnsAnalyzed.map(col => {
              const stats = report.summary.columnStats[col];
              if (!stats) return null;
              return (
                <div key={col} className="feature-report-card glass">
                  <h4>{col}</h4>
                  <div className="feature-stat-lines">
                    <div className="feature-stat-row">
                      <span>Outliers Found:</span>
                      <strong className={stats.anomalyCount > 0 ? "text-danger" : "text-success"}>
                        {stats.anomalyCount}
                      </strong>
                    </div>
                    <div className="feature-stat-row">
                      <span>Mean Value:</span>
                      <strong>{stats.mean}</strong>
                    </div>
                    <div className="feature-stat-row">
                      <span>Minimum:</span>
                      <strong>{stats.min}</strong>
                    </div>
                    <div className="feature-stat-row">
                      <span>Maximum:</span>
                      <strong>{stats.max}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed record anomaly log table */}
        {report.anomalies.length > 0 && (
          <div className="anomaly-log-section">
            <h3>Isolated Anomaly Log</h3>
            <div className="table-wrapper">
              <table className="anomaly-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Feature Column</th>
                    <th>Observed Value</th>
                    <th>Deviation Score</th>
                    <th>Severity</th>
                    <th>Detection Context</th>
                  </tr>
                </thead>
                <tbody>
                  {report.anomalies.slice(0, 50).map((anomaly, index) => (
                    <tr key={index}>
                      <td><strong>#{anomaly.index + 1}</strong></td>
                      <td><code className="feature-code">{anomaly.column}</code></td>
                      <td>{anomaly.value}</td>
                      <td>{anomaly.score}</td>
                      <td>
                        <span className={`badge badge-${anomaly.severity}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="context-cell">{anomaly.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {report.anomalies.length > 50 && (
              <p className="table-truncated-note">Showing first 50 anomalies. Download full JSON/PDF for complete dataset log.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
