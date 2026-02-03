// src/pages/Register.jsx
import { useState } from 'react';

// Встроенный SVG-логотип аиста
const StorkLogo = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginBottom: '1rem' }}
  >
    {/* Тело */}
    <path
      d="M12 4C8 4 5 7 5 11c0 2 1 4 3 5-3 1-5 3-5 6 0 2 2 3 4 3s4-1 5-3c1 2 3 3 5 3s4-1 4-3c0-3-2-5-5-6 1-2 2-4 2-6 0-4-3-7-7-7z"
      stroke="white"
      strokeWidth="1.2"
    />
    {/* Глаз */}
    <circle cx="12" cy="10" r="1" fill="white" />
    {/* Клюв */}
    <path d="M15 9.5l1.5 -0.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default function Register() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Код отправлен в Telegram');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d47a1, #1e88e5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      padding: '1rem',
    }}>
      {/* 👇 SVG-логотип вместо <img> */}
      <StorkLogo />

      <h1>AIST Мессенджер</h1>
      <p>Безопасный вход для пользователей РФ</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem', width: '100%', maxWidth: '320px' }}>
        <input
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.3)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '1rem',
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.8rem',
            backgroundColor: '#1e88e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
          }}
        >
          Получить код через Telegram
        </button>
      </form>
    </div>
  );
}