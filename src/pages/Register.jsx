// src/pages/Register.jsx
import { useState } from 'react';

export default function Register() {
  const [view, setView] = useState('main');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Новый SVG-фон: тёмно-синий + пурпурный градиент + абстрактные линии
  const bgSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a237e" />
          <stop offset="100%" stop-color="#4a148c" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <path d="M0,400 Q300,500 600,400 T1200,400 L1200,800 L0,800 Z" fill="rgba(123, 31, 162, 0.1)"/>
      <circle cx="20%" cy="30%" r="80" fill="rgba(255,255,255,0.05)" filter="url(#glow)"/>
      <circle cx="80%" cy="70%" r="120" fill="rgba(255,255,255,0.03)" filter="url(#glow)"/>
    </svg>
  `).replace(/'/g, '%27');

  const handleRequestCode = async (e) => {
    e.preventDefault();