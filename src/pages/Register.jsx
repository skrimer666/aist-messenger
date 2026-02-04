// src/pages/Register.jsx
import { useState } from 'react';

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.get-aist.ru'
  : '';

export default function Register() {
  const [step, setStep] = useState('phone'); // 'phone', 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10 || clean.length > 11) {
      setError('Введите номер +7 XXX XXX-XX-XX');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_BASE}/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+7${clean}` }),
      });

      if (!res.ok) throw new Error('Не удалось отправить код');
      const data = await res.json();
      if (data.method === 'telegram') {
        setStep('code');
      } else {
        throw new Error('Неподдерживаемый метод');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+7${phone.replace(/\D/g, '')}`, code }),
      });

      if (!res.ok) throw new Error('Неверный код');

      // Успешная авторизация
      const session = await res.json();
      sessionStorage.setItem('aist_session', JSON.stringify(session));
      window.location.href = '/profile';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <img 
        src="/icon-192.png" 
        alt="AIST" 
        style={{ width: '80px', height: '80px', marginBottom: '1rem' }} 
      />
      
      <h1>AIST Мессенджер</h1>

      {step === 'phone' && (
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
            disabled={loading}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.8rem',
              backgroundColor: loading ? '#90caf9' : '#1e88e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            {loading ? 'Отправка...' : 'Получить код через Telegram'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerifyCode} style={{ marginTop: '2rem', width: '100%', maxWidth: '320px' }}>
          <p>Код из Telegram</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength="6"
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1.2rem',
              textAlign: 'center',
              letterSpacing: '4px',
            }}
          />
          {error && <p style={{ color: '#ff9999', marginTop: '0.5rem' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.8rem',
              backgroundColor: (loading || code.length !== 6) ? '#90caf9' : '#1e88e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>
          <button
            type="button"
            onClick={() => setStep('phone')}
            style={{
              marginTop: '1rem',
              color: 'rgba(255,255,255,0.8)',
              background: 'none',
              border: 'none',
              fontSize: '0.95rem',
            }}
          >
            ← Изменить номер
          </button>
        </form>
      )}
    </div>
  );
}