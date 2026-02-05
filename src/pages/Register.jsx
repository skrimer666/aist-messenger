// src/components/register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('manual');
  const navigate = useNavigate();

  // Проверка авторизации при загрузке
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/chat');
    }
  }, [navigate]);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits[0] === '8') return '+7' + digits.slice(1);
    if (digits[0] === '7' && digits.length === 11) return '+' + digits;
    if (digits.length <= 10) return '+7' + digits;
    return '+' + digits;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const formatted = formatPhone(input);
    setPhone(formatted);
    setError('');
  };

  const requestAuthCode = async () => {
    if (!/^(\+7|8)\d{10}$/.test(phone)) {
      setError('Введите корректный номер (+7XXXXXXXXXX)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.get-aist.ru/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setMethod(data.method);
        setStep('code');
      } else {
        setError(data.error || 'Не удалось запросить код');
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.get-aist.ru/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        localStorage.setItem('authToken', data.token || 'authenticated');
        navigate('/chat');
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) setCode(value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 'phone') {
      requestAuthCode();
    } else if (step === 'code') {
      verifyCode();
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      padding: '20px',
      margin: 0,
      fontFamily: '"Segoe UI", system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
        padding: '36px',
        color: 'white',
        boxSizing: 'border-box'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '28px',
          fontSize: '26px',
          fontWeight: '700',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          letterSpacing: '-0.5px'
        }}>
          {step === 'phone' ? 'Вход через Telegram' : 'Подтверждение кода'}
        </h2>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 50, 50, 0.25)',
            color: '#ffcccc',
            padding: '14px',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 100, 100, 0.35)',
            fontSize: '15px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 'phone' ? (
            <>
              <p style={{ textAlign: 'center', marginBottom: '24px', opacity: 0.92, lineHeight: 1.5 }}>
                Введите номер телефона, привязанный к вашему аккаунту Telegram
              </p>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 999 123-45-67"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '17px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '16px',
                  color: 'white',
                  outline: 'none',
                  marginBottom: '24px',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
                  transition: 'border-color 0.3s, box-shadow 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
              />
              <button
                type="submit"
                disabled={loading || !phone}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading 
                    ? 'linear-gradient(90deg, #5a0ea0, #1a5fcc)' 
                    : 'linear-gradient(90deg, #6a11cb, #2575fc)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s, transform 0.2s',
                  opacity: loading ? 0.9 : 1,
                  boxShadow: '0 4px 12px rgba(37, 117, 252, 0.4)'
                }}
                onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
                onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
              >
                {loading ? 'Отправка...' : 'Получить код'}
              </button>
            </>
          ) : step === 'code' ? (
            <>
              <p style={{ textAlign: 'center', marginBottom: '24px', opacity: 0.92, lineHeight: 1.5 }}>
                {method === 'telegram_sent'
                  ? 'Код отправлен в ваш Telegram'
                  : 'Введите код из сообщения'}
              </p>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="••••••"
                maxLength="6"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '22px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '16px',
                  color: 'white',
                  outline: 'none',
                  marginBottom: '24px',
                  textAlign: 'center',
                  letterSpacing: '10px',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
              />
              <button
                type="submit"
                disabled={loading || code.length < 6}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading 
                    ? 'linear-gradient(90deg, #1a5fcc, #5a0ea0)' 
                    : 'linear-gradient(90deg, #2575fc, #6a11cb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s, transform 0.2s',
                  opacity: loading ? 0.9 : 1,
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(106, 17, 203, 0.4)'
                }}
                onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
                onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
              >
                Продолжить
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.3s, color 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'rgba(255,255,255,0.85)';
                }}
              >
                Назад
              </button>
            </>
          ) : null}
        </form>
      </div>
    </div>
  );
};

export default Register;