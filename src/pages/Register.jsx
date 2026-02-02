// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  // Встроенный SVG-фон (безопасный, оффлайн, без запросов)
  const bgSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0d47a1;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1e88e5;stop-opacity:0.95" />
          <stop offset="100%" style="stop-color:#4fc3f7;stop-opacity:0.9" />
        </linearGradient>
        <filter id="blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <path d="M0,300 Q200,400 400,300 T800,300 L800,600 L0,600 Z" fill="rgba(255,255,255,0.08)" filter="url(#blur)"/>
      <path d="M0,200 Q300,100 600,200 T1200,200 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.06)" filter="url(#blur)"/>
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '1rem',
        margin: 0,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)', // для Safari
          borderRadius: '20px',
          padding: '2.2rem',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h1 style={{ fontSize: '2.4rem', fontWeight: '700', marginBottom: '1rem' }}>
          AIST Messenger
        </h1>
        <p style={{ opacity: 0.95, lineHeight: 1.6, marginBottom: '2rem' }}>
          Безопасный мессенджер для пользователей Российской Федерации
        </p>
        <button
          onClick={() => {
            localStorage.setItem('userId', 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase());
            window.location.href = '/profile';
          }}
          style={{
            width: '100%',
            padding: '0.95rem',
            backgroundColor: '#1e88e5',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#1976d2')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#1e88e5')}
        >
          Войти как гость (демо)
        </button>
      </div>
    </div>
  );
}