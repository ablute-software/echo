import React from 'react';
import { Menu } from 'lucide-react';
import './EchoHeader.css';

export default function EchoHeader({ appState = "Pronta" }) {
  return (
    <header className="echo-header">
      <div className="echo-header-left">
        <h1 className="echo-logo"><span className="echo-logo-accent">_</span>echo</h1>
      </div>
      <div className="echo-header-center">
        <div className={`echo-state-badge state-${appState.toLowerCase().replace(/\s+/g, '-')}`}>
          <span className="state-dot"></span>
          <span className="state-text">{appState}</span>
        </div>
      </div>
      <div className="echo-header-right">
        <button className="icon-btn" aria-label="Menu">
          <Menu size={20} color="var(--text-primary)" />
        </button>
      </div>
    </header>
  );
}
