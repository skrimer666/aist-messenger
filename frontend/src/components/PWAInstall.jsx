/**
 * Компонент для установки PWA и управления push-уведомлениями
 */
import React, { useState, useEffect } from 'react';
import { IconDownload, IconBell, IconBellOff, IconClose } from './Icons';

export function PWAInstall({ onInstall }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Проверяем, было ли приложение уже установлено
    const isInstalled = localStorage.getItem('aist_pwa_installed');
    if (!isInstalled) {
      setShowBanner(true);
    }

    // Проверяем разрешение уведомлений
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Слушаем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Слушаем событие установки приложения
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      localStorage.setItem('aist_pwa_installed', 'true');
      console.log('[PWA] App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Слушаем обновления service worker
    const handleSWUpdate = () => {
      console.log('[PWA] New version available');
      // Можно показать уведомление об обновлении
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    } else {
      console.log('[PWA] User dismissed install');
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('aist_pwa_dismissed', Date.now().toString());
  };

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления');
      return;
    }

    if (Notification.permission === 'granted') {
      // Отключаем уведомления (отменяем подписку)
      await unsubscribeFromNotifications();
      setNotificationsEnabled(false);
    } else if (Notification.permission === 'denied') {
      alert('Уведомления запрещены. Разрешите их в настройках браузера.');
    } else {
      // Запрашиваем разрешение
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        await subscribeToNotifications();
        setNotificationsEnabled(true);
      } else {
        setNotificationsEnabled(false);
      }
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Создаем подписку на push-уведомления
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY || ''
      });

      // Отправляем подписку на сервер
      const { apiRegisterDevice } = await import('../lib/api.js');
      await apiRegisterDevice(subscription.toJSON());

      console.log('[PWA] Subscribed to notifications');
    } catch (error) {
      console.error('[PWA] Error subscribing to notifications:', error);
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Отправляем запрос на сервер для отмены подписки
        const deviceId = localStorage.getItem('aist_device_id');
        if (deviceId) {
          const { apiUnregisterDevice } = await import('../lib/api.js');
          await apiUnregisterDevice(deviceId);
        }
      }

      console.log('[PWA] Unsubscribed from notifications');
    } catch (error) {
      console.error('[PWA] Error unsubscribing from notifications:', error);
    }
  };

  if (!showBanner) {
    return null;
  }

  const canInstall = deferredPrompt !== null;

  return (
    <>
      {/* Баннер установки */}
      {canInstall && (
        <div className="pwa-install-banner">
          <div className="pwa-banner-content">
            <div className="pwa-banner-icon">
              <img src="/icon-192.png" alt="AIST" width="48" height="48" />
            </div>
            <div className="pwa-banner-text">
              <div className="pwa-banner-title">Установить AIST Messenger</div>
              <div className="pwa-banner-desc">
                Добавьте на главный экран для быстрого доступа
              </div>
            </div>
            <div className="pwa-banner-actions">
              <button
                onClick={handleInstall}
                className="pwa-banner-button primary"
              >
                <IconDownload size={16} />
                <span className="ml-2">Установить</span>
              </button>
              <button
                onClick={handleDismiss}
                className="pwa-banner-button secondary"
              >
                <IconClose size={16} />
              </button>
            </div>
          </div>

          <style jsx>{`
            .pwa-install-banner {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 9999;
              animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
              from {
                transform: translateX(-50%) translateY(100%);
                opacity: 0;
              }
              to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
              }
            }

            .pwa-banner-content {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 16px;
              background: var(--bg-secondary);
              border: 1px solid var(--border);
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              max-width: 400px;
            }

            .pwa-banner-icon img {
              border-radius: 8px;
            }

            .pwa-banner-text {
              flex: 1;
            }

            .pwa-banner-title {
              font-weight: 600;
              font-size: 16px;
              color: var(--text-primary);
              margin-bottom: 4px;
            }

            .pwa-banner-desc {
              font-size: 14px;
              color: var(--text-secondary);
            }

            .pwa-banner-actions {
              display: flex;
              gap: 8px;
            }

            .pwa-banner-button {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 8px 16px;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }

            .pwa-banner-button.primary {
              background: var(--accent);
              color: white;
            }

            .pwa-banner-button.primary:hover {
              background: var(--accent-hover);
            }

            .pwa-banner-button.secondary {
              background: var(--bg-tertiary);
              color: var(--text-primary);
            }

            .pwa-banner-button.secondary:hover {
              background: var(--bg-hover);
            }

            @media (max-width: 480px) {
              .pwa-banner-content {
                max-width: calc(100vw - 32px);
              }
            }
          `}</style>
        </div>
      )}

      {/* Кнопка управления уведомлениями */}
      {'Notification' in window && (
        <button
          onClick={handleToggleNotifications}
          className="notification-toggle"
          title={notificationsEnabled ? 'Отключить уведомления' : 'Включить уведомления'}
        >
          {notificationsEnabled ? (
            <IconBell size={20} />
          ) : (
            <IconBellOff size={20} />
          )}
        </button>
      )}

      <style jsx>{`
        .notification-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-primary);
          transition: background 0.2s;
        }

        .notification-toggle:hover {
          background: var(--bg-hover);
        }

        .notification-toggle svg {
          ${notificationsEnabled ? 'color: var(--accent);' : ''}
        }
      `}</style>
    </>
  );
}

/**
 * Хук для работы с PWA
 */
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Проверяем, установлено ли приложение
    setIsInstalled(!!localStorage.getItem('aist_pwa_installed'));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsInstalled(true);
      localStorage.setItem('aist_pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    return outcome === 'accepted';
  };

  return {
    isInstalled,
    canInstall,
    install
  };
}
