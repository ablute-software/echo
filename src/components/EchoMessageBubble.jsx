import React from 'react';
import './EchoMessageBubble.css';

export default function EchoMessageBubble({ text, sender }) {
  const isUser = sender === 'user';
  
  return (
    <div className={`message-wrapper ${isUser ? 'message-user' : 'message-echo'} animate-fade-in`}>
      <div className="message-bubble">
        {text}
      </div>
    </div>
  );
}
