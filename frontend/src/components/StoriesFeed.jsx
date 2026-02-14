import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { IconClose, IconStories, IconRefresh } from './Icons';
import { apiGetStories, apiViewStory } from '../lib/api';
import { addTestStories, clearAllStories } from '../lib/storyStorage';

export default function StoriesFeed() {
  const { theme, isDark } = useTheme();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const accent = typeof theme.accent === 'string' ? theme.accent : '#0a84ff';

  // Загрузка историй
  const loadStories = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedStories = await apiGetStories();
      if (Array.isArray(fetchedStories)) {
        setStories(fetchedStories);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
    
    // Добавляем тестовые истории если нет локальных (для демонстрации)
    const testStories = addTestStories();
    if (testStories.length > 0) {
      setStories(testStories);
    }
    
    // Обновляем истории каждые 30 секунд
    const interval = setInterval(loadStories, 30000);
    return () => clearInterval(interval);
  }, [loadStories]);

  // Если историй нет, не показываем компонент
  if (loading) return null;
  if (stories.length === 0) return null;

  // Получаем все истории в одном списке
  const allStories = [];
  stories.forEach(user => {
    if (user.stories) {
      user.stories.forEach(story => {
        allStories.push({ ...story, userId: user.userId, username: user.username, displayName: user.displayName });
      });
    }
  });

  if (allStories.length === 0) return null;

  const handleStoryClick = (story, index) => {
    setSelectedStory(story);
    setCurrentIndex(index);
    
    // Отмечаем как просмотренную
    if (!story.viewed) {
      apiViewStory(story.id);
    }
  };

  const handleClose = () => {
    setSelectedStory(null);
    loadStories(); // Обновляем список после закрытия
  };

  const handleNext = () => {
    if (currentIndex < allStories.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStory = allStories[nextIndex];
      setSelectedStory(nextStory);
      setCurrentIndex(nextIndex);
      if (!nextStory.viewed) {
        apiViewStory(nextStory.id);
      }
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevStory = allStories[prevIndex];
      setSelectedStory(prevStory);
      setCurrentIndex(prevIndex);
    }
  };

  // Сбросить истории и создать тестовые
  const handleResetStories = () => {
    clearAllStories();
    const testStories = addTestStories();
    setStories(testStories);
  };

  // Обработка клика на области прогресса
  const handleProgressClick = (index) => {
    if (index !== currentIndex && index >= 0 && index < allStories.length) {
      const story = allStories[index];
      setSelectedStory(story);
      setCurrentIndex(index);
      if (!story.viewed) {
        apiViewStory(story.id);
      }
    }
  };

  // Автоматическое переключение через 5 секунд
  useEffect(() => {
    if (selectedStory) {
      const timer = setTimeout(handleNext, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedStory, currentIndex]);

  const styles = {
    container: {
      padding: '12px 16px',
      background: theme.cardBg,
      borderBottom: `1px solid ${theme.border}`,
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    icon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      background: `linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      flexShrink: 0,
    },
    text: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: 600,
      color: theme.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 12,
      color: theme.textMuted,
    },
    badge: {
      padding: '4px 10px',
      borderRadius: 10,
      background: `linear-gradient(135deg, #f09433, #e6683c)`,
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      flexShrink: 0,
    },
    // Просмотрщик истории
    viewer: {
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
    },
    viewerHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
      zIndex: 10,
    },
    progress: {
      position: 'absolute',
      top: 8,
      left: 20,
      right: 20,
      display: 'flex',
      gap: 4,
      zIndex: 20,
    },
    progressBar: (index, isActive, isViewed) => ({
      flex: 1,
      height: 2,
      background: 'rgba(255,255,255,0.3)',
      borderRadius: 1,
      overflow: 'hidden',
      cursor: 'pointer',
    }),
    progressFill: (isActive) => ({
      height: '100%',
      background: '#fff',
      transition: isActive ? 'width 5s linear' : 'none',
      width: isActive ? '100%' : (isViewed ? '100%' : '0%'),
    }),
    viewerAvatar: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: accent,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      fontWeight: 600,
    },
    viewerInfo: {
      flex: 1,
    },
    viewerName: {
      fontSize: 15,
      fontWeight: 600,
      color: '#fff',
    },
    viewerTime: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)',
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      padding: 8,
      borderRadius: 8,
      transition: 'background 0.2s',
    },
    viewerContent: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    storyMedia: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    },
    caption: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '60px 20px 20px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
      color: '#fff',
      fontSize: 16,
      lineHeight: 1.4,
    },
    navArea: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '30%',
      cursor: 'pointer',
      zIndex: 5,
    },
    navLeft: { left: 0 },
    navRight: { right: 0 },
  };

  return (
    <>
      <div
        style={styles.container}
        onClick={() => handleStoryClick(allStories[0], 0)}
        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div style={styles.header}>
          <div style={styles.icon}>
            <IconStories width={18} height={18} />
          </div>
          <div style={styles.text}>
            <div style={styles.title}>
              {stories.length} {stories.length === 1 ? 'история' : stories.length < 5 ? 'истории' : 'историй'}
            </div>
            <div style={styles.subtitle}>
              {stories.map(s => s.displayName || s.username).join(', ')}
            </div>
          </div>
          <div style={styles.badge}>
            {allStories.length}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleResetStories();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textMuted,
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              marginLeft: 8,
              transition: 'all 0.2s',
            }}
            title="Сбросить и создать тестовые истории"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)';
              e.currentTarget.style.color = accent;
              e.currentTarget.style.transform = 'rotate(180deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.textMuted;
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <IconRefresh width={16} height={16} />
          </button>
        </div>
      </div>

      {selectedStory && (
        <div style={styles.viewer}>
          <div style={styles.progress}>
            {allStories.map((story, index) => (
              <div
                key={story.id}
                style={styles.progressBar(index, index === currentIndex, story.viewed)}
                onClick={() => handleProgressClick(index)}
              >
                <div style={styles.progressFill(index === currentIndex)} />
              </div>
            ))}
          </div>

          <div style={styles.viewerHeader}>
            <div style={styles.viewerAvatar}>
              {(selectedStory.displayName || selectedStory.username || '?').charAt(0).toUpperCase()}
            </div>
            <div style={styles.viewerInfo}>
              <div style={styles.viewerName}>{selectedStory.displayName || selectedStory.username}</div>
              <div style={styles.viewerTime}>
                {new Date(selectedStory.createdAt).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <button
              style={styles.closeBtn}
              onClick={handleClose}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <IconClose width={24} height={24} />
            </button>
          </div>

          <div style={styles.viewerContent}>
            <div style={{ ...styles.navArea, ...styles.navLeft }} onClick={handlePrev} />
            <div style={{ ...styles.navArea, ...styles.navRight }} onClick={handleNext} />

            {selectedStory.mediaType === 'video' ? (
              <video
                src={selectedStory.mediaUrl}
                style={styles.storyMedia}
                autoPlay
                playsInline
                muted
                loop
              />
            ) : (
              <img src={selectedStory.mediaUrl} alt="" style={styles.storyMedia} />
            )}

            {selectedStory.caption && (
              <div style={styles.caption}>{selectedStory.caption}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
