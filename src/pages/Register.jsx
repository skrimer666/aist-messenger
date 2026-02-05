// src/components/register.jsx
import React, { useState } from 'react';

const Register = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'code' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('manual'); // 'manual' | 'telegram_sent'

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
      setError('Введите корректный номер телефона (+7XXXXXXXXXX)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.get-aist.ru/api/auth/request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://aist-messenger-sandy.vercel.app'
        },
        body: JSON.stringify({ phone }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        if (data.method === 'telegram_sent') {
          setMethod('telegram_sent');
          setStep('code');
        } else if (data.method === 'manual') {
          setMethod('manual');
          setCode(data.code); // автоматически подставляем код для удобства тестирования
          setStep('code');
        }
      } else {
        setError(data.error || 'Не удалось запросить код');
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = () => {
    // Здесь вы можете отправить код на бэкенд для проверки
    // Например: POST /api/auth/verify-code { phone, code }
    alert(`Успешная авторизация!\nТелефон: ${phone}\nКод: ${code}`);
    setStep('success');
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCode(value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 'phone') {
      requestAuthCode();
    } else if (step === 'code') {
      if (code.length < 6) {
        setError('Код должен содержать 6 цифр');
        return;
      }
      verifyCode();
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        {step === 'phone' ? 'Вход через Telegram' : 'Подтверждение кода'}
      </h2>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {step === 'phone' ? (
          <>
            <p style={{ textAlign: 'center', marginBottom: '16px' }}>
              Введите номер телефона, привязанный к Telegram
            </p>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+7 999 123-45-67"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '16px'
              }}
            />
            <button
              type="submit"
              disabled={loading || !phone}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#0088cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </button>
          </>
        ) : step === 'code' ? (
          <>
            <p style={{ textAlign: 'center', marginBottom: '16px' }}>
              {method === 'telegram_sent'
                ? 'Код отправлен в ваш Telegram'
                : 'Введите код из сообщения'}
            </p>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="123456"
              maxLength="6"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '16px',
                textAlign: 'center',
                letterSpacing: '4px'
              }}
            />
            <button
              type="submit"
              disabled={loading || code.length < 6}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer'
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
                marginTop: '12px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Назад
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h3>✅ Авторизация успешна!</h3>
            <p>Вы вошли в систему.</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;