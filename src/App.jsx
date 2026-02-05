// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register'; // ваша страница регистрации
import ChatLayout from './pages/ChatLayout'; // ваш основной чат

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Главная страница — редирект на регистрацию */}
          <Route path="/" element={<Navigate to="/register" />} />
          
          {/* Страница входа через Telegram */}
          <Route path="/register" element={<Register />} />
          
          {/* Основной чат */}
          <Route path="/chat" element={<ChatLayout />} />
          
          {/* На все другие маршруты — редирект на главную */}
          <Route path="*" element={<Navigate to="/register" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;