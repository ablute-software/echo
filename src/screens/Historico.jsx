import React from 'react';
import EchoAppShell from '../components/EchoAppShell';
import { mockHistory } from '../mockData';
import { Search, ChevronRight } from 'lucide-react';
import './Historico.css';

export default function Historico() {
  return (
    <EchoAppShell activeTab="/historico" appState="Em pausa">
      <div className="historico-container animate-fade-in">
        <div className="historico-header">
          <h2 className="screen-title">Histórico</h2>
          <div className="search-bar glass">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Pesquisar conversas..." className="search-input" />
          </div>
        </div>

        <div className="history-list">
          {mockHistory.map(item => (
            <div key={item.id} className="history-item glass">
              <div className="history-item-content">
                <div className="history-item-header">
                  <h3 className="history-title">{item.title}</h3>
                  <span className="history-date">{item.date}</span>
                </div>
                <p className="history-preview">{item.preview}</p>
              </div>
              <ChevronRight size={20} className="history-chevron" />
            </div>
          ))}
        </div>
      </div>
    </EchoAppShell>
  );
}
