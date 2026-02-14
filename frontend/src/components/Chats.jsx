import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import {
  IconBack, IconSearch, IconPen, IconChannel, IconChevronRight,
  IconPhone, IconVideo, IconAttach, IconSend, IconSmile, IconMore,
  IconStories, IconGallery, IconContacts, IconCheck, IconCheckDouble,
  IconCopy, IconDelete, IconReply, IconForward, IconPin, IconMute
} from './Icons';
import CallScreen from './CallScreen';
import MentionInput from './MentionInput';
import NewChatModal from './NewChatModal';
import {
  getChatList,
  saveChatList,
  getMessages,
  appendMessage,
  saveMessages,
  addOrUpdateChat,
  createChat,
  getChannelMeta,
  saveChannelMeta,
} from '../lib/chatStorage';
import { apiGetChats, apiGetMessages, apiSendMessage, apiCreateChat } from '../lib/api';
import { getFolders, addChatToFolder, removeChatFromFolder, getChatFolderIds } from '../lib/folderStorage';
import { connectChatWebSocket, disconnect, addListener, removeListener, isWebSocketConnected } from '../lib/chatWebSocket';

const APP_DOMAIN = 'https://aist-messenger.vercel.app';
const FOLDER_ALL = 'all';

function ChatView({ chat, onBack }) {
  const { theme, chatBg, isDark } = useTheme();
  const { displayName } = useUser();
  const accent = typeof theme.accent === 'string' ? theme.accent : '#0a84ff';
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [attachPreview, setAttachPreview] = useState(null);
  const [callMode, setCallMode] = useState(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const messagesAreaBg = chatBg || (isDark ? '#0d1218' : '#e8eef5');
  const channelMeta = chat.type === 'channel' ? getChannelMeta(chat.id) : null;
  const channelLink = channelMeta?.shareLink || `${APP_DOMAIN}/c/${chat.id}`;

  // Локальное хранение: сначала показываем с устройства, затем синхронизируем с сервером при открытии
  useEffect(() => {
    setMessages(getMessages(chat.id));
    let cancelled = false;
    (async () => {
      const fromApi = await apiGetMessages(chat.id);
      if (cancelled) return;
      if (Array.isArray(fromApi)) {
        const merged = saveMessages(chat.id, fromApi);
        setMessages(merged);
      }
    })();
    return () => { cancelled = true; };
  }, [chat.id]);

  // WebSocket для получения сообщений в реальном времени
  useEffect(() => {
    const handleMessage = (data) => {
      if (data.type === 'new_message' && data.chatId === chat.id) {
        const newMsg = data.message;
        if (newMsg) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            const updated = [...prev, newMsg];
            saveMessages(chat.id, updated);
            return updated;
          });
        }
      }
    };

    addListener(handleMessage);
    return () => removeListener(handleMessage);
  }, [chat.id]);

  const sendMessage = useCallback(async (textOrAttachment) => {
    const isAttach = typeof textOrAttachment === 'object';
    const text = isAttach ? textOrAttachment.caption || '' : (textOrAttachment || '').trim();
    const attachment = isAttach ? textOrAttachment : null;
    if (!text && !attachment) return;
    const localId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const localMsg = {
      id: localId,
      fromMe: true,
      text: text || (attachment ? (attachment.type === 'image' ? 'Фото' : 'Видео') : ''),
      time: new Date().toISOString(),
      senderName: displayName || 'Вы',
      attachment: attachment ? { type: attachment.type, url: attachment.url } : undefined,
    };
    // Сначала сохраняем на устройстве и сразу показываем
    const next = appendMessage(chat.id, localMsg);
    setMessages(next);
    setInputValue('');
    setAttachPreview(null);
    addOrUpdateChat({ ...chat, lastMessage: text || 'Медиа', lastTime: Date.now() });
    // Затем отправляем на сервер для синхронизации с другими устройствами
    const fromApi = await apiSendMessage(chat.id, {
      text: localMsg.text,
      attachment: attachment ? { type: attachment.type, url: attachment.url } : null,
    });
    if (fromApi && fromApi.id !== localId) {
      const list = getMessages(chat.id);
      const idx = list.findIndex((m) => m.id === localId);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...list[idx], id: fromApi.id, time: fromApi.time || list[idx].time };
        saveMessages(chat.id, updated);
        setMessages(updated);
      }
    }
  }, [chat, displayName]);

  const MAX_FILE_MB = 16;
  const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_VIDEO = ['video/mp4', 'video/webm'];
  const onAttach = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_MB) return;
    if (ALLOWED_IMAGE.includes(f.type)) {
      const r = new FileReader();
      r.onload = () => setAttachPreview({ type: 'image', url: r.result });
      r.readAsDataURL(f);
    } else if (ALLOWED_VIDEO.includes(f.type)) {
      const r = new FileReader();
      r.onload = () => setAttachPreview({ type: 'video', url: r.result });
      r.readAsDataURL(f);
    }
  };

  const bubbleIn = theme.bubbleIn || (isDark ? 'rgba(32, 42, 58, .88)' : 'rgba(255,255,255,.92)');
  const bubbleOut = theme.bubbleOut || accent;
  const bubbleStyleIn = {
    padding: '14px 18px 12px 18px',
    borderRadius: '22px 22px 22px 8px',
    background: bubbleIn,
    color: theme.text,
    fontSize: 15,
    lineHeight: 1.5,
    maxWidth: '100%',
    boxShadow: isDark ? '0 4px 16px rgba(0,0,0,.3)' : '0 4px 16px rgba(0,0,0,.1)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: `1px solid ${theme.cardBorder || 'transparent'}`,
  };
  const bubbleStyleOut = {
    ...bubbleStyleIn,
    borderRadius: '22px 22px 8px 22px',
    background: bubbleOut,
    color: theme.accentText || '#fff',
    boxShadow: `0 6px 20px ${theme.glow || 'rgba(10, 132, 255, .4)'}`,
    border: 'none',
  };

  const formatDateKey = (t) => new Date(t).toDateString();
  const messagesWithDates = useMemo(() => {
    const out = [];
    let lastDate = null;
    messages.forEach((m) => {
      const d = formatDateKey(m.time);
      if (d !== lastDate) {
        lastDate = d;
        out.push({ type: 'date', key: `date-${d}`, date: m.time });
      }
      out.push(m);
    });
    return out;
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ height: 64, padding: '0 8px 0 4px', display: 'flex', alignItems: 'center', gap: 6, background: theme.headerBg, backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderBottom: `1px solid ${theme.border}`, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.15)' : '0 4px 20px rgba(0,0,0,.06)' }}>
        <button
          type="button"
          style={{
            border: 'none',
            background: 'transparent', 
            color: accent, 
            padding: 10, 
            cursor: 'pointer',
            display: isMobile ? 'flex' : 'none', 
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12, 
            transition: 'all 0.2s ease' 
          }}
          onClick={onBack} 
          aria-label="Назад"
          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <IconBack width={24} height={24} />
        </button>
        <button
          type="button"
          onClick={() => chat.type === 'channel' && setShowChannelInfo(true)} 
          style={{
            flex: 1, 
            border: 'none',
            background: 'transparent', 
            padding: '10px 12px', 
            cursor: chat.type === 'channel' ? 'pointer' : 'default', 
            textAlign: 'left', 
            minWidth: 0, 
            borderRadius: 12, 
            transition: 'background 0.2s ease' 
          }}
          onMouseEnter={(e) => chat.type === 'channel' && (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)')}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontWeight: 700, fontSize: 18, color: theme.text, display: 'block', letterSpacing: '-0.3px' }}>{chat.name}</span>
          {chat.type !== 'channel' && <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500 }}>онлайн</span>}
        </button>
        {chat.type !== 'channel' && (
          <>
            <button 
              type="button" 
              style={{ 
                border: 'none', 
                background: 'transparent', 
                padding: 10, 
                color: theme.textMuted, 
                cursor: 'pointer', 
                borderRadius: 12, 
                transition: 'all 0.2s ease' 
              }} 
              aria-label="Голосовой звонок" 
              onClick={() => setCallMode('voice')}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.color = accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = theme.textMuted; }}
            >
              <IconPhone width={22} height={22} />
            </button>
            <button 
              type="button" 
              style={{ 
                border: 'none', 
                background: 'transparent', 
                padding: 10, 
                color: theme.textMuted, 
                cursor: 'pointer', 
                borderRadius: 12, 
                transition: 'all 0.2s ease' 
              }} 
              aria-label="Видеозвонок" 
              onClick={() => setCallMode('video')}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.color = accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = theme.textMuted; }}
            >
              <IconVideo width={22} height={22} />
            </button>
            <button 
              type="button" 
              style={{ 
                border: 'none', 
                background: 'transparent', 
                padding: 10, 
                color: theme.textMuted, 
                cursor: 'pointer', 
                borderRadius: 12, 
                transition: 'all 0.2s ease' 
              }} 
              aria-label="Ещё"
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <IconMore width={22} height={22} />
            </button>
          </>
        )}
      </header>
      {showChannelInfo && channelMeta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Информация о канале"
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowChannelInfo(false)}
        >
          <div style={{ background: theme.cardBg, borderRadius: 20, padding: 24, maxWidth: 380, width: '100%', border: `1px solid ${theme.cardBorder}`, boxShadow: '0 16px 48px rgba(0,0,0,.3)', backdropFilter: 'blur(20px) saturate(140%)', WebkitBackdropFilter: 'blur(20px) saturate(140%)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, color: theme.text }}>{chat.name}</div>
            {channelMeta.description ? <p style={{ fontSize: 15, color: theme.textMuted, marginBottom: 16, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{channelMeta.description}</p> : null}
            <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 10 }}>Ссылка на канал:</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input readOnly value={channelLink} style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 14 }} />
              <button 
                type="button" 
                onClick={() => { navigator.clipboard?.writeText(channelLink); }} 
                style={{ 
                  padding: '10px 18px', 
                  borderRadius: 12, 
                  border: 'none', 
                  background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, 
                  color: theme.accentText || '#fff', 
                  cursor: 'pointer', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  boxShadow: `0 4px 16px ${theme.glow || 'rgba(10, 132, 255, .3)'}`,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.transform = 'scale(1.02)'; 
                  e.currentTarget.style.boxShadow = `0 6px 20px ${theme.glow || 'rgba(10, 132, 255, .5)'}`;
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.transform = 'scale(1)'; 
                  e.currentTarget.style.boxShadow = `0 4px 16px ${theme.glow || 'rgba(10, 132, 255, .3)'}`;
                }}
              >Копировать</button>
            </div>
            <button 
              type="button" 
              onClick={() => setShowChannelInfo(false)} 
              style={{ 
                marginTop: 20, 
                width: '100%', 
                padding: 12, 
                borderRadius: 12, 
                border: 'none', 
                background: theme.sidebarBg, 
                color: theme.text, 
                cursor: 'pointer', 
                fontSize: 15, 
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = theme.sidebarBg}
            >Закрыть</button>
          </div>
        </div>
      )}
      {callMode && (
        <CallScreen peerName={chat.name} isVideo={callMode === 'video'} onEnd={() => setCallMode(null)} peerUserId={chat.peerUserId || chat.otherUserId} />
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8, background: messagesAreaBg }}>
        {messages.length === 0 && (
          <div style={{ color: theme.textMuted, fontSize: 15, textAlign: 'center', padding: '60px 20px' }}>Нет сообщений</div>
        )}
        {messagesWithDates.map((item) => {
          if (item.type === 'date') {
            const label = new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={item.key} style={{ alignSelf: 'center', margin: '16px 0 8px', padding: '6px 16px', borderRadius: 12, background: isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)', fontSize: 13, color: theme.textMuted, fontWeight: 600, backdropFilter: 'blur(10px)' }}>
                {label}
              </div>
            );
          }
          const m = item;
          const timeStr = new Date(m.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={m.id} style={{ alignSelf: m.fromMe ? 'flex-end' : 'flex-start', maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: m.fromMe ? 'flex-end' : 'flex-start' }}>
              {!m.fromMe && chat.type === 'group' && m.senderName && (
                <span style={{ fontSize: 12, color: theme.textMuted, marginBottom: 2, marginLeft: 4 }}>{m.senderName}</span>
              )}
              {m.attachment?.url && (
                <div style={{ marginBottom: 2, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}>
                  {m.attachment.type === 'image' ? (
                    <img src={m.attachment.url} alt="" style={{ maxWidth: 260, maxHeight: 260, display: 'block' }} />
                  ) : (
                    <video src={m.attachment.url} controls style={{ maxWidth: 260, maxHeight: 180 }} />
                  )}
                </div>
              )}
              <div style={m.fromMe ? bubbleStyleOut : bubbleStyleIn}>
                {m.text ? <span style={{ display: 'block', marginBottom: 2 }}>{m.text}</span> : null}
                <div style={{ fontSize: 11, opacity: 0.8 }}>{timeStr}</div>
              </div>
            </div>
          );
        })}
      </div>
      {attachPreview && (
        <div style={{ padding: 12, borderTop: `1px solid ${theme.border}`, background: theme.headerBg, backdropFilter: 'blur(20px)' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {attachPreview.type === 'image' ? <img src={attachPreview.url} alt="" style={{ maxHeight: 140, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,.15)' }} /> : <video src={attachPreview.url} style={{ maxHeight: 140, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,.15)' }} />}
            <button 
              type="button" 
              onClick={() => setAttachPreview(null)} 
              style={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                border: 'none', 
                background: 'rgba(0,0,0,.7)', 
                color: '#fff', 
                borderRadius: 50, 
                width: 30, 
                height: 30, 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 18,
                fontWeight: 300,
                transition: 'all 0.2s ease'
              }} 
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = 'rgba(239, 68, 68, .8)'; 
                e.currentTarget.style.transform = 'scale(1.1)'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = 'rgba(0,0,0,.7)'; 
                e.currentTarget.style.transform = 'scale(1)'; 
              }}
            >×</button>
          </div>
        </div>
      )}
      <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${theme.border}`, background: theme.headerBg, backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <label 
          style={{
            cursor: 'pointer',
            color: theme.textMuted, 
            padding: 10, 
            flexShrink: 0, 
            borderRadius: 14, 
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Прикрепить файл" 
          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <input type="file" accept="image/*,video/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={onAttach} />
          <IconAttach width={24} height={24} />
        </label>
        <MentionInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => attachPreview ? sendMessage({ ...attachPreview, caption: inputValue }) : sendMessage(inputValue)}
          placeholder="Сообщение"
          style={{ flex: 1, minWidth: 0 }}
        />
        <button
          type="button"
          onClick={() => attachPreview ? sendMessage({ ...attachPreview, caption: inputValue }) : sendMessage(inputValue)}
          style={{
            width: 50,
            height: 50,
            minWidth: 50,
            minHeight: 50,
            flexShrink: 0,
            padding: 0,
            borderRadius: '50%',
            border: 'none',
            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
            color: theme.accentText || '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: `0 4px 16px ${theme.glow || 'rgba(10, 132, 255, .4)'}`,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label="Отправить"
          onMouseEnter={(e) => { 
            e.currentTarget.style.transform = 'scale(1.08)'; 
            e.currentTarget.style.boxShadow = `0 6px 24px ${theme.glow || 'rgba(10, 132, 255, .6)'}`;
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = 'scale(1)'; 
            e.currentTarget.style.boxShadow = `0 4px 16px ${theme.glow || 'rgba(10, 132, 255, .4)'}`;
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        >
          <IconSend width={24} height={24} />
        </button>
      </div>
    </div>
  );
}

export default function Chats() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { token } = useUser();
  const [chatList, setChatList] = useState(getChatList);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState(FOLDER_ALL);
  const [foldersRefresh, setFoldersRefresh] = useState(0);
  const [folderMenuChatId, setFolderMenuChatId] = useState(null);
  const folderMenuRef = useRef(null);
  const folders = useMemo(() => getFolders(), [foldersRefresh]);

  useEffect(() => {
    if (!folderMenuChatId) return;
    const onDocClick = (e) => {
      if (folderMenuRef.current?.contains(e.target) || e.target.closest('[data-folder-trigger]')) return;
      setFolderMenuChatId(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [folderMenuChatId]);

  useEffect(() => {
    const id = location.state?.openChatId;
    if (id) {
      const c = getChatList().find((ch) => ch.id === id);
      if (c) setSelectedChat(c);
      navigate('/messenger', { replace: true, state: {} });
    }
  }, [location.state?.openChatId, navigate]);

  const refreshList = useCallback(async () => {
    const fromApi = await apiGetChats();
    if (Array.isArray(fromApi) && fromApi.length >= 0) {
      try {
        saveChatList(fromApi);
      } catch {}
      setChatList(fromApi);
      return;
    }
    setChatList(getChatList());
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  // Синхронизация при возврате на вкладку (другое устройство могло отправить сообщения)
  useEffect(() => {
    const onVisible = () => refreshList();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshList]);

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
    if (!q) return chatList;
    return chatList.filter((c) => (c.name && c.name.toLowerCase().includes(q)) || (c.username && c.username.toLowerCase().includes(q)));
  }, [chatList, searchQuery]);

  const chatsByFolder = useMemo(() => {
    if (activeFolderId === FOLDER_ALL) return filteredChats;
    const folder = folders.find((f) => f.id === activeFolderId);
    if (!folder?.chatIds?.length) return [];
    return filteredChats.filter((c) => folder.chatIds.includes(c.id));
  }, [activeFolderId, filteredChats, folders]);

  const handleChatCreated = useCallback((chat) => {
    setSelectedChat(chat);
    refreshList();
  }, [refreshList]);

  useEffect(() => {
    if (!selectedChat) refreshList();
  }, [selectedChat, refreshList]);

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const showListOnly = isMobile && selectedChat;
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const accent = typeof theme.accent === 'string' ? theme.accent : '#0a84ff';

  // Двухколоночный макет: слева — только список чатов, справа — окно чата (как в Telegram Desktop)
  const s = {
    container: { display: 'flex', flexDirection: 'row', height: '100%', minHeight: 0, background: theme.pageBg },
    header: { height: 64, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.headerBg, backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderBottom: `1px solid ${theme.border}`, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.15)' : '0 4px 20px rgba(0,0,0,.06)' },
    headerTitle: { fontSize: 24, fontWeight: 700, color: theme.text, letterSpacing: '-0.5px' },
    search: { padding: '12px 16px 14px' },
    searchInput: { width: '100%', padding: '14px 18px 14px 50px', borderRadius: 24, border: 'none', background: theme.inputBg, color: theme.text, fontSize: 15, outline: 'none', transition: 'all 0.2s', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,.15)' : '0 2px 8px rgba(0,0,0,.05)' },
    searchWrap: { position: 'relative' },
    searchIcon: { position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, pointerEvents: 'none' },
    sidebar: { width: 400, minWidth: 320, maxWidth: 480, flexShrink: 0, background: theme.sidebarBg, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', borderRight: `1px solid ${theme.border}`, backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' },
    chatList: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
    chatItem: { padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s', borderBottom: theme.border ? `1px solid ${theme.border}` : 'none' },
    chatItemActive: { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
    avatar: { width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, color: theme.accentText || '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, flexShrink: 0, boxShadow: `0 4px 14px ${theme.glow || 'rgba(10, 132, 255, .3)'}` },
    chatInfo: { flex: 1, minWidth: 0 },
    chatName: { fontSize: 16, fontWeight: 600, color: theme.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' },
    lastMsg: { fontSize: 14, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.35 },
    chatMeta: { flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
    chatTime: { fontSize: 12, color: theme.textMuted, fontWeight: 500 },
    unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, background: accent, color: theme.accentText || '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', boxShadow: `0 2px 8px ${theme.glow || 'rgba(10, 132, 255, .35)'}` },
    mainArea: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, background: theme.cardBg, transition: 'opacity 0.2s' },
    empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' },
    emptyIconWrap: { width: 120, height: 120, borderRadius: 60, background: `linear-gradient(135deg, ${accent}15, ${accent}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, backdropFilter: 'blur(16px)', boxShadow: `0 8px 32px ${theme.glow || 'rgba(10, 132, 255, .2)'}` },
    emptyTitle: { fontSize: 28, fontWeight: 700, color: theme.text, marginBottom: 14 },
    emptySub: { fontSize: 17, lineHeight: 1.6, color: theme.textMuted, maxWidth: 320 },
    emptyTagline: { fontSize: 16, color: theme.textMuted, marginTop: 36, opacity: 0.7 },
  };

  if (newChatOpen) {
    return <NewChatModal onClose={() => setNewChatOpen(false)} onChatCreated={handleChatCreated} />;
  }

  return (
    <div style={s.container}>
      <div style={{ ...s.sidebar, display: showListOnly ? 'none' : 'flex', ...(isMobile ? { width: '100%', maxWidth: '100%' } : {}) }}>
        <header style={s.header}>
          <span style={s.headerTitle}>Чаты</span>
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
              justifyContent: 'center'
            }} 
            onClick={() => setNewChatOpen(true)} 
            aria-label="Новое сообщение"
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'; 
              e.currentTarget.style.transform = 'scale(1.05)'; 
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = 'transparent'; 
              e.currentTarget.style.transform = 'scale(1)'; 
            }}
          >
            <IconPen width={24} height={24} />
          </button>
        </header>
        <div style={s.search}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}><IconSearch width={20} height={20} /></span>
            <input type="text" style={s.searchInput} placeholder="Поиск" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div style={{ padding: '8px 14px 12px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
          <button 
            type="button" 
            style={{ 
              padding: '8px 16px', 
              borderRadius: 20, 
              border: 'none', 
              background: activeFolderId === FOLDER_ALL ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : theme.sidebarBg, 
              color: activeFolderId === FOLDER_ALL ? (theme.accentText || '#fff') : theme.textMuted, 
              fontSize: 13, 
              fontWeight: 600, 
              cursor: 'pointer', 
              whiteSpace: 'nowrap', 
              transition: 'all 0.25s ease',
              boxShadow: activeFolderId === FOLDER_ALL ? `0 2px 12px ${theme.glow || 'rgba(10, 132, 255, .35)'}` : 'none'
            }} 
            onClick={() => { setFolderMenuChatId(null); setActiveFolderId(FOLDER_ALL); }}
            onMouseEnter={(e) => { 
              if (activeFolderId !== FOLDER_ALL) {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => { 
              if (activeFolderId !== FOLDER_ALL) {
                e.currentTarget.style.background = theme.sidebarBg;
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >Все чаты</button>
          {folders.map((f) => (
            <button 
              key={f.id} 
              type="button" 
              style={{ 
                padding: '8px 16px', 
                borderRadius: 20, 
                border: 'none', 
                background: activeFolderId === f.id ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : theme.sidebarBg, 
                color: activeFolderId === f.id ? (theme.accentText || '#fff') : theme.textMuted, 
                fontSize: 13, 
                fontWeight: 600, 
                cursor: 'pointer', 
                whiteSpace: 'nowrap', 
                transition: 'all 0.25s ease',
                boxShadow: activeFolderId === f.id ? `0 2px 12px ${theme.glow || 'rgba(10, 132, 255, .35)'}` : 'none'
              }} 
              onClick={() => { setFolderMenuChatId(null); setActiveFolderId(f.id); }}
              onMouseEnter={(e) => { 
                if (activeFolderId !== f.id) {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => { 
                if (activeFolderId !== f.id) {
                  e.currentTarget.style.background = theme.sidebarBg;
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >{f.name}</button>
          ))}
        </div>
        {/* Истории */}
        <div style={{ padding: '12px 16px 8px', display: 'flex', gap: 12, overflowX: 'auto', flexShrink: 0, borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ width: 62, height: 62, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, padding: 3, boxShadow: `0 4px 14px ${theme.glow || 'rgba(10, 132, 255, .3)'}` }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: theme.sidebarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text, fontSize: 24 }}>+</div>
            </div>
            <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 500 }}>Моя история</span>
          </div>
          {chatsByFolder.slice(0, 8).map((chat) => (
            <div key={`story-${chat.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, cursor: 'pointer' }}>
              <div style={{ width: 62, height: 62, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, padding: 3, boxShadow: `0 4px 14px ${theme.glow || 'rgba(10, 132, 255, .3)'}` }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: theme.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {chat.photo ? <img src={chat.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20, fontWeight: 600, color: theme.text }}>{chat.name?.[0]?.toUpperCase() || '?'}</span>}
                </div>
              </div>
              <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 500, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.name}</span>
            </div>
          ))}
        </div>
        <div className="scrollable" style={s.chatList}>
          {chatsByFolder.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: theme.textMuted, fontSize: 15 }}>Нет чатов в этой папке</div>
          )}
          {chatsByFolder.map((chat) => (
            <div
              key={chat.id}
              role="button"
              tabIndex={0}
              onClick={() => { setFolderMenuChatId(null); setSelectedChat(chat); }}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedChat(chat)}
              onMouseEnter={(e) => { if (selectedChat?.id !== chat.id) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'; }}
              onMouseLeave={(e) => { if (selectedChat?.id !== chat.id) e.currentTarget.style.background = 'transparent'; }}
              style={{ ...s.chatItem, ...(selectedChat?.id === chat.id ? s.chatItemActive : {}), position: 'relative' }}
            >
              <div style={s.avatar}>{chat.photo ? <img src={chat.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (chat.type === 'channel' ? <IconChannel width={22} height={22} /> : (chat.name?.[0]?.toUpperCase() || '?'))}</div>
              <div style={s.chatInfo}>
                <div style={s.chatName}>{chat.name}</div>
                <div style={{ ...s.lastMsg, ...(chat.unread > 0 ? { fontWeight: 500, color: theme.text } : {}) }}>{chat.lastMessage || (chat.type === 'channel' ? 'Канал' : 'Нет сообщений')}</div>
              </div>
              <div style={s.chatMeta}>
                <span style={s.chatTime}>
                  {chat.lastTime
                    ? (() => {
                        const d = new Date(chat.lastTime);
                        const now = new Date();
                        if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                        if (d.getTime() > now.getTime() - 7 * 86400000) return d.toLocaleDateString('ru-RU', { weekday: 'short' });
                        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                      })()
                    : ''}
                </span>
                {chat.unread > 0 && <span style={s.unreadBadge}>{chat.unread > 99 ? '99+' : chat.unread}</span>}
              </div>
              <button type="button" data-folder-trigger aria-label="Папки" style={{ border: 'none', background: 'transparent', color: theme.textMuted, padding: 6, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); setFolderMenuChatId(folderMenuChatId === chat.id ? null : chat.id); }}>⋯</button>
              {folderMenuChatId === chat.id && (
                <div ref={folderMenuRef} style={{ position: 'absolute', right: 8, top: '100%', zIndex: 10, marginTop: 2, padding: 8, borderRadius: 12, background: theme.cardBg || theme.sidebarBg, boxShadow: '0 4px 12px rgba(0,0,0,.2)', minWidth: 180 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>Добавить в папку</div>
                  {folders.length === 0 ? <div style={{ fontSize: 13, color: theme.textMuted }}>Создайте папки в Настройках</div> : folders.map((f) => {
                    const inFolder = (f.chatIds || []).includes(chat.id);
                    return (
                      <button key={f.id} type="button" style={{ display: 'block', width: '100%', padding: '8px 10px', border: 'none', background: inFolder ? 'rgba(0,136,204,.15)' : 'transparent', color: theme.text, borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 14 }} onClick={() => { if (inFolder) removeChatFromFolder(f.id, chat.id); else addChatToFolder(f.id, chat.id); setFoldersRefresh((k) => k + 1); }}>
                        {inFolder ? '✓ ' : ''}{f.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Новое сообщение"
          onClick={() => setNewChatOpen(true)}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 16,
            width: 60,
            height: 60,
            borderRadius: 30,
            border: 'none',
            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
            color: theme.accentText || '#fff',
            boxShadow: `0 6px 24px ${theme.glow || 'rgba(10, 132, 255, .5)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)'; 
            e.currentTarget.style.boxShadow = `0 12px 40px ${theme.glow || 'rgba(10, 132, 255, .7)'}`;
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = 'scale(1) translateY(0)'; 
            e.currentTarget.style.boxShadow = `0 6px 24px ${theme.glow || 'rgba(10, 132, 255, .5)'}`;
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95) translateY(0)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)'}
        >
          <IconPen width={28} height={28} />
        </button>
      </div>
      <div style={s.mainArea}>
        {selectedChat ? <ChatView chat={selectedChat} onBack={() => setSelectedChat(null)} /> : (
          <div style={s.empty}>
            <div style={s.emptyIconWrap}>
              <IconPen width={36} height={36} style={{ color: theme.textMuted }} />
            </div>
            <div style={s.emptyTitle}>Выберите чат</div>
            <div style={s.emptySub}>Или нажмите кнопку с ручкой выше, чтобы начать новый диалог</div>
            <div style={s.emptyTagline}>AIST — удобный, комфортный и безопасный мессенджер</div>
          </div>
        )}
      </div>
    </div>
  );
}
