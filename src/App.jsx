import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './screens/Splash';
import Conversar from './screens/Conversar';
import Historico from './screens/Historico';
import Assuntos from './screens/Assuntos';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Conversar />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/assuntos" element={<Assuntos />} />
      </Routes>
    </Router>
  );
}

export default App;
