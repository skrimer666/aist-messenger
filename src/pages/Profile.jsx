import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function Profile() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    setUserId(localStorage.getItem('userId') || 'USR-DEMO-123');
  }, []);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Мой профиль</h1>
      <p>ID: {userId}</p>
      <QRCode value={`aist://user/${userId}`} size={200} />
      <p style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: '#1e88e5' }}>← Вернуться ко входу</a>
      </p>
    </div>
  );
}