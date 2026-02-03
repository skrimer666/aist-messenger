// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  const [view, setView] = useState('main');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Классический синий градиент + волны
  const bgSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0d47a1" />
          <stop offset="50%" stop-color="#1e88e5" />
          <stop offset="100%" stop-color="#4fc3f7" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <path d="M0,300 Q200,400 400,300 T800,300 L800,600 L0,600 Z" fill="rgba(255,255,255,0.08)"/>
      <path d="M0,200 Q300,100 600,200 T1200,200 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.06)"/>
    </svg>
  `).replace(/'/g, '%27');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10 || clean.length > 11) {
      setError('Введите номер +7 XXX XXX-XX-XX');
      return;
    }

    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      });

      if (!res.ok) throw new Error('Не удалось отправить код');
      setView('code');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), code }),
      });

      if (!res.ok) throw new Error('Неверный код');
      sessionStorage.setItem('aist_session', JSON.stringify(await res.json()));
      window.location.href = '/profile';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInLogo {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: `url("image/svg+xml,${bgSvg}")`,
          backgroundSize: 'cover',
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
        {/* Иконка аиста */}
        <img
          src="/icon-192.png"
          alt="AIST"
          style={{
            width: '96px',
            height: '96px',
            marginBottom: '1.2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            opacity: 0,
            animation: 'fadeInLogo 0.8s forwards 0.2s',
          }}
        />

        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '0.8rem' }}>
          AIST Мессенджер
        </h1>

        {/* УТП */}
        {view === 'main' && (
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '1.2rem',
            maxWidth: '400px',
            marginBottom: '2rem',
            fontSize: '0.95rem',
            lineHeight: 1.5,
          }}>
            <p>🔒 Сквозное шифрование</p>
            <p>🇷🇺 Для пользователей РФ</p>
            <p>📱 Данные — только на вашем устройстве</p>
          </div>
        )}

        {/* Кнопки */}
        {view === 'main' && (
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <button
              onClick={() => setView('telegram')}
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
              }}
            >
              🔹 Получить код через Telegram
            </button>
            <button
              onClick={() => setView('qr')}
              style={{
                display: 'block',
                width: '100%',
                padding: '1.1rem',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '16px',
                fontSize: '1.15rem',
                cursor: 'pointer',
              }}
            >
              📷 У меня есть QR-код
            </button>
          </div>
        )}

        {/* Формы */}
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
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem',
              }}
            />
            {error && <p style={{ color: '#ff9999', marginTop: '0.6rem' }}>{error}</p>}
            <button type="submit" style={{ marginTop: '1.2rem', width: '100%', padding: '0.9rem', backgroundColor: '#1e88e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600' }}>
              Отправить код
            </button>
            <button type="button" onClick={() => setView('main')} style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', fontSize: '0.95rem' }}>
              ← Назад
            </button>
          </form>
        )}

        {view === 'code' && (
          <form onSubmit={handleVerifyCode} style={{ width: '100%', maxWidth: '320px' }}>
            <p>Код из Telegram</p>
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
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '6px',
              }}
            />
            {error && <p style={{ color: '#ff9999', marginTop: '0.6rem' }}>{error}</p>}
            <button type="submit" style={{ marginTop: '1.2rem', width: '100%', padding: '0.9rem', backgroundColor: '#1e88e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600' }}>
              Подтвердить
            </button>
            <button type="button" onClick={() => setView('telegram')} style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', fontSize: '0.95rem' }}>
              ← Изменить номер
            </button>
          </form>
        )}

        {view === 'qr' && (
          <div style={{ width: '100%', maxWidth: '320px' }}>
            <p>Откройте камеру и наведите на QR-код с другого устройства.</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '1rem' }}>Код действует 1 минуту</p>
            <button
              onClick={() => alert('Используйте камеру для сканирования QR')}
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.9rem', backgroundColor: '#1e88e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600' }}
            >
              Сканировать QR
            </button>
            <button
              onClick={() => setView('main')}
              style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', fontSize: '0.95rem' }}
            >
              ← Назад
            </button>
          </div>
        )}
      </div>
    </>
  );
}