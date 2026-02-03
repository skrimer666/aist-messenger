// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTelegramLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setError('Введите номер в формате +7 XXX XXX-XX-XX');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Запрос к вашему бэкенду
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Не удалось отправить код');
      }

      const data = await response.json();
      // Сохраняем временные данные для верификации
      sessionStorage.setItem('aist_auth_phone', cleanPhone);
      sessionStorage.setItem('aist_auth_session_id', data.sessionId);
      
      alert('Код отправлен в Telegram!');
    } catch (err) {
      setError(err.message || 'Ошибка подключения');
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
      <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>AIST Мессенджер</h1>
      <p style={{ opacity: 0.9, marginBottom: '2rem' }}>Безопасный вход для пользователей РФ</p>

      <form onSubmit={handleTelegramLogin} style={{ width: '100%', maxWidth: '320px' }}>
        <input
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.9rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.3)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        />
        
        {error && <p style={{ color: '#ff9999', marginBottom: '1rem' }}>{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.9rem',
            backgroundColor: loading ? '#1976d2' : '#1e88e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Отправка...' : 'Получить код через Telegram'}
        </button>
      </form>
    </div>
  );
}