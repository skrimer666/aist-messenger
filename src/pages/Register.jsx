// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  const [view, setView] = useState('main'); // 'main', 'telegram', 'qr'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Не удалось отправить код');
      }
      setView('code');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), code }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Неверный код');
      }

      const { loginHash, publicKey } = await res.json();
      sessionStorage.setItem('aist_session', JSON.stringify({ loginHash, publicKey }));
      window.location.href = '/profile';
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '1rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        AIST Messenger
      </h1>

      {view === 'main' && (
        <>
          {/* УТП — ключевые преимущества */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(6px)',
            borderRadius: '16px',
            padding: '1.2rem',
            maxWidth: '400px',
            marginBottom: '2rem',
            fontSize: '0.95rem',
            lineHeight: 1.5,
          }}>
            <p>🔒 <strong>Сквозное шифрование</strong><br />Ваши сообщения читаете только вы и получатель.</p>
            <p>🇷🇺 <strong>Для пользователей РФ</strong><br />Серверы и поддержка в России. Соответствие законодательству.</p>
            <p>📱 <strong>Данные — только у вас</strong><br />Чаты хранятся исключительно на вашем устройстве.</p>
            <p>🛡️ <strong>Безопасный вход</strong><br />Через Telegram или QR-код — без паролей в облаке.</p>
          </div>

          <div style={{ width: '100%', maxWidth: '360px' }}>
            <button
              onClick={() => setView('telegram')}
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
              onClick={() => setView('qr')}
              style={{
                display: 'block',
                width: '100%',
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontWeight: '600',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '14px',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              📷 У меня есть QR-код
            </button>
          </div>
        </>
      )}

      {view === 'telegram' && (
        <form onSubmit={handleRequestCode} style={{ width: '100%', maxWidth: '320px' }}>
          <input
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
          {error && <p style={{ color: '#ff9999', marginTop: '0.6rem', fontSize