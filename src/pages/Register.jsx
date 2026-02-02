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
// /src/pages/Register.jsx
export default function Register() {
  const bgSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0d47a1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e88e5;stop-opacity:0.95" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <path d="M0,300 Q200,400 400,300 T800,300 L800,600 L0,600 Z" fill="rgba(255,255,255,0.06)"/>
      <path d="M0,200 Q300,100 600,200 T1200,200 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.04)"/>
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
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        padding: '1rem',
        margin: 0,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1 style={{ margin: '0 0 1rem', fontSize: '1.8rem' }}>AIST Messenger</h1>
        <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>Ваши сообщения — только у вас</p>
        <button
          onClick={() => {
            // Временная заглушка: генерируем ID и сохраняем
            const mockId = 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            localStorage.setItem('userId', mockId);
            window.location.href = '/profile';
          }}
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
          }}
        >
          Войти как гость (демо)
        </button>
        <p style={{ fontSize: '0.85rem', marginTop: '1.2rem', opacity: 0.8 }}>
          В продакшене здесь будет полноценная аутентификация с E2E-шифрованием.
        </p>
      </div>
    </div>
  );
}
