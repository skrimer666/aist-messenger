import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { apiSearchUsers, apiCreateChat } from '../lib/api';
import { getChatList, addOrUpdateChat } from '../lib/chatStorage';

export default function MentionInput({
  value = '',
  onChange,
  onSend,
  placeholder = 'Сообщение',
  disabled = false,
  style = {},
  inputStyle = {},
}) {
  const { theme, isDark } = useTheme();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loading, setLoading] = useState(false);

  const accent = typeof theme.accent === 'string' ? theme.accent : '#0a84ff';

  // Поиск пользователей при вводе @
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setFilteredUsers([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const users = await apiSearchUsers(searchQuery);
        if (Array.isArray(users) && users.length > 0) {
          setFilteredUsers(users);
          setShowSuggestions(true);
          setSelectedIndex(0);
        } else {
          setFilteredUsers([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setFilteredUsers([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Обработка клика вне списка предложений
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Получить текст до курсора для определения поиска @
  const getSearchQuery = (text, position) => {
    const beforeCursor = text.slice(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    return mentionMatch ? mentionMatch[1] : '';
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    onChange(newValue);
    setCursorPosition(newCursorPosition);

    const query = getSearchQuery(newValue, newCursorPosition);
    setSearchQuery(query);
  };

  const handleKeyDown = async (e) => {
    if (!showSuggestions) {
      if (e.key === 'Enter' && !e.shiftKey && onSend) {
        e.preventDefault();
        onSend();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredUsers[selectedIndex]) {
          await selectUser(filteredUsers[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredUsers[selectedIndex]) {
          await selectUser(filteredUsers[selectedIndex]);
        }
        break;
    }
  };

  const selectUser = async (user) => {
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);

    let newValue;
    if (mentionMatch) {
      const beforeMention = beforeCursor.slice(0, mentionMatch.index);
      const mention = `@${user.username || user.displayName}`;
      newValue = beforeMention + mention + ' ' + afterCursor;
      const newPosition = beforeMention.length + mention.length + 1;
      setCursorPosition(newPosition);
    } else {
      newValue = value;
    }

    onChange(newValue);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSearchQuery('');

    // Создать чат с пользователем если он есть
    if (user.userId || user.id) {
      try {
        const userId = user.userId || user.id;
        const existingChat = getChatList().find(c => c.peerUserId === userId);
        
        if (!existingChat) {
          const created = await apiCreateChat({
            name: user.displayName || user.username,
            type: 'user',
            peerUsername: user.username,
            peerUserId: userId,
          });

          if (created?.id) {
            addOrUpdateChat({
              id: created.id,
              name: created.name || user.displayName || user.username,
              type: 'user',
              lastMessage: '',
              lastTime: null,
              unread: 0,
              peerUserId: userId,
              photo: user.photo || null,
            });
          }
        }
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    }

    // Фокус на поле ввода после вставки
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const suggestionItemStyle = (index) => ({
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    background: index === selectedIndex ? (isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.06)') : 'transparent',
    transition: 'background 0.15s',
    borderRadius: 8,
  });

  return (
    <div style={{ position: 'relative', ...style }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '14px 20px',
          borderRadius: 24,
          border: 'none',
          background: theme.messageInputBg || theme.inputBg,
          color: theme.text,
          fontSize: 15,
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,.15)' : '0 2px 8px rgba(0,0,0,.05)',
          ...inputStyle,
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,.15)' : '0 2px 8px rgba(0,0,0,.05)';
        }}
      />

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 8,
            maxHeight: 280,
            overflowY: 'auto',
            background: theme.cardBg,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            boxShadow: '0 8px 32px rgba(0,0,0,.2)',
            zIndex: 100,
            padding: 8,
          }}
        >
          {loading ? (
            <div style={{ padding: '12px 14px', color: theme.textMuted, fontSize: 14, textAlign: 'center' }}>
              Поиск...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '12px 14px', color: theme.textMuted, fontSize: 14, textAlign: 'center' }}>
              Пользователи не найдены
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <div
                key={user.userId || user.id || index}
                onClick={() => selectUser(user)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={suggestionItemStyle(index)}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.accentText || '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {user.photo ? (
                    <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user.displayName || user.username || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 2 }}>
                    {user.displayName || user.username}
                  </div>
                  {user.username && user.displayName && user.displayName !== user.username && (
                    <div style={{ fontSize: 13, color: theme.textMuted }}>
                      @{user.username}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    background: `${accent}15`,
                    color: accent,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Написать
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
