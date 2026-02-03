// src/pages/Register.jsx
import { useState } from 'react';

// SVG-иконка аиста (встроена, безопасна, оффлайн)
const StorkIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginBottom: '1rem' }}
  >
    {/* Тело аиста */}
    <path
      d="M12 4C8 4 5 7 5 11c0 2 1 4 3 5-3 1-5 3-5 6 0 2 2 3 4 3s4-1 5-3c1 2 3 3 5 3s4-1 4-3c0-3-2-5-5-6 1-2 2-4 2-6 0-4-3-7-7-7z"
      stroke="white"
      strokeWidth="1.2"
      fill="none"
    />
    {/* Глаз */}
    <circle cx="12" cy="10" r="1" fill="white" />
    {/* Клюв */}
    <path d="M15 9l2-1 1 1-2 1z" fill="white" />
  </svg>
);

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
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      {/* Иконка аиста */}
      <StorkIcon />

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