"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./HeroSection.css";

export default function HeroSection() {
  const [accuracy, setAccuracy] = useState(94.0);
  const [filesProcessed, setFilesProcessed] = useState(1240);

  useEffect(() => {
    // Micro-animation: increment counters slightly to feel alive
    const interval = setInterval(() => {
      setAccuracy(prev => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(2));
      setFilesProcessed(prev => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="hero-section">
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0 hero-video"
      >
        <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
      </video>

      {/* Dark Premium Gradients & Scanlines */}
      <div className="hero-overlay"></div>
      <div className="scanlines"></div>

      <div className="hero-content">
        <div className="hero-badge animate-float">
          <span className="badge-pulse"></span> Powered by Advanced Statistical Engines
        </div>
        
        <h1 className="hero-title fade-in">
          Unveil Hidden <span className="gradient-text">Anomalies</span> <br />
          In Your Data Instantly
        </h1>
        
        <p className="hero-subtitle">
          Feed your datasets, automatically customize the discovery pipeline, and retrieve structured, production-ready reports powered by modern statistical classifiers.
        </p>

        <div className="hero-actions">
          <Link href="/analyze" className="btn-primary btn-hero animate-glow">
            Start Data Analysis 
            <span className="arrow-icon">→</span>
          </Link>
          <a href="#algorithms" className="btn-secondary btn-hero">
            Explore Methods
          </a>
        </div>

        {/* Real-time Cinematic Stats Bar */}
        <div className="hero-stats glass">
          <div className="stat-item">
            <span className="stat-val">{accuracy}%</span>
            <span className="stat-label">Classification Accuracy</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-val">3+</span>
            <span className="stat-label">Outlier Algorithms</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-val">{filesProcessed.toLocaleString()}</span>
            <span className="stat-label">Datasets Analyzed Today</span>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <p>Scroll to explore</p>
      </div>
    </header>
  );
}
