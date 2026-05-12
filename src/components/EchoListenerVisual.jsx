import React from 'react';
import './EchoListenerVisual.css';

export default function EchoListenerVisual({ state = 'Pronta' }) {
  const normalizedState = state.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`echo-listener-container state-${normalizedState}`}>
      {/* Subtle glow behind the image to integrate it with the background */}
      <div className="listener-glow-bg"></div>
      
      {/* Delicate aquatic halos behind the sphere */}
      <div className="listener-halo halo-1"></div>
      <div className="listener-halo halo-2"></div>
      <div className="listener-halo halo-3"></div>
      
      {/* The static image orb asset */}
      <img src="/sphere.png" alt="Echo Sphere" className="listener-orb-image" />
    </div>
  );
}
