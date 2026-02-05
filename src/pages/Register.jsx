import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLayout from './ChatLayout'; // в той же папке

const Register = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('manual');
  const navigate = useNavigate();

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
      setError('Ошибка сети');
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
        // Сохраняем токен
        localStorage.setItem('authToken', data.token);
        // Редирект на чат
        navigate('/chat');
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch (err) {
      setError('Ошибка сети');
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

  if (step === 'success') {
    return <ChatLayout />;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        padding: '32px',
        color: 'white'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '24px',
          fontWeight: '600',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          {step === 'phone' ? 'Вход через Telegram' : 'Подтверждение кода'}
        </h2>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 50, 50, 0.2)',
            color: '#ffcccc',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 100, 100, 0.3)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 'phone' ? (
            <>
              <p style={{ textAlign: 'center', marginBottom: '20px', opacity: 0.9 }}>
                Введите номер телефона, привязанный к Telegram
              </p>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 999 123-45-67"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '14px',
                  color: 'white',
                  outline: 'none',
                  marginBottom: '20px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <button
                type="submit"
                disabled={loading || !phone}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? 'rgba(106, 17, 203, 0.5)' : 'linear-gradient(90deg, #6a11cb, #2575fc)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: loading ? 0.8 : 1
                }}
              >
                {loading ? 'Отправка...' : 'Получить код'}
              </button>
            </>
          ) : step === 'code' ? (
            <>
              <p style={{ textAlign: 'center', marginBottom: '20px', opacity: 0.9 }}>
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
                  padding: '14px 16px',
                  fontSize: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '14px',
                  color: 'white',
                  outline: 'none',
                  marginBottom: '20px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <button
                type="submit"
                disabled={loading || code.length < 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? 'rgba(37, 117, 252, 0.5)' : 'linear-gradient(90deg, #2575fc, #6a11cb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: loading ? 0.8 : 1,
                  marginBottom: '12px'
                }}
              >
                Продолжить
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '14px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
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