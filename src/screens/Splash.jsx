import React from 'react';
import './Splash.css';

export default function Splash() {
  return (
    <div className="splash-screen">
      <div className="splash-content animate-fade-in">
        <h1 className="splash-logo glow">_echo</h1>
        <p className="splash-tagline">A conversa que te ouve melhor com o tempo.</p>
        <div className="splash-loader"></div>
      </div>
    </div>
  );
}
