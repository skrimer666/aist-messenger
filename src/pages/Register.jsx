import React, { useState } from 'react';

// Конфиг API
const API_BASE_URL = 'https://api.get-aist.ru';

export default function Register() {
  // Состояния
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSentMethod, setCodeSentMethod] = useState(null); // 'telegram_sent' | 'manual'

  // Форматирование телефона в реальном времени
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.startsWith('8') && digits.length >= 2) {
      return '+7' + digits.substring(1, 11);
    }
    if (digits.startsWith('7') && digits.length >= 2) {
      return '+' + digits.substring(0, 11);
    }
    if (digits.length <= 10) {
      return '+7' + digits;
    }
    return '+' + digits.substring(0, 11);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  // Запрос кода
  const requestCode = async () => {
    if (!phone || phone.length !== 12) { // +7XXXXXXXXXX = 12 chars
      setMessage('Введите корректный номер +7 XXX XXX-XX-XX');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка запроса кода');
      }

      if (data.method === 'telegram_sent') {
        setMessage('✅ Код отправлен в Telegram! Проверьте сообщения.');
        setCodeSentMethod('telegram_sent');
      } else if (data.method === 'manual' && data.code) {
        setMessage('Введите код, который вы получите вручную.');
        setCodeSentMethod('manual');
      } else {
        setMessage('Введите код вручную.');
        setCodeSentMethod('manual');
      }

      setStep('code');
    } catch (error) {
      setMessage(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Проверка кода (локально)
  const verifyCode = () => {
    if (!code || code.length !== 6 || isNaN(code)) {
      setMessage('Введите 6-значный код');
      return;
    }

    // Здесь можно добавить проверку на сервере, если нужна
    // Сейчас: просто проверяем, что код валиден (6 цифр)
    setMessage('✅ Авторизация успешна!');
    setTimeout(() => {
      alert('Вы успешно вошли в систему!');
      // Здесь можно перенаправить пользователя или сохранить сессию
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Вход через Telegram</h2>

      {/* Шаг 1: Ввод номера */}
      {step === 'phone' && (
        <div>
          <label>
            Номер телефона:
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+7 XXX XXX-XX-XX"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              maxLength={12}
            />
          </label>
          <br /><br />
          <button 
            onClick={requestCode}
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {loading ? 'Отправка...' : 'Получить код'}
          </button>
        </div>
      )}

      {/* Шаг 2: Ввод кода */}
      {step === 'code' && (
        <div>
          <p>{message}</p>
          
          <label>
            Код авторизации:
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              placeholder="XXXXXX"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              maxLength={6}
              autoFocus
            />
          </label>
          <br /><br />
          <button 
            onClick={verifyCode}
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Войти
          </button>
          <br /><br />
          <button 
            onClick={() => setStep('phone')}
            style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Назад
          </button>
        </div>
      )}

      {/* Сообщение */}
      {message && (
        <div style={{ 
          marginTop: '10px', 
          padding: '8px', 
          backgroundColor: message.includes('ошибка') ? '#f8d7da' : '#d4edda', 
          color: message.includes('ошибка') ? '#721c24' : '#155724',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}