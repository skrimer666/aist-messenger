// src/pages/Register.jsx
import { useState } from 'react';

// Всегда используем полный URL — работает и локально, и на Vercel
const API_BASE = 'https://api.get-aist.ru';

export default function Register() {
  const [step, setStep] = useState('phone'); // 'phone' или 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 11) {
      setError('Введите номер: +7 XXX XXX-XX-XX');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_BASE}/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+7${clean.slice(-10)}` }),
      });

      if (!res.ok) throw new Error('Не удалось отправить код');
      const data = await res.json();
      if (data.method === 'telegram') {
        setStep('code');
      } else {
        throw new Error('Неподдерживаемый метод');
      }
    } catch (err) {
      setError(err.message || 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const cleanPhone = phone.replace(/\D/g, '');
      const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+7${cleanPhone.slice(-10)}`,
          code: code,
        }),
      });

      if (!res.ok) throw new Error('Неверный код');

      const session = await res.json();
      sessionStorage.setItem('aist_session', JSON.stringify(session));
      window.location.href = '/profile';
    } catch (err) {
      setError(err.message || 'Ошибка проверки кода');
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
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '1rem',
      textAlign: 'center',
    }}>
      <img
        src="/icon-192.png"
        alt="AIST"
        style={{
          width: '96px',
          height: '96px',
          marginBottom: '1.2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      />

      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
        AIST Мессенджер
      </h1>

      {step === 'phone' && (
        <form onSubmit={handleRequestCode} style={{ marginTop: '1.5rem', width: '100%', maxWidth: '320px' }}>
          <input
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1rem',
            }}
          />
          {error && <p style={{ color: '#ff9999', marginTop: '0.6rem', fontSize: '0.9rem' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1.2rem',
              width: '100%',
              padding: '0.9rem',
              backgroundColor: loading ? '#90caf9' : '#1e88e5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            {loading ? 'Отправка...' : 'Получить код через Telegram'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerifyCode} style={{ marginTop: '1.5rem', width: '100%', maxWidth: '320px' }}>
          <p>Введите код из Telegram</p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength="6"
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1.3rem',
              textAlign: 'center',
              letterSpacing: '6px',
            }}
          />
          {error && <p style={{ color: '#ff9999', marginTop: '0.6rem', fontSize: '0.9rem' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            style={{
              marginTop: '1.2rem',
              width: '100%',
              padding: '0.9rem',
              backgroundColor: (loading || code.length !== 6) ? '#90caf9' : '#1e88e5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
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