// src/pages/ChatLayout.jsx
import { useState, useEffect } from 'react';

export default function ChatLayout() {
  // Мок-данные (в продакшене — из зашифрованного хранилища)
  const [chats, setChats] = useState([
    { id: '1', name: 'Алексей Иванов', lastMsg: 'Привет! Как дела?', time: '10:45', unread: 2, online: true },
    { id: '2', name: 'Команда AIST', lastMsg: 'Обновление безопасности...', time: 'Вчера', unread: 0, online: false },
    { id: '3', name: 'Техподдержка', lastMsg: 'Ваш запрос принят', time: 'Пн', unread: 0, online: false },
  ]);

  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [messages, setMessages] = useState([
    { id: '1', text: 'Привет!', sender: 'me', time: '10:40', read: true },
    { id: '2', text: 'Привет! Как дела?', sender: 'them', time: '10:42', read: false },
    { id: '3', text: 'Хорошо, спасибо!', sender: 'me', time: '10:43', read: true },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages([...messages, msg]);
    setNewMessage('');
    // В реальности: отправить зашифрованное сообщение через /api
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      backgroundColor: '#f0f2f5',
    }}>
      {/* Левая панель: список чатов */}
      <div style={{
        width: '320px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: '700',
          fontSize: '18px',
          color: '#1e88e5',
        }}>
          AIST Messenger
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: '14px 20px',
                cursor: 'pointer',
                backgroundColor: selectedChat?.id === chat.id ? '#e8f4fc' : 'transparent',
                display: 'flex',
                gap: '12px',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: chat.online ? '#4caf50' : '#bdbdbd',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
              }}>
                {chat.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#000' }}>{chat.name}</strong>
                  <span style={{ fontSize: '12px', color: '#65676b' }}>{chat.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#65676b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.lastMsg}
                  </span>
                  {chat.unread > 0 && (
                    <span style={{
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      backgroundColor: '#1e88e5',
                      color: 'white',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Центр: окно диалога */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: selectedChat.online ? '#4caf50' : '#bdbdbd',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
              }}>
                {selectedChat.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>{selectedChat.name}</div>
                <div style={{ fontSize: '12px', color: '#65676b' }}>
                  {selectedChat.online ? 'Онлайн' : 'Оффлайн'}
                </div>
              </div>
            </div>

            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#eaeaea',
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: '18px',
                    backgroundColor: msg.sender === 'me' ? '#1e88e5' : '#ffffff',
                    color: msg.sender === 'me' ? '#fff' : '#000',
                    fontSize: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {msg.text}
                  <div style={{
                    fontSize: '10px',
                    opacity: 0.8,
                    textAlign: msg.sender === 'me' ? 'right' : 'left',
                    marginTop: '4px',
                  }}>
                    {msg.time} {msg.sender === 'me' && (msg.read ? '✓✓' : '✓')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '12px',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
              display: 'flex',
              gap: '8px',
            }}>
              <button style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#f0f2f5',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '18px',
              }}>
                📎
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '24px',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: newMessage.trim() ? '#1e88e5' : '#e0e0e0',
                  color: 'white',
                  border: 'none',
                  cursor: newMessage.trim() ? 'pointer' : 'default',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                ↵
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            Выберите чат
          </div>
        )}
      </div>

      {/* Правая панель: профиль контакта */}
      <div style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e0e0e0',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {selectedChat ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: selectedChat.online ? '#4caf50' : '#bdbdbd',
                margin: '0 auto 16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '28px',
              }}>
                {selectedChat.name.charAt(0).toUpperCase()}
              </div>
              <h3>{selectedChat.name}</h3>
              <p style={{ color: '#65676b', fontSize: '14px' }}>
                {selectedChat.online ? 'В сети' : 'Не в сети'}
              </p>
            </div>

            <div>
              <h4>Настройки уведомлений</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" defaultChecked /> Звуковые уведомления
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input type="checkbox" defaultChecked /> Уведомления на рабочем столе
              </label>
            </div>

            <div>
              <h4>Медиафайлы</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f0f2f5',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '20px',
                  }}>
                    🖼️
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p>Выберите чат для просмотра профиля</p>
        )}
      </div>
    </div>
  );
}