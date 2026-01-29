import { useState } from 'react';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const sendSMS = async () => {
    // Валидация номера
    const phoneRegex = /^\+?7\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert('Введите номер в формате +79991234567');
      return;
    }

    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (data.ok) {
        alert('SMS отправлено!');
      } else {
        alert('Ошибка отправки: ' + (data.error || 'неизвестно'));
      }
    } catch (e) {
      alert('Ошибка сети: ' + e.message);
    }
  };

  const verifyCode = async () => {
    if (!phone || !code) {
      alert('Заполните все поля');
      return;
    }

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      const data = await res.json();
      if (data.userId) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);
        window.location.href = '/profile';
      } else {
        alert('Ошибка: ' + (data.error || 'неверный код'));
      }
    } catch (e) {
      alert('Ошибка сети: ' + e.message);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>AIST Messenger</h2>
      
      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+79991234567"
        style={{
          display: 'block',
          width: '100%',
          padding: 12,
          fontSize: 16,
          marginBottom: 12,
          border: '1px solid #ccc',
          borderRadius: 6
        }}
      />
      
      <button
        onClick={sendSMS}
        style={{
          width: '100%',
          padding: 12,
          backgroundColor: '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          cursor: 'pointer',
          marginBottom: 20
        }}
      >
        Получить SMS
      </button>

      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Код из SMS"
        style={{
          display: 'block',
          width: '100%',
          padding: 12,
          fontSize: 16,
          marginBottom: 12,
          border: '1px solid #ccc',
          borderRadius: 6
        }}
      />
      
      <button
        onClick={verifyCode}
        style={{
          width: '100%',
          padding: 12,
          backgroundColor: '#34C759',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        Войти
      </button>
    </div>
  );
}