// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 11 || !clean.startsWith('7')) {
      setError('Введите номер в формате +7 XXX XXX-XX-XX');
      return;
    }

    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: `+${clean}` }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Не удалось отправить код');
      }

      alert('Код отправлен в Telegram');
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
      <img
        src="/icon-192.png"
        alt="AIST Logo"
        style={{
          width: '80px',
          height: '80px',
          marginBottom: '1rem',
        }}
      />
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
            fontWeight: '600',
          }}
        >
          Получить код через Telegram
        </button>
      </form>
    </div>
  );
}