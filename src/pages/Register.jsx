import { useState } from 'react';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const sendSMS = async () => {
    // Валидация номера
    const phoneRegex = /^\+?7\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert('Введите номер в формате +79991234567');
      return;
    }

    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (data.ok) {
        alert('SMS отправлено!');
      } else {
        alert('Ошибка отправки: ' + (data.error || 'неизвестно'));
      }
    } catch (e) {
      alert('Ошибка сети: ' + e.message);
    }
  };

  const verifyCode = async () => {
    if (!phone || !code) {
      alert('Заполните все поля');
      return;
    }

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      const data = await res.json();
      if (data.userId) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);
        window.location.href = '/profile';
      } else {
        alert('Ошибка: ' + (data.error || 'неверный код'));
      }
    } catch (e) {
      alert('Ошибка сети: ' + e.message);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>AIST Messenger</h2>
      
      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+79991234567"
        style={{
          display: 'block',
          width: '100%',
          padding: 12,
          fontSize: 16,
          marginBottom: 12,
          border: '1px solid #ccc',
          borderRadius: 6
        }}
      />
      
      <button
        onClick={sendSMS}
        style={{
          width: '100%',
          padding: 12,
          backgroundColor: '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          cursor: 'pointer',
          marginBottom: 20
        }}
      >
        Получить SMS
      </button>

      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Код из SMS"
        style={{
          display: 'block',
          width: '100%',
          padding: 12,
          fontSize: 16,
          marginBottom: 12,
          border: '1px solid #ccc',
          borderRadius: 6
        }}
      />
      
      <button
        onClick={verifyCode}
        style={{
          width: '100%',
          padding: 12,
          backgroundColor: '#34C759',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        Войти
      </button>
    </div>
  );
}// /src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  // Встроенный SVG-фон (абстрактные волны, синие тона — ассоциация с надёжностью)
  const bgSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0d47a1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e88e5;stop-opacity:0.9" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" />
      <path d="M0,300 Q200,400 400,300 T800,300 L800,600 L0,600 Z" fill="rgba(255,255,255,0.05)"/>
      <path d="M0,200 Q300,100 600,200 T1200,200 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.03)"/>
    </svg>
  `).replace(/'/g, '%27');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `url("data:image/svg+xml,${bgSvg}")`,
        backgroundSize: 'cover',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffffff',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1 style={{ textAlign: 'center', margin: '0 0 1.5rem', fontSize: '2rem' }}>
          AIST Messenger
        </h1>
        <p style={{ textAlign: 'center', opacity: 0.9, marginBottom: '2rem' }}>
          Ваши сообщения — только у вас
        </p>
        <form>
          <div style={{ marginBottom: '1.2rem' }}>
            <input
              type="text"
              placeholder="Логин или email"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              placeholder="Пароль"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.85rem',
              backgroundColor: '#1e88e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#1976d2')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#1e88e5')}
          >
            Войти
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Нет аккаунта?{' '}
          <a href="/register" style={{ color: '#bbdefb', textDecoration: 'none' }}>
            Создать
          </a>
        </p>
      </div>
    </div>
  );
}