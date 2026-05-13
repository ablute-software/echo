import React, { useState, useEffect, useRef } from 'react';
import EchoAppShell from '../components/EchoAppShell';
import EchoListenerVisual from '../components/EchoListenerVisual';
import EchoInputBar from '../components/EchoInputBar';
import EchoMessageBubble from '../components/EchoMessageBubble';
import { 
  getLocalTodayDate, 
  getConversation, 
  getAllConversations, 
  getConversationSummary, 
  saveConversationSummary, 
  saveMessage, 
  clearHistory 
} from '../utils/conversationStorage';
import './Conversar.css';

const FIRST_VISIT_GREETINGS = [
  "Olá! Fala-me de algo que gostas mesmo de fazer quando tens tempo para ti.",
  "Olá! Se eu fosse conhecer-te aos poucos, por onde achas que devia começar?",
  "Olá! Conta-me uma coisa simples sobre ti — algo que faça parte do teu dia a dia.",
  "Olá! Que tipo de momentos te fazem sentir mais tu?",
  "Olá! O que é que costuma ocupar mais a tua cabeça nos últimos tempos?",
  "Olá! Há alguma coisa que gostavas que eu percebesse sobre ti desde o início?",
  "Olá! Que tipo de coisas te dão energia — mesmo que sejam pequenas?",
  "Olá! Quando tens um dia pesado, o que costumas fazer para aguentar ou desligar?",
  "Olá! Fala-me de uma coisa que gostas, uma coisa que te cansa, ou uma coisa que tens pensado ultimamente.",
  "Olá! Não precisas de preparar nada. Conta-me só uma coisa sobre ti para começarmos."
];

const RETURNING_USER_GREETINGS = [
  "Olá, bom ver-te de novo. O que tem ocupado a tua cabeça hoje?",
  "Olá. Queres continuar de onde ficámos ou há outra coisa mais presente hoje?",
  "Bem-vindo de volta. O que é que mudou desde a última vez que falámos?",
  "Olá! Como estão as coisas por aí hoje?",
  "Bom dia! (Ou boa tarde!) Há alguma coisa que queiras atirar cá para fora antes de começarmos?"
];

export default function Conversar() {
  const [messages, setMessages] = useState([]);
  const [appState, setAppState] = useState('Pronta'); 
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [conversationSummary, setConversationSummary] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    // Adding a slight delay ensures DOM updates have happened before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    const today = getLocalTodayDate();
    const existingConvo = getConversation(today);
    const summary = getConversationSummary();
    const allConvos = getAllConversations();
    
    setConversationSummary(summary);

    if (existingConvo && existingConvo.messages.length > 0) {
      // Same-day return: load today's messages and continue
      const formattedMessages = existingConvo.messages.map(m => ({
        id: m.message_id,
        sender: m.sender,
        text: m.visible_text
      }));
      setMessages(formattedMessages);
    } else {
      // No conversation for today.
      if (allConvos.length > 0) {
        // Returning user, new day
        const randomGreeting = RETURNING_USER_GREETINGS[Math.floor(Math.random() * RETURNING_USER_GREETINGS.length)];
        const initialMsg = { id: Date.now(), sender: 'echo', text: randomGreeting };
        setMessages([initialMsg]);
        saveMessage(today, initialMsg);
      } else {
        // Absolute first visit
        const randomGreeting = FIRST_VISIT_GREETINGS[Math.floor(Math.random() * FIRST_VISIT_GREETINGS.length)];
        const initialMsg = { id: Date.now(), sender: 'echo', text: randomGreeting };
        setMessages([initialMsg]);
        saveMessage(today, initialMsg);
      }
    }
  }, []);

  // Update backend summary quietly
  useEffect(() => {
    saveConversationSummary(conversationSummary);
  }, [conversationSummary]);

  // Scroll whenever messages array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    const today = getLocalTodayDate();
    
    const newUserMsg = { id: Date.now(), sender: 'user', text };
    
    // Save locally
    const savedUserMsg = saveMessage(today, newUserMsg);
    
    // Update state
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setErrorMsg(null);
    setAppState('A pensar');
    
    // Detetar se a última resposta da _echo terminou com uma pergunta
    let lastAssistantAskedQuestion = false;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'echo') {
        const lastText = messages[i].text.trim();
        if (lastText.endsWith('?')) {
          lastAssistantAskedQuestion = true;
        }
        break; // Check only the last message from echo
      }
    }

    try {
      const response = await fetch('/api/echo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationSummary: conversationSummary,
          conversationId: savedUserMsg.conversation_id,
          lastAssistantAskedQuestion: lastAssistantAskedQuestion
        })
      });

      if (!response.ok) {
        if (response.status === 400) throw new Error("A mensagem está demasiado longa. Tenta resumir um pouco.");
        if (response.status === 429) throw new Error("Chegámos ao limite temporário de mensagens. Tenta novamente mais tarde.");
        throw new Error("Não consegui responder agora. Tenta novamente dentro de momentos.");
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAppState('A responder');
      
      // Update hidden conversation summary if the backend provided one
      if (data.updated_conversation_summary) {
        setConversationSummary(data.updated_conversation_summary);
      }
      
      setTimeout(() => {
        const newEchoMsg = { 
          id: Date.now(), 
          sender: 'echo', 
          text: data.visible_reply || data.reply || "Não consegui formular uma resposta."
        };
        saveMessage(today, newEchoMsg);
        setMessages(prev => [...prev, newEchoMsg]);
        setAppState('Pronta');
      }, 800); 

    } catch (err) {
      console.error("Chat error:", err);
      setAppState('Erro');
      setErrorMsg(err.message || "Não consegui responder agora. Verifica a ligação.");
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
    }
  };

  return (
    <EchoAppShell activeTab="/" appState={appState}>
      <div className="conversar-container">
        
        {/* Visual Anchor */}
        <div className="visual-anchor">
          <EchoListenerVisual state={appState === 'Erro' ? 'Em pausa' : appState} />
        </div>

        {/* Messages Area - fully scrollable */}
        <div className="messages-area">
          <div className="messages-list">
            {messages.map(msg => (
              <EchoMessageBubble key={msg.id} text={msg.text} sender={msg.sender} />
            ))}
            <div ref={messagesEndRef} style={{ height: '1px', flexShrink: 0 }} />
          </div>
          
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
