import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Sparkles, AlertCircle } from 'lucide-react';
import './EchoInputBar.css';

export default function EchoInputBar({ onSend, isListening, toggleListen, disabled = false }) {
  const [text, setText] = useState('');
  const [voiceError, setVoiceError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  
  // Refs to avoid stale closures in event listeners
  const isListeningRef = useRef(isListening);
  const toggleListenRef = useRef(toggleListen);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    toggleListenRef.current = toggleListen;
  }, [toggleListen]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'pt-PT';

    recognition.onstart = () => {
      setVoiceError(null);
      // We don't want to reset baseTextRef here if the user just paused and resumed.
      // But actually, we do want to capture the current input text as the base.
      // We will capture it when `isListening` flips to true in the other effect.
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      let fullText = baseTextRef.current + finalTranscript + interimTranscript;
      if (fullText.length > 500) {
        fullText = fullText.slice(0, 500);
      }
      setText(fullText);
      
      if (finalTranscript) {
        baseTextRef.current += finalTranscript;
        if (baseTextRef.current.length > 500) {
          baseTextRef.current = baseTextRef.current.slice(0, 500);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setVoiceError('Permissão do microfone negada.');
      } else if (event.error === 'network') {
        setVoiceError('Erro de rede. Verifica a ligação.');
      } else if (event.error !== 'no-speech') {
        setVoiceError('Não consegui ouvir bem. Tenta outra vez.');
      }
      
      if (isListeningRef.current && toggleListenRef.current) {
        toggleListenRef.current(); 
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current && toggleListenRef.current) {
        toggleListenRef.current(); 
      }
    };

    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        setVoiceError(null);
        baseTextRef.current = text ? text + ' ' : '';
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Failed to stop recognition:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && text.length <= 500 && !disabled) {
      if (isListening && toggleListen) {
        toggleListen(); 
      }
      onSend(text);
      setText('');
      setVoiceError(null);
      baseTextRef.current = '';
    }
  };

  return (
    <div className={`echo-input-container glass ${disabled ? 'disabled' : ''}`}>
      {voiceError && (
        <div className="voice-error-toast animate-fade-in">
          <AlertCircle size={14} />
          <span>{voiceError}</span>
        </div>
      )}
      <form className="echo-input-form" onSubmit={handleSubmit}>
        <div className="input-icon-prefix">
          <Sparkles size={18} color="var(--accent-primary)" />
        </div>
        <input
          type="text"
          className="echo-text-input"
          placeholder={isListening ? "A ouvir..." : (isSupported ? "Escreve ou dita a tua mensagem..." : "Escreve a tua mensagem...")}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          disabled={disabled}
          maxLength={500}
        />
        
        <div className={`char-counter ${text.length >= 500 ? 'limit-reached' : ''}`}>
          {text.length}/500
        </div>
        
        {text.trim() && text.length <= 500 && !isListening ? (
          <button type="submit" className="echo-action-btn send-btn animate-fade-in" disabled={disabled}>
            <Send size={20} />
          </button>
        ) : (
          isSupported && (
            <button 
              type="button" 
              className={`echo-action-btn mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListen}
              disabled={disabled}
            >
              <Mic size={20} />
            </button>
          )
        )}
      </form>
    </div>
  );
}
