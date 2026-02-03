// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  const [view, setView] = useState('main');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d47a1, #1e88e5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      {/* Иконка аиста из /public/icon-192.png */}
      <img
        src="/icon-192.png"
        alt="AIST"
        style={{
          width: '80px',
          height: '80px',
          marginBottom: '1.2rem',
          imageRendering: 'pixelated', // сохраняет чёткость при масштабировании
        }}
      />

      <h1 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        AIST Мессенджер
      </h1>

      {view === 'main' && (
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <button
            onClick={() => alert('Telegram-вход (в разработке)')}
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              backgroundColor: '#4fc3f7',
              color: '#000',
              fontWeight: '600',
              border: 'none',
              borderRadius: '14px',
              fontSize: '1.1rem',
              marginBottom: '1rem',
              cursor: 'pointer',
            }}
          >
            🔹 Получить код через Telegram
          </button>

          <button
            onClick={() => alert('QR-вход (в разработке)')}
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '14px',
              fontSize: '1.1rem',
              cursor: 'pointer',
            }}
          >
            📷 У меня есть QR-код
          </button>
        </div>
      )}
    </div>
  );
}