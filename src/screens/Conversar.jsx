import React, { useState, useEffect, useRef } from 'react';
import EchoAppShell from '../components/EchoAppShell';
import EchoListenerVisual from '../components/EchoListenerVisual';
import EchoInputBar from '../components/EchoInputBar';
import EchoMessageBubble from '../components/EchoMessageBubble';
import './Conversar.css';

export default function Conversar() {
  const [messages, setMessages] = useState([]);
  const [appState, setAppState] = useState('Pronta'); // Pronta, A ouvir, A pensar, A responder, Em pausa, Erro
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Resume card state (hidden for this real flow unless history is loaded)
  const [showResumeCard, setShowResumeCard] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    // Add user message
    const newUserMsg = { id: Date.now(), sender: 'user', text };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setShowResumeCard(false);
    setErrorMsg(null);
    setAppState('A pensar');
    
    // Prepare history for API
    // We send up to the last 10 messages for context
    const historyForApi = updatedMessages.slice(-10).slice(0, -1).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    try {
      const response = await fetch('/api/echo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: historyForApi
        })
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAppState('A responder');
      
      setTimeout(() => {
        const newEchoMsg = { 
          id: Date.now(), 
          sender: 'echo', 
          text: data.reply 
        };
        setMessages(prev => [...prev, newEchoMsg]);
        setAppState('Pronta');
      }, 800); // Small visual delay to show the "A responder" state

    } catch (err) {
      console.error("Chat error:", err);
      setAppState('Erro');
      setErrorMsg("Não consegui responder agora. Verifica a configuração da OpenAI.");
      
      // Optionally reset state to ready after a while
      setTimeout(() => setAppState('Pronta'), 4000);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      setAppState('Pronta');
    } else {
      setIsListening(true);
      setAppState('A ouvir');
      setShowResumeCard(false);
    }
  };

  return (
    <EchoAppShell activeTab="/" appState={appState}>
      <div className="conversar-container">
        
        {/* Visual Anchor */}
        <div className="visual-anchor">
          <EchoListenerVisual state={appState === 'Erro' ? 'Em pausa' : appState} />
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {messages.length === 0 && !showResumeCard ? (
            <div className="kickoff-message animate-fade-in">
              <p>Fala sem preparar.</p>
            </div>
          ) : (
            <div className="messages-list">
              {showResumeCard && messages.length === 0 && (
                <div className="resume-card glass animate-fade-in">
                  <p className="resume-text">Da última vez ficaram dois temas no ar. Queres voltar a algum ou seguimos por outro lado?</p>
                  <div className="resume-options">
                    <button className="resume-btn">A pressão no trabalho</button>
                    <button className="resume-btn">Aquela ideia que ficou por organizar</button>
                    <button className="resume-btn secondary" onClick={() => setShowResumeCard(false)}>Seguir por outro lado</button>
                  </div>
                </div>
              )}
              
              {messages.map(msg => (
                <EchoMessageBubble key={msg.id} text={msg.text} sender={msg.sender} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {errorMsg && (
            <div className="error-toast animate-fade-in">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-anchor">
          <EchoInputBar 
            onSend={handleSend} 
            isListening={isListening} 
            toggleListen={toggleListen} 
            disabled={appState === 'A pensar' || appState === 'A responder'}
          />
        </div>
      </div>
    </EchoAppShell>
  );
}
