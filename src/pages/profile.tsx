import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

const Profile = () => {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    setUserId(localStorage.getItem('userId') || '');
  }, []);

  return (
    <div>
      <h2>Мой профиль</h2>
      {userId && (
        <>
          <p>ID: {userId}</p>
          <QRCode value={`aist://user/${userId}`} size={200} />
        </>
      )}
    </div>
  );
};

export default Profile;