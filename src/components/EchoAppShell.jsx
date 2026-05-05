import React from 'react';
import EchoHeader from './EchoHeader';
import EchoBottomNav from './EchoBottomNav';
import './EchoAppShell.css';

export default function EchoAppShell({ children, activeTab, onTabChange, appState }) {
  return (
    <div className="echo-app-shell">
      <EchoHeader appState={appState} />
      <main className="echo-main-content">
        {children}
      </main>
      <EchoBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
