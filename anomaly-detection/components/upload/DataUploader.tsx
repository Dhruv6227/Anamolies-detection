"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import "./DataUploader.css";

interface DataUploaderProps {
  onDataParsed: (data: Record<string, any>[], fileName: string) => void;
}

export default function DataUploader({ onDataParsed }: DataUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteData, setPasteData] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseFile = (file: File) => {
    setError(null);
    const extension = file.name.split(".").pop()?.toLowerCase();
    
    if (extension === "csv" || extension === "txt") {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            onDataParsed(results.data as Record<string, any>[], file.name);
          } else {
            setError("The CSV file seems to be empty or has an invalid structure.");
          }
        },
        error: (err) => {
          setError(`Parsing error: ${err.message}`);
        }
      });
    } else if (extension === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          const dataArray = Array.isArray(parsed) ? parsed : [parsed];
          onDataParsed(dataArray, file.name);
        } catch {
          setError("Invalid JSON format in the uploaded file.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Unsupported file format. Please upload CSV, JSON, or TXT.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteData.trim()) {
      setError("Please paste some data first.");
      return;
    }
    setError(null);
    // Attempt JSON parse first, fallback to CSV parsing
    try {
      const parsedJson = JSON.parse(pasteData);
      const dataArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
      onDataParsed(dataArray, "pasted_data.json");
      return;
    } catch {
      // JSON failed, treat as CSV
      Papa.parse(pasteData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            onDataParsed(results.data as Record<string, any>[], "pasted_data.csv");
          } else {
            setError("Unable to parse pasted text. Ensure it is valid CSV or JSON.");
          }
        },
        error: (err) => {
          setError(`CSV parsing failed: ${err.message}`);
        }
      });
    }
  };

  // Pre-load synthetic anomalies for demonstration
  const handleLoadSample = () => {
    const sampleData = Array.from({ length: 100 }, (_, i) => {
      // Base trend
      let temp = 22.0 + Math.sin(i / 5) * 3 + Math.random() * 0.8;
      
      // Inject sharp spikes (anomalies) at specific indexes
      if (i === 24) temp = 38.5; // High anomaly
      if (i === 56) temp = 10.2; // Low anomaly
      if (i === 82) temp = 34.1; // Medium anomaly

      return {
        timestamp: new Date(Date.now() - (100 - i) * 60000).toISOString().slice(11, 19),
        temperature: +temp.toFixed(2),
        humidity: +(50 + Math.cos(i / 8) * 10 + Math.random() * 2).toFixed(2),
        pressure: +(1013 + (i === 56 ? -30 : Math.random() * 4 - 2)).toFixed(2)
      };
    });

    onDataParsed(sampleData, "iot_sensors_sample.csv");
  };

  return (
    <div className="data-uploader">
      <div 
        className={`dropzone glass ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file"
          className="file-input-hidden"
          accept=".csv,.json,.txt"
          onChange={handleFileChange}
        />
        <div className="upload-icon">⬎</div>
        <h3>Drag & Drop your dataset</h3>
        <p className="upload-tip">Supports CSV, JSON, or plain TXT files</p>
        <button type="button" className="btn-secondary btn-upload-select">
          Browse Files
        </button>
      </div>

      <div className="divider-or">
        <span>OR</span>
      </div>

      <div className="paste-area glass">
        <h3>Paste Raw Data</h3>
        <textarea 
          placeholder='{"temperature": 22.1} or paste CSV rows with headers...'
          value={pasteData}
          onChange={(e) => setPasteData(e.target.value)}
          className="paste-input"
        ></textarea>
        <button onClick={handlePasteSubmit} className="btn-primary btn-paste-submit">
          Analyze Pasted Data
        </button>
      </div>

      <div className="sample-zone">
        <p>Want to see the system in action instantly?</p>
        <button onClick={handleLoadSample} className="btn-secondary btn-sample animate-glow">
          ⚡ Try Live IoT Sample Dataset (with Spikes)
        </button>
      </div>

      {error && (
        <div className="uploader-error animate-float">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}
