import { useState } from 'react';

const Register = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const sendSMS = async () => {
    await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
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
      localStorage.setItem('token', data.token);
      window.location.href = '/profile';
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+79991234567" />
      <button onClick={sendSMS}>Получить SMS</button>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="Код" />
      <button onClick={verifyCode}>Войти</button>
    </div>
  );
};

export default Register;