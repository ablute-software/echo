import React, { useState, useEffect, useRef } from 'react';
import EchoAppShell from '../components/EchoAppShell';
import EchoMessageBubble from '../components/EchoMessageBubble';
import { getHistorySummaries, getConversation } from '../utils/conversationStorage';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import './Historico.css';

export default function Historico() {
  const [summaries, setSummaries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load summaries on mount
    setSummaries(getHistorySummaries());
  }, []);

  const handleOpenConversation = (date) => {
    const convo = getConversation(date);
    if (convo) {
      setActiveConversation(convo);
      setSelectedDate(date);
    }
  };

  const handleBack = () => {
    setSelectedDate(null);
    setActiveConversation(null);
  };

  useEffect(() => {
    if (selectedDate && messagesEndRef.current) {
      // Scroll to bottom of the read-only history
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDate, activeConversation]);

  return (
    <EchoAppShell activeTab="/historico" appState="Em pausa">
      <div className="historico-container animate-fade-in">
        
        {!selectedDate ? (
          // --- LIST VIEW ---
          <>
            <div className="historico-header">
              <h2 className="screen-title">Histórico</h2>
              <div className="search-bar glass">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Pesquisar conversas..." className="search-input" />
              </div>
            </div>

            <div className="history-list">
              {summaries.length === 0 ? (
                <div className="history-empty">
                  <p>Ainda não tens conversas guardadas.</p>
                </div>
              ) : (
                summaries.map(item => (
                  <div 
                    key={item.id} 
                    className="history-item glass"
                    onClick={() => handleOpenConversation(item.date)}
                  >
                    <div className="history-item-content">
                      <div className="history-item-header">
                        <h3 className="history-title">{item.date}</h3>
                        <span className="history-badge">{item.messageCount} msgs</span>
                      </div>
                      <p className="history-preview">{item.preview}</p>
                    </div>
                    <ChevronRight size={20} className="history-chevron" />
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          // --- DETAIL VIEW (READ-ONLY) ---
          <div className="history-detail-view animate-fade-in">
            <div className="history-detail-header">
              <button className="back-btn glass" onClick={handleBack}>
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </button>
              <h3 className="history-detail-date">{selectedDate}</h3>
            </div>
            
            <div className="history-detail-messages">
              <div className="messages-list">
                {activeConversation?.messages.map(msg => (
                  <EchoMessageBubble 
                    key={msg.message_id} 
                    text={msg.visible_text} 
                    sender={msg.sender} 
                  />
                ))}
                <div ref={messagesEndRef} style={{ height: '1px', flexShrink: 0 }} />
              </div>
            </div>
          </div>
        )}
        
      </div>
    </EchoAppShell>
  );
}
