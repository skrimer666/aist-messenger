import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { IconBack, IconSearch, IconChevronRight, IconChannel } from './Icons';
import { apiSearchUsers, apiCreateChat } from '../lib/api';
import { getChatList, addOrUpdateChat } from '../lib/chatStorage';

export default function NewChatModal({ onClose, onChatCreated }) {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const accent = typeof theme.accent === 'string' ? theme.accent : '#0a84ff';

  // Поиск пользователей с дебаунсом
  useEffect(() => {
    const searchUsers = async () => {
      const query = searchQuery.trim().toLowerCase().replace(/^@/, '');
      if (query.length < 2) {
        setSearchResults([]);
        setSelectedIndex(-1);
        return;
      }

      setLoading(true);
      try {
        const users = await apiSearchUsers(query);
        if (Array.isArray(users)) {
          setSearchResults(users);
          setSelectedIndex(users.length > 0 ? 0 : -1);
        } else {
          setSearchResults([]);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleSelectUser(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  const handleSelectUser = async (user) => {
    try {
      const userId = user.userId || user.id;
      
      // Проверяем, существует ли уже чат с этим пользователем
      const existingChat = getChatList().find(c => c.peerUserId === userId);
      
      if (existingChat) {
        // Если чат уже есть, просто открываем его
        onChatCreated?.(existingChat);
        onClose();
        return;
      }

      // Создаём новый чат
      const created = await apiCreateChat({
        name: user.displayName || user.username,
        type: 'user',
        peerUsername: user.username,
        peerUserId: userId,
      });

      if (created?.id) {
        const newChat = {
          id: created.id,
          name: created.name || user.displayName || user.username,
          type: 'user',
          lastMessage: '',
          lastTime: null,
          unread: 0,
          peerUserId: userId,
          photo: user.photo || null,
        };
        addOrUpdateChat(newChat);
        onChatCreated?.(newChat);
        onClose();
      } else {
        alert('Не удалось создать чат с этим пользователем');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Ошибка при создании чата');
    }
  };

  const handleCreateGroup = () => {
    onClose();
    navigate('/messenger/new-group');
  };

  const handleCreateChannel = () => {
    onClose();
    navigate('/messenger/new-channel');
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: theme.pageBg,
    },
    header: {
      height: 64,
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: theme.headerBg,
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${theme.border}`,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.15)' : '0 4px 20px rgba(0,0,0,.06)',
    },
    headerTitle: { fontSize: 24, fontWeight: 700, color: theme.text, letterSpacing: '-0.5px' },
    search: { padding: '12px 16px 14px' },
    searchWrap: { position: 'relative' },
    searchInput: {
      width: '100%',
      padding: '14px 18px 14px 50px',
      borderRadius: 24,
      border: 'none',
      background: theme.inputBg,
      color: theme.text,
      fontSize: 15,
      outline: 'none',
      transition: 'all 0.2s',
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,.15)' : '0 2px 8px rgba(0,0,0,.05)',
    },
    searchIcon: { position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, pointerEvents: 'none' },
    content: { flex: 1, overflowY: 'auto', padding: '0 16px' },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: theme.textMuted,
      padding: '16px 0 12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    quickActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    quickActionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderRadius: 12,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    quickActionAvatar: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: theme.sidebarBg,
      color: theme.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      flexShrink: 0,
    },
    quickActionInfo: { flex: 1, minWidth: 0 },
    quickActionTitle: { fontSize: 16, fontWeight: 600, color: theme.text, marginBottom: 2 },
    quickActionSubtitle: { fontSize: 14, color: theme.textMuted },
    userItem: (index) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      borderRadius: 12,
      cursor: 'pointer',
      background: index === selectedIndex ? (isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)') : 'transparent',
      transition: 'all 0.2s',
    }),
    userAvatar: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
      color: theme.accentText || '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      fontWeight: 600,
      flexShrink: 0,
      boxShadow: `0 4px 14px ${theme.glow || 'rgba(10, 132, 255, .3)'}`,
      overflow: 'hidden',
    },
    userInfo: { flex: 1, minWidth: 0 },
    userName: { fontSize: 16, fontWeight: 600, color: theme.text, marginBottom: 2 },
    userUsername: { fontSize: 14, color: theme.textMuted },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      background: `${accent}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    emptyText: { fontSize: 16, color: theme.textMuted, lineHeight: 1.5 },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button
          type="button"
          style={{
            border: 'none',
            background: 'transparent',
            color: accent,
            padding: 10,
            borderRadius: 12,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onClose}
          aria-label="Назад"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <IconBack width={24} height={24} />
        </button>
        <span style={styles.headerTitle}>Новое сообщение</span>
        <span style={{ width: 40 }} />
      </header>

      <div style={styles.search}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>
            <IconSearch width={20} height={20} />
          </span>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Поиск по нику @ или имени"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,.15)' : '0 2px 8px rgba(0,0,0,.05)';
            }}
          />
        </div>
      </div>

      <div style={styles.content}>
        {searchQuery.trim().length < 2 ? (
          <>
            <div style={styles.sectionTitle}>Быстрое создание</div>
            <div style={styles.quickActions}>
              <div
                style={styles.quickActionItem}
                onClick={handleCreateGroup}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={styles.quickActionAvatar}>👥</div>
                <div style={styles.quickActionInfo}>
                  <div style={styles.quickActionTitle}>Создать группу</div>
                  <div style={styles.quickActionSubtitle}>Общий чат с несколькими участниками</div>
                </div>
                <IconChevronRight width={20} height={20} style={{ color: theme.textMuted }} />
              </div>

              <div
                style={styles.quickActionItem}
                onClick={handleCreateChannel}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={styles.quickActionAvatar}>
                  <IconChannel width={24} height={24} />
                </div>
                <div style={styles.quickActionInfo}>
                  <div style={styles.quickActionTitle}>Создать канал</div>
                  <div style={styles.quickActionSubtitle}>Публикация новостей для подписчиков</div>
                </div>
                <IconChevronRight width={20} height={20} style={{ color: theme.textMuted }} />
              </div>
            </div>
          </>
        ) : loading ? (
          <div style={styles.emptyState}>
            <div style={{ color: theme.textMuted, fontSize: 15 }}>Поиск...</div>
          </div>
        ) : searchResults.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <IconSearch width={32} height={32} style={{ color: accent }} />
            </div>
            <div style={styles.emptyText}>
              Пользователи не найдены
              <br />
              Попробуйте другой запрос
            </div>
          </div>
        ) : (
          <>
            <div style={styles.sectionTitle}>
              Найдено {searchResults.length} {searchResults.length === 1 ? 'пользователь' : searchResults.length < 5 ? 'пользователя' : 'пользователей'}
            </div>
            {searchResults.map((user, index) => (
              <div
                key={user.userId || user.id || index}
                style={styles.userItem(index)}
                onClick={() => handleSelectUser(user)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={styles.userAvatar}>
                  {user.photo ? (
                    <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user.displayName || user.username || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user.displayName || user.username}</div>
                  {user.username && user.displayName && user.displayName !== user.username && (
                    <div style={styles.userUsername}>@{user.username}</div>
                  )}
                </div>
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: 12,
                    background: `${accent}15`,
                    color: accent,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Написать
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
