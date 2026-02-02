// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  const [view, setView] = useState('main'); // 'main', 'telegram', 'qr'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleTelegramSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error('Не удалось отправить код');
      setView('code');
    } catch (err) {
      setError(err.message);
    }
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
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>AIST Messenger</h1>

      {view === 'main' && (
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <p style={{ opacity: 0.9, marginBottom: '2rem' }}>
            Безопасный вход для пользователей РФ
          </p>

          <button
            onClick={() => setView('telegram')}
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              backgroundColor: '#4fc3f7',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}
          >
            🔹 Получить код через Telegram
          </button>

          <button
            onClick={() => setView('qr')}
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
            }}
          >
            📷 У меня есть QR-код
          </button>
        </div>
      )}

      {view === 'telegram' && (
        <form onSubmit={handleTelegramSubmit} style={{ width: '100%', maxWidth: '320px' }}>
          <input
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
          {error && <p style={{ color: '#ff9999', marginTop: '0.5rem' }}>{error}</p>}
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
            }}
          >
            Отправить код
          </button>
          <button
            type="button"
            onClick={() => setView('main')}
            style={{
              marginTop: '1rem',
              color: 'rgba(255,255,255,0.8)',
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
            }}
          >
            ← Назад
          </button>
        </form>
      )}

      {view === 'qr' && (
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <p>Наведите камеру на QR-код с другого устройства.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '1rem' }}>
            Код действует 1 минуту
          </p>
          <button
            onClick={() => alert('В демо-режиме: откройте камеру и отсканируйте QR')}
            style={{
              marginTop: '1.5rem',
              width: '100%',
              padding: '0.8rem',
              backgroundColor: '#1e88e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
            }}
          >
            Сканировать QR
          </button>
          <button
            onClick={() => setView('main')}
            style={{
              marginTop: '1rem',
              color: 'rgba(255,255,255,0.8)',
              background: 'none',
              border: 'none',
            }}
          >
            ← Назад
          </button>
        </div>
      )}
    </div>
  );
}