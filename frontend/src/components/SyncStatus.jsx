/**
 * Компонент для отображения статуса синхронизации и управления PWA
 */
import React, { useState, useEffect } from 'react';
import {
  getSyncStatus,
  getSyncStats,
  fullSync,
  clearSyncQueue,
  addSyncListener,
  removeSyncListener,
  SYNC_STATUS
} from '../lib/syncManager';
import { IconRefresh, IconWifi, IconWifiOff, IconSettings } from './Icons';

export function SyncStatus({ compact = false }) {
  const [stats, setStats] = useState(getSyncStats());
  const [showMenu, setShowMenu] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleSyncChange = (data) => {
      setStats(getSyncStats());
      if (data.status === SYNC_STATUS.SYNCING) {
        setSyncing(true);
      } else {
        setSyncing(false);
      }
    };

    addSyncListener(handleSyncChange);

    // Обновляем статус каждые 5 секунд
    const interval = setInterval(() => {
      setStats(getSyncStats());
    }, 5000);

    return () => {
      removeSyncListener(handleSyncChange);
      clearInterval(interval);
    };
  }, []);

  const handleSync = () => {
    setSyncing(true);
    fullSync().finally(() => {
      setSyncing(false);
    });
  };

  const handleClearQueue = () => {
    if (window.confirm('Очистить очередь синхронизации?')) {
      clearSyncQueue();
      setStats(getSyncStats());
    }
  };

  if (compact) {
    return (
      <div className="sync-status-compact">
        {stats.isOnline ? (
          <IconWifi size={16} className="text-green-500" />
        ) : (
          <IconWifiOff size={16} className="text-red-500" />
        )}
        {stats.queueLength > 0 && (
          <span className="sync-badge">{stats.queueLength}</span>
        )}
      </div>
    );
  }

  return (
    <div className="sync-status">
      {/* Статус соединения */}
      <div className={`sync-indicator ${stats.isOnline ? 'online' : 'offline'}`}>
        {stats.isOnline ? (
          <>
            <IconWifi size={20} />
            <span className="ml-2">Онлайн</span>
          </>
        ) : (
          <>
            <IconWifiOff size={20} />
            <span className="ml-2">Офлайн</span>
          </>
        )}
      </div>

      {/* Статус синхронизации */}
      {stats.isOnline && (
        <div className="sync-indicator">
          {syncing ? (
            <>
              <IconRefresh size={20} className="animate-spin" />
              <span className="ml-2">Синхронизация...</span>
            </>
          ) : (
            <>
              <IconRefresh size={20} />
              <span className="ml-2">
                {stats.lastSync
                  ? `Синхронизировано: ${formatTime(stats.lastSync)}`
                  : 'Не синхронизировано'}
              </span>
            </>
          )}
        </div>
      )}

      {/* Очередь синхронизации */}
      {stats.queueLength > 0 && (
        <div className="sync-queue">
          <span className="sync-badge">{stats.queueLength}</span>
          <span className="ml-2">ожидает отправки</span>
        </div>
      )}

      {/* Меню действий */}
      <div className="sync-menu">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="sync-menu-button"
          title="Настройки синхронизации"
        >
          <IconSettings size={20} />
        </button>

        {showMenu && (
          <div className="sync-menu-dropdown">
            <button
              onClick={() => {
                handleSync();
                setShowMenu(false);
              }}
              disabled={syncing || !stats.isOnline}
              className="sync-menu-item"
            >
              <IconRefresh size={16} />
              <span className="ml-2">Синхронизировать сейчас</span>
            </button>

            <button
              onClick={() => {
                handleClearQueue();
                setShowMenu(false);
              }}
              className="sync-menu-item"
            >
              <span>🗑️</span>
              <span className="ml-2">Очистить очередь</span>
            </button>

            <div className="sync-menu-divider" />

            <div className="sync-menu-info">
              <div className="sync-menu-item-text">
                <span className="text-gray-500">ID устройства:</span>
                <span className="ml-2 font-mono text-xs">{stats.deviceId.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .sync-status {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          font-size: 14px;
        }

        .sync-indicator {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          background: var(--bg-tertiary);
        }

        .sync-indicator.online {
          color: #22c55e;
        }

        .sync-indicator.offline {
          color: #ef4444;
        }

        .sync-queue {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          background: var(--accent-bg);
          color: var(--accent);
        }

        .sync-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: var(--accent);
          color: white;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .sync-menu {
          position: relative;
        }

        .sync-menu-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-primary);
          transition: background 0.2s;
        }

        .sync-menu-button:hover {
          background: var(--bg-hover);
        }

        .sync-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 240px;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
        }

        .sync-menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-primary);
          text-align: left;
          transition: background 0.2s;
        }

        .sync-menu-item:hover:not(:disabled) {
          background: var(--bg-tertiary);
        }

        .sync-menu-item:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sync-menu-divider {
          height: 1px;
          margin: 8px 0;
          background: var(--border);
        }

        .sync-menu-info {
          padding: 8px 12px;
        }

        .sync-menu-item-text {
          display: flex;
          align-items: center;
          font-size: 12px;
        }

        .sync-status-compact {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    return 'только что';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} мин. назад`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ч. назад`;
  } else {
    const days = Math.floor(diff / 86400000);
    return `${days} дн. назад`;
  }
}
