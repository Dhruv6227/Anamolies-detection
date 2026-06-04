"use client";

import Navbar from "@/components/nav/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import Link from "next/link";
import "./home.css";

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />

      {/* Cinematic Hero */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="section-padding features-section">
        <div className="glow-spot" style={{ top: "30%", left: "-100px" }}></div>
        <div className="section-header">
          <span className="section-subtitle">Premium Capabilities</span>
          <h2 className="section-title">Automated Detection Suite</h2>
          <p className="section-description">
            Experience end-to-end analytical processing, built to adapt to any sensor stream, transactions matrix or numerical sequence.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass glass-hover">
            <div className="feature-icon">🔍</div>
            <h3>Intelligent Outlier Scanners</h3>
            <p>
              Leverage statistical filters like IQR bounds and Z-Score deviation classifiers to scan your data stream for spike detections.
            </p>
          </div>

          <div className="feature-card glass glass-hover">
            <div className="feature-icon">📊</div>
            <h3>Dynamic Visualizations</h3>
            <p>
              Interact with custom-rendered composed charts mapping normal trends alongside high-visibility anomaly markers.
            </p>
          </div>

          <div className="feature-card glass glass-hover">
            <div className="feature-icon">📄</div>
            <h3>Structured Diagnostic PDF</h3>
            <p>
              Compile professional PDF summary sheets detailing statistical summaries, outlier density and narrative analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Algorithms Section */}
      <section id="algorithms" className="section-padding algorithms-section glass">
        <div className="glow-spot" style={{ bottom: "10%", right: "-100px" }}></div>
        <div className="section-header">
          <span className="section-subtitle">Mathematical Engines</span>
          <h2 className="section-title">Supported Classifiers</h2>
          <p className="section-description">
            Customize sensitivity thresholds across multiple industry-standard statistical detection approaches.
          </p>
        </div>

        <div className="algo-cards-grid">
          <div className="algo-card">
            <div className="algo-meta">
              <span className="algo-badge">Z-SCORE</span>
              <h3>Standard Deviation Filter</h3>
            </div>
            <p>
              Flags anomalies deviating significantly from the statistical mean. Ideal for standard Gaussian curves, computing dynamic thresholds to pinpoint severe spikes.
            </p>
          </div>

          <div className="algo-card">
            <div className="algo-meta">
              <span className="algo-badge">IQR</span>
              <h3>Interquartile Range Bounds</h3>
            </div>
            <p>
              Utilizes box-plot quartile fences to isolate outliers. Resilient to heavy skewing and massive individual variance, offering a robust non-parametric parser.
            </p>
          </div>

          <div className="algo-card">
            <div className="algo-meta">
              <span className="algo-badge">ROLLING MEAN</span>
              <h3>Moving Window Volatility</h3>
            </div>
            <p>
              Processes sequential data using a sliding window. Ideal for time-series streams where thresholds change according to rolling hourly cycles.
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding how-it-works">
        <div className="section-header">
          <span className="section-subtitle">Pipeline Flow</span>
          <h2 className="section-title">How It Works</h2>
        </div>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-number-badge">01</div>
            <h3>Ingest Datasets</h3>
            <p>Drag-and-drop CSV/JSON logs or paste your raw table data straight into the upload interface.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number-badge">02</div>
            <h3>Adjust Parameters</h3>
            <p>Choose statistical methods and adjust sliders to set strict or aggressive sensitivity levels.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number-badge">03</div>
            <h3>Diagnose & Export</h3>
            <p>Inspect anomalous patterns on the charts, view narrative breakdowns and export structured reports.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding cta-section">
        <div className="cta-box glass animate-glow">
          <h2>Transform Raw Logs into Clear Diagnostic Reports</h2>
          <p>
            Experience a premium client-side analytics suite. No signups, no external API latency. Run diagnostics locally in a secure, instant dashboard.
          </p>
          <Link href="/analyze" className="btn-primary btn-cta">
            Launch Detection Console ⚡
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">⬡</span>
            <h3>AnomalyAI</h3>
            <p>State of the art statistical anomaly classification console.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Application</h4>
              <Link href="/analyze">Launch Console</Link>
              <a href="#features">Features</a>
              <a href="#algorithms">Algorithms</a>
            </div>
            <div className="footer-column">
              <h4>Statistics</h4>
              <a href="https://en.wikipedia.org/wiki/Standard_score" target="_blank" rel="noopener noreferrer">Z-Score</a>
              <a href="https://en.wikipedia.org/wiki/Interquartile_range" target="_blank" rel="noopener noreferrer">IQR Method</a>
              <a href="https://en.wikipedia.org/wiki/Moving_average" target="_blank" rel="noopener noreferrer">Moving Average</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AnomalyAI. Built with premium Next.js and statistical modules.</p>
        </div>
      </footer>
    </div>
  );
}
