import React, { useState } from 'react';
import QRCode from 'qrcode.react';

function Register() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  const sendSMS = async () => {
    await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    alert('SMS отправлено');
  };

  const verifyCode = async () => {
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });
    const data = await res.json();
    if (data.userId) {
      localStorage.setItem('userId', data.userId);
      setUserId(data.userId);
    } else {
      alert('Ошибка: ' + (data.error || 'неверный код'));
    }
  };

  if (userId) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Мой профиль</h2>
        <p>ID: {userId}</p>
        <QRCode value={`aist://user/${userId}`} size={200} />
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>AIST Messenger</h2>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+79991234567" style={{ display: 'block', margin: '10px 0', padding: 8 }} />
      <button onClick={sendSMS} style={{ marginRight: 10 }}>Получить SMS</button>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="Код" style={{ display: 'block', margin: '10px 0', padding: 8 }} />
      <button onClick={verifyCode}>Войти</button>
    </div>
  );
}

export default Register;