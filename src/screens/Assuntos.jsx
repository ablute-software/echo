import React from 'react';
import EchoAppShell from '../components/EchoAppShell';
import { mockTopics } from '../mockData';
import './Assuntos.css';

export default function Assuntos() {
  return (
    <EchoAppShell activeTab="/assuntos" appState="Em pausa">
      <div className="assuntos-container animate-fade-in">
        <div className="assuntos-header">
          <h2 className="screen-title">Assuntos</h2>
          <p className="assuntos-subtitle">Assuntos detectados ao longo das conversas. Só o essencial.</p>
        </div>

        <div className="topics-section">
          <h3 className="section-title">Recentes</h3>
          <div className="topics-cloud">
            {mockTopics.recent.map((topic, index) => (
              <div key={`recent-${index}`} className="topic-chip glass">
                {topic}
              </div>
            ))}
          </div>
        </div>

        <div className="topics-section">
          <h3 className="section-title">Mais recorrentes</h3>
          <div className="topics-cloud">
            {mockTopics.recurring.map((topic, index) => (
              <div key={`recurring-${index}`} className="topic-chip glass recurring">
                {topic}
              </div>
            ))}
          </div>
        </div>
      </div>
    </EchoAppShell>
  );
}
