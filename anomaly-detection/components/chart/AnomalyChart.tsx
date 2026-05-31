"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Scatter,
  Legend
} from "recharts";

interface AnomalyChartProps {
  data: Record<string, any>[];
  activeColumn: string;
  anomalies: { index: number; value: number; severity: "low" | "medium" | "high" }[];
}

export default function AnomalyChart({ data, activeColumn, anomalies }: AnomalyChartProps) {
  // Format the dataset for charting
  const chartData = data.map((row, index) => {
    // Check if this row is an anomaly
    const anomaly = anomalies.find(a => a.index === index);
    
    // Fallback labels (index or time representation)
    const label = row.timestamp || row.time || row.date || `Row ${index + 1}`;

    return {
      name: label,
      value: Number(row[activeColumn]),
      // Scatter only displays non-null values
      anomalyValue: anomaly ? Number(row[activeColumn]) : null,
      severity: anomaly ? anomaly.severity : null,
    };
  });

  // Custom tooltips with premium styling matching our dark theme
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isAnomaly = dataPoint.anomalyValue !== null;

      return (
        <div 
          style={{
            background: "rgba(13, 13, 26, 0.95)",
            border: `1px solid ${isAnomaly ? "var(--danger)" : "var(--border)"}`,
            padding: "0.8rem 1.2rem",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)"
          }}
        >
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>
            {dataPoint.name}
          </p>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Value: <span style={{ color: "var(--accent-alt)" }}>{dataPoint.value}</span>
          </p>
          {isAnomaly && (
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", fontWeight: 700, color: "var(--danger)" }}>
              ⚠️ ANOMALY DETECTED ({dataPoint.severity.toUpperCase()})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: 400, marginTop: "1rem" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <defs>
            <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>

          <CartesianGrid stroke="rgba(108, 99, 255, 0.08)" strokeDasharray="3 3" />
          
          <XAxis 
            dataKey="name" 
            stroke="var(--text-muted)" 
            fontSize={11}
            tickLine={false}
          />
          
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={11}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={36} 
            wrapperStyle={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
          />

          {/* Primary Data Trend Line */}
          <Line
            name={`${activeColumn} Signal`}
            type="monotone"
            dataKey="value"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: "var(--accent-alt)", strokeWidth: 2 }}
          />

          {/* Glowing Anomaly Outlier Scatter Nodes overlay */}
          <Scatter
            name="Identified Anomalies"
            dataKey="anomalyValue"
            fill="var(--danger)"
            line={false}
            shape={(props: any) => {
              const { cx, cy } = props;
              return (
                <g>
                  <circle cx={cx} cy={cy} r={8} fill="var(--danger)" opacity={0.3} className="animate-glow" />
                  <circle cx={cx} cy={cy} r={5} fill="var(--danger)" stroke="#fff" strokeWidth={1} />
                </g>
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
