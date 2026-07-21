import { useState } from 'react';
import PDFAnalyzer from './components/PDFAnalyzer';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>AP Score Analyzer</h1>
        <p>Extract and analyze AP exam performance data from PDF reports</p>
      </header>
      <main className="app-main">
        <PDFAnalyzer />
      </main>
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-credits">
            <p>📋 All analysis happens locally in your browser. Your PDFs are never uploaded anywhere.</p>
            <p className="disclaimer">
              Built with <strong>Claude Code</strong> • Not affiliated with The College Board
            </p>
          </div>
          <div className="footer-csta">
            <a href="https://sandiego.csteachers.org" target="_blank" rel="noopener noreferrer" className="csta-link">
              <img src="/AP-Score-Reports/csta-logo.png" alt="CSTA San Diego" className="csta-logo" />
              <span>CSTA San Diego</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
