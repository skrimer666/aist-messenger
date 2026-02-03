return (
  <div style={{ padding: 20, textAlign: 'center' }}>
    <h1>Мой профиль</h1>
    {userId ? (
      <>
        <p>ID: {userId}</p>
        <QRCode value={`aist://user/${userId}`} size={200} />
      </>
    ) : (
      <p>
        Не авторизован. <a href="/">Войти</a>
      </p>
    )}
  </div>
);