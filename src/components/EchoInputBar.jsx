import React, { useState } from 'react';
import { Mic, Send, Sparkles } from 'lucide-react';
import './EchoInputBar.css';

export default function EchoInputBar({ onSend, isListening, toggleListen, disabled = false }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className={`echo-input-container glass ${disabled ? 'disabled' : ''}`}>
      <form className="echo-input-form" onSubmit={handleSubmit}>
        <div className="input-icon-prefix">
          <Sparkles size={18} color="var(--accent-primary)" />
        </div>
        <input
          type="text"
          className="echo-text-input"
          placeholder="Escreve ou fala sem preparar..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
        />
        
        {text.trim() ? (
          <button type="submit" className="echo-action-btn send-btn animate-fade-in" disabled={disabled}>
            <Send size={20} />
          </button>
        ) : (
          <button 
            type="button" 
            className={`echo-action-btn mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListen}
            disabled={disabled}
          >
            <Mic size={20} />
          </button>
        )}
      </form>
    </div>
  );
}
