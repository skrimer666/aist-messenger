// src/pages/Register.jsx
import { useState } from 'react';

// SVG-иконка аиста (стилизованная, минималистичная, без внешних зависимостей)
const StorkIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginBottom: '1.2rem' }}
  >
    <path
      d="M12 2C8.5 2 5.5 4 5.5 7.5C5.5 9.5 6.5 11 8 12C5 13 3 15 3 18C3 20 4.5 21 6.5 21C8.5 21 10 20 11 18.5C12 19.5 13.5 20.5 15.5 20.5C18 20.5 20 18.5 20 16C20 14 18.5 12.5 16.5 12C17.5 10.5 18 8.5 18 6.5C18 3.5 15 2 12 2Z"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15C13.1 15 14 14.1 14 13C14 11.9 13.1 11 12 11C10.9 11 10 11.9 10 13C10 14.1 10.9 15 12 15Z"
      fill="white"
    />
  </svg>
);

export default function Register() {
  const [view, setView] = useState('main');

  return (
    <div style={{
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
    }}>
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