import React from 'react';
import { Clock, MessageCircle, Hash } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './EchoBottomNav.css';

export default function EchoBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="echo-bottom-nav glass">
      <Link to="/historico" className={`nav-item ${currentPath === '/historico' ? 'active' : ''}`}>
        <Clock size={20} className="nav-icon" />
        <span className="nav-label">Histórico</span>
      </Link>
      
      <Link to="/" className={`nav-item center-item ${currentPath === '/' ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <MessageCircle size={22} className="nav-icon" />
        </div>
        <span className="nav-label">Conversar</span>
      </Link>
      
      <Link to="/assuntos" className={`nav-item ${currentPath === '/assuntos' ? 'active' : ''}`}>
        <Hash size={20} className="nav-icon" />
        <span className="nav-label">Assuntos</span>
      </Link>
    </nav>
  );
}
