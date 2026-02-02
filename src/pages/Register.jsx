// /src/pages/Register.jsx
export default function Register() {
  const bgSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0d47a1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e88e5;stop-opacity:0.95" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <path d="M0,300 Q200,400 400,300 T800,300 L800,600 L0,600 Z" fill="rgba(255,255,255,0.06)"/>
      <path d="M0,200 Q300,100 600,200 T1200,200 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.04)"/>
    </svg>
  `).replace(/'/g, '%27');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `url("data:image/svg+xml,${bgSvg}")`,
        backgroundSize: 'cover',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        padding: '1rem',
        margin: 0,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1 style={{ margin: '0 0 1rem', fontSize: '1.8rem' }}>AIST Messenger</h1>
        <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>Ваши сообщения — только у вас</p>
        <button
          onClick={() => {
            // Временная заглушка: генерируем ID и сохраняем
            const mockId = 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            localStorage.setItem('userId', mockId);
            window.location.href = '/profile';
          }}
          style={{
            width: '100%',
            padding: '0.85rem',
            backgroundColor: '#1e88e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Войти как гость (демо)
        </button>
        <p style={{ fontSize: '0.85rem', marginTop: '1.2rem', opacity: 0.8 }}>
          В продакшене здесь будет полноценная аутентификация с E2E-шифрованием.
        </p>
      </div>
    </div>
  );
}