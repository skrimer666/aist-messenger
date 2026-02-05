import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function Profile() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    setUserId(localStorage.getItem('userId') || '');
  }, []);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Мой профиль</h1> {/* Исправлено: обернул "Мой профиль" в тег */}
      {userId ? (
        <>
          <p>ID: {userId}</p>
          <QRCode value={`aist://user/${userId}`} size={200} />
        </>
      ) : (
        <p>
          Не авторизован. <a href="/">Войти</a> {/* Исправлено: [Войти](/) на <a href="/">Войти</a> */}
        </p>
      )}
    </div>
  );
}