// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(''); // '', 'sent', 'error'
  const [error, setError] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10 || clean.length > 11) {
      setError('Введите номер +7 XXX XXX-XX-XX');
      return;
    }

    try {
      setStatus('loading');
      setError('');

      const res = await fetch('https://api.get-aist.ru/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+7${clean}` }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.method === 'telegram') {
        setStatus('sent');
      } else {
        throw new Error('Неизвестный метод подтверждения');
      }
    } catch (err) {
      setError(err.message);
      setStatus('');
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
    }}>
      {/* Иконка аиста */}
      <img 
        src="/icon-192.png" 
        alt="AIST" 
        style={{ width: '80px', height: '80px', marginBottom: '1rem' }} 
      />
      
      <h1>AIST Мессенджер</h1>
      <p>Безопасный вход для пользователей РФ</p>

      {status === 'sent' ? (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(0,0,0,0.2)', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p>✅ Код отправлен в Telegram</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Проверьте сообщения от бота
          </p>
        </div>
      ) : (
        <form onSubmit={handleRequestCode} style={{ marginTop: '2rem', width: '100%', maxWidth: '320px' }}>
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
            disabled={status === 'loading'}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.8rem',
              backgroundColor: status === 'loading' ? '#90caf9' : '#1e88e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'loading' ? 'Отправка...' : 'Получить код через Telegram'}
          </button>
        </form>
      )}
    </div>
  );
}