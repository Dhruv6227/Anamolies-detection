"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Anomaly<span className="text-glow">AI</span></span>
        </Link>
        <div className="navbar-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/analyze" className="nav-link">Dashboard</Link>
          <a href="#features" className="nav-link">Features</a>
          <a href="#algorithms" className="nav-link">Algorithms</a>
        </div>
        <div className="navbar-actions">
          <Link href="/analyze" className="btn-navbar">
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}
