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
      {/* Изображение аиста из /public/icon-192.png */}
      <img
        src="/icon-192.png"
        alt="AIST"
        style={{
          width: '96px',
          height: '96px',
          marginBottom: '1.4rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      />

      <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '0.8rem' }}>
        AIST Мессенджер
      </h1>
      <p style={{ opacity: 0.95, marginBottom: '2rem', maxWidth: '360px', lineHeight: 1.5 }}>
        Безопасный мессенджер для пользователей Российской Федерации
      </p>

      {view === 'main' && (
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <button
            onClick={() => alert('Код отправлен в Telegram')}
            style={{
              display: 'block',
              width: '100%',
              padding: '1.1rem',
              backgroundColor: '#4fc3f7',
              color: '#000',
              fontWeight: '700',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.15rem',
              marginBottom: '1.2rem',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔹 Получить код через Telegram
          </button>

          <button
            onClick={() => alert('Откройте камеру для сканирования QR')}
            style={{
              display: 'block',
              width: '100%',
              padding: '1.1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontWeight: '700',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              fontSize: '1.15rem',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            📷 У меня есть QR-код
          </button>
        </div>
      )}
    </div>
  );
}