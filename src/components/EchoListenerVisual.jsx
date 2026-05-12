import React from 'react';
import './EchoListenerVisual.css';

export default function EchoListenerVisual({ state = 'Pronta' }) {
  const normalizedState = state.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`echo-listener-container state-${normalizedState}`}>
      {/* Background radial glow */}
      <div className="listener-glow-bg"></div>
      
      {/* The abstract shape representing a listener / ear */}
      <div className="listener-abstract-shape">
        <div className="listener-inner-curve"></div>
        <div className="listener-core"></div>
      </div>
      
      {/* Dynamic waves/particles depending on state */}
      <div className="listener-waves">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>
      
      {/* Particles for 'A pensar' state */}
      <div className="listener-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
      </div>
    </div>
  );
}
