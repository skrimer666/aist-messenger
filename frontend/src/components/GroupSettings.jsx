import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IconBack, IconUsers, IconSettings, IconDelete, IconAdd, IconCrown, IconShield, IconCopy, IconCamera, IconEdit } from './Icons';
import { apiGetChat, apiUpdateChat, apiDeleteChat, apiAddMember, apiRemoveMember, apiUpdateMemberRole } from '../lib/api';
import { getChatList, addOrUpdateChat, deleteChat as deleteChatFromStorage } from '../lib/chatStorage';

export default function GroupSettings({ chatId, onClose, onUpdate }) {
  const { theme, isDark } = useTheme();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [newMember, setNewMember] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const accent = typeof theme.accent === 'string' ? theme.accent : '#8b5cf6';

  // Загрузка данных чата
  useEffect(() => {
    loadChat();
  }, [chatId]);

  const loadChat = async () => {
    try {
      setLoading(true);
      const data = await apiGetChat(chatId);
      if (data) {
        setChat(data);
        setFormData({ name: data.name || '', description: data.description || '' });
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Сохранение изменений
  const handleSave = async () => {
    try {
      const updated = await apiUpdateChat(chatId, {
        name: formData.name,
        description: formData.description,
      });
      if (updated) {
        setChat(updated);
        addOrUpdateChat(updated);
        onUpdate?.(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving chat:', error);
      alert('Ошибка при сохранении');
    }
  };

  // Удаление чата
  const handleDeleteChat = async () => {
    try {
      const success = await apiDeleteChat(chatId);
      if (success) {
        deleteChatFromStorage(chatId);
        onUpdate?.(null);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Ошибка при удалении чата');
    }
  };

  // Добавление участника
  const handleAddMember = async () => {
    if (!newMember.trim()) return;
    try {
      const updated = await apiAddMember(chatId, { username: newMember.trim().replace(/^@/, '') });
      if (updated) {
        setChat(updated);
        setNewMember('');
        loadChat();
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Ошибка при добавлении участника');
    }
  };

  // Удаление участника
  const handleRemoveMember = async (userId) => {
    try {
      const updated = await apiRemoveMember(chatId, userId);
      if (updated) {
        setChat(updated);
        loadChat();
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Ошибка при удалении участника');
    }
  };

  // Изменение роли участника
  const handleUpdateRole = async (userId, role) => {
    try {
      const updated = await apiUpdateMemberRole(chatId, userId, role);
      if (updated) {
        setChat(updated);
        loadChat();
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Ошибка при изменении роли');
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      inset: 0,
      background: theme.pageBg,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      height: 64,
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: theme.headerBg,
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${theme.border}`,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.15)' : '0 4px 20px rgba(0,0,0,.06)',
    },
    headerTitle: { fontSize: 20, fontWeight: 700, color: theme.text, flex: 1 },
    backBtn: {
      border: 'none',
      background: 'transparent',
      color: accent,
      padding: 10,
      borderRadius: 12,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    content: { flex: 1, overflowY: 'auto', padding: '20px' },
    section: {
      background: theme.cardBg,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      border: `1px solid ${theme.border}`,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: theme.textMuted,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    photoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
      margin: '0 auto 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 36,
      fontWeight: 700,
      position: 'relative',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    photoEdit: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      background: theme.cardBg,
      border: `2px solid ${theme.cardBg}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.textMuted,
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 12,
      border: `1px solid ${theme.border}`,
      background: theme.inputBg,
      color: theme.text,
      fontSize: 15,
      marginBottom: 12,
      outline: 'none',
      transition: 'all 0.2s',
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 12,
      border: `1px solid ${theme.border}`,
      background: theme.inputBg,
      color: theme.text,
      fontSize: 15,
      minHeight: 80,
      resize: 'vertical',
      outline: 'none',
      transition: 'all 0.2s',
      marginBottom: 16,
    },
    button: (variant = 'primary') => ({
      width: '100%',
      padding: '14px 20px',
      borderRadius: 12,
      border: 'none',
      background: variant === 'primary'
        ? `linear-gradient(135deg, ${accent}, ${accent}dd)`
        : variant === 'danger'
        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
        : theme.sidebarBg,
      color: variant === 'secondary' ? theme.text : '#fff',
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: 8,
    }),
    tabs: {
      display: 'flex',
      gap: 8,
      marginBottom: 20,
      background: theme.sidebarBg,
      padding: 6,
      borderRadius: 14,
    },
    tab: (active) => ({
      flex: 1,
      padding: '10px 16px',
      borderRadius: 10,
      border: 'none',
      background: active ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : 'transparent',
      color: active ? '#fff' : theme.text,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    memberItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px',
      borderRadius: 12,
      background: theme.inputBg,
      marginBottom: 8,
    },
    memberAvatar: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      fontWeight: 600,
    },
    memberInfo: { flex: 1, minWidth: 0 },
    memberName: {
      fontSize: 15,
      fontWeight: 600,
      color: theme.text,
      marginBottom: 2,
    },
    memberRole: {
      fontSize: 13,
      color: theme.textMuted,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    roleBadge: (role) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 600,
      ...(role === 'admin' && {
        background: 'rgba(245, 158, 11, 0.15)',
        color: '#f59e0b',
      }),
      ...(role === 'moderator' && {
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#3b82f6',
      }),
      ...(role === 'member' && {
        background: `${accent}15`,
        color: accent,
      }),
    }),
    memberActions: {
      display: 'flex',
      gap: 8,
    },
    actionBtn: {
      padding: 8,
      borderRadius: 8,
      border: 'none',
      background: 'transparent',
      color: theme.textMuted,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    deleteConfirm: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: 20,
    },
    deleteDialog: {
      background: theme.cardBg,
      borderRadius: 20,
      padding: 24,
      maxWidth: 400,
      width: '100%',
      border: `1px solid ${theme.border}`,
    },
    deleteDialogTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: theme.text,
      marginBottom: 12,
    },
    deleteDialogText: {
      fontSize: 15,
      color: theme.textMuted,
      marginBottom: 20,
      lineHeight: 1.5,
    },
    deleteDialogButtons: {
      display: 'flex',
      gap: 12,
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={onClose}
          onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <IconBack width={24} height={24} />
        </button>
        <span style={styles.headerTitle}>Настройки группы</span>
        <span style={{ width: 40 }} />
      </header>

      <div style={styles.content}>
        <div style={styles.tabs}>
          <button
            type="button"
            style={styles.tab(activeTab === 'info')}
            onClick={() => setActiveTab('info')}
          >
            Информация
          </button>
          <button
            type="button"
            style={styles.tab(activeTab === 'members')}
            onClick={() => setActiveTab('members')}
          >
            Участники
          </button>
          <button
            type="button"
            style={styles.tab(activeTab === 'permissions')}
            onClick={() => setActiveTab('permissions')}
          >
            Права
          </button>
        </div>

        {activeTab === 'info' && (
          <div style={styles.section}>
            <div style={styles.photoContainer}>
              {chat?.photo ? (
                <img src={chat.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: 50, objectFit: 'cover' }} />
              ) : (
                (chat?.name || 'Г').charAt(0).toUpperCase()
              )}
              <div style={styles.photoEdit}>
                <IconCamera width={16} height={16} />
              </div>
            </div>

            {editing ? (
              <>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Название группы"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <textarea
                  style={styles.textarea}
                  placeholder="Описание группы"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <button type="button" style={styles.button('primary')} onClick={handleSave}>
                  Сохранить
                </button>
                <button type="button" style={styles.button('secondary')} onClick={() => setEditing(false)}>
                  Отмена
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: theme.text, textAlign: 'center', marginBottom: 8 }}>
                  {chat?.name}
                </h2>
                {chat?.description && (
                  <p style={{ fontSize: 14, color: theme.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
                    {chat.description}
                  </p>
                )}
                <button type="button" style={styles.button('secondary')} onClick={() => setEditing(true)}>
                  <IconEdit width={18} height={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Редактировать
                </button>

                {chat?.shareLink && (
                  <button
                    type="button"
                    style={styles.button('secondary')}
                    onClick={() => {
                      navigator.clipboard.writeText(chat.shareLink);
                      alert('Ссылка скопирована');
                    }}
                  >
                    <IconCopy width={18} height={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Скопировать ссылку
                  </button>
                )}

                <div style={{ marginTop: 24, borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
                  <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8 }}>
                    {chat?.members?.length || 0} участников
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div style={styles.section}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                style={{ ...styles.input, marginBottom: 0 }}
                placeholder="Добавить участника (@username)"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <button
                type="button"
                style={{ ...styles.button('primary'), width: 'auto', marginBottom: 0, minWidth: 50 }}
                onClick={handleAddMember}
              >
                <IconAdd width={20} height={20} />
              </button>
            </div>

            {chat?.members?.map((member) => (
              <div key={member.userId} style={styles.memberItem}>
                <div style={styles.memberAvatar}>
                  {member.displayName?.charAt(0) || member.username?.charAt(0) || '?'}
                </div>
                <div style={styles.memberInfo}>
                  <div style={styles.memberName}>{member.displayName || member.username}</div>
                  <div style={styles.memberRole}>
                    <span style={styles.roleBadge(member.role)}>
                      {member.role === 'admin' && <IconCrown width={12} height={12} />}
                      {member.role === 'moderator' && <IconShield width={12} height={12} />}
                      {member.role === 'admin' ? 'Админ' : member.role === 'moderator' ? 'Модератор' : 'Участник'}
                    </span>
                  </div>
                </div>
                {member.role !== 'admin' && (
                  <div style={styles.memberActions}>
                    <select
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: theme.inputBg,
                        color: theme.text,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                    >
                      <option value="member">Участник</option>
                      <option value="moderator">Модератор</option>
                    </select>
                    <button
                      type="button"
                      style={styles.actionBtn}
                      onClick={() => handleRemoveMember(member.userId)}
                      title="Удалить"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = theme.textMuted}
                    >
                      <IconDelete width={18} height={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'permissions' && (
          <div style={styles.section}>
            <p style={{ fontSize: 15, color: theme.textMuted, lineHeight: 1.6 }}>
              Настройте права доступа для участников группы.
            </p>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 15, color: theme.text }}>Участники могут приглашать новых людей</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 15, color: theme.text }}>Участники могут редактировать информацию</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 15, color: theme.text }}>Только админы могут отправлять сообщения</span>
              </label>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            style={styles.button('danger')}
            onClick={() => setShowDeleteConfirm(true)}
          >
            <IconDelete width={18} height={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Удалить группу
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={styles.deleteConfirm}>
          <div style={styles.deleteDialog}>
            <h3 style={styles.deleteDialogTitle}>Удалить группу?</h3>
            <p style={styles.deleteDialogText}>
              Это действие нельзя отменить. Все сообщения и участники будут удалены.
            </p>
            <div style={styles.deleteDialogButtons}>
              <button
                type="button"
                style={{ ...styles.button('secondary'), marginBottom: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                style={{ ...styles.button('danger'), marginBottom: 0 }}
                onClick={handleDeleteChat}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
