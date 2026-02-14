const STORAGE_KEY = 'aist_stories';
const VIEWED_KEY = 'aist_viewed_stories';

/**
 * Получить все истории из localStorage
 */
export function getStories() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Сохранить истории в localStorage
 */
export function saveStories(stories) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  } catch (error) {
    console.error('Error saving stories:', error);
  }
}

/**
 * Получить список ID просмотренных историй
 */
export function getViewedStoryIds() {
  try {
    const data = localStorage.getItem(VIEWED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Сохранить список ID просмотренных историй
 */
export function saveViewedStoryIds(ids) {
  try {
    localStorage.setItem(VIEWED_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Error saving viewed stories:', error);
  }
}

/**
 * Отметить историю как просмотренную
 */
export function markStoryAsViewed(storyId) {
  const viewedIds = getViewedStoryIds();
  if (!viewedIds.includes(storyId)) {
    viewedIds.push(storyId);
    saveViewedStoryIds(viewedIds);
  }
}

/**
 * Проверить, просмотрена ли история
 */
export function isStoryViewed(storyId) {
  const viewedIds = getViewedStoryIds();
  return viewedIds.includes(storyId);
}

/**
 * Получить только непросмотренные истории
 */
export function getUnviewedStories() {
  const stories = getStories();
  const viewedIds = getViewedStoryIds();

  return stories
    .map(user => ({
      ...user,
      stories: (user.stories || []).filter(story => !viewedIds.includes(story.id))
    }))
    .filter(user => user.stories && user.stories.length > 0);
}

/**
 * Добавить историю (для локального создания)
 */
export function addStory(story) {
  const stories = getStories();
  
  // Находим или создаём пользователя
  let userIndex = stories.findIndex(u => u.userId === story.userId);
  
  const newStory = {
    id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...story,
    createdAt: story.createdAt || new Date().toISOString(),
  };

  if (userIndex >= 0) {
    stories[userIndex].stories = [newStory, ...(stories[userIndex].stories || [])];
  } else {
    stories.unshift({
      userId: story.userId,
      username: story.username,
      displayName: story.displayName,
      photo: story.photo,
      stories: [newStory],
    });
  }

  saveStories(stories);
  return newStory;
}

/**
 * Удалить историю
 */
export function deleteStory(storyId, userId) {
  const stories = getStories();
  const userIndex = stories.findIndex(u => u.userId === userId);
  
  if (userIndex >= 0) {
    stories[userIndex].stories = stories[userIndex].stories.filter(s => s.id !== storyId);
    
    // Если у пользователя не осталось историй, удаляем его
    if (stories[userIndex].stories.length === 0) {
      stories.splice(userIndex, 1);
    }
    
    saveStories(stories);
  }
}

/**
 * Удалить все истории пользователя
 */
export function deleteUserStories(userId) {
  const stories = getStories();
  const filtered = stories.filter(u => u.userId !== userId);
  saveStories(filtered);
}

/**
 * Очистить все истории
 */
export function clearAllStories() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VIEWED_KEY);
}

/**
 * Добавить тестовые истории (для демонстрации)
 */
export function addTestStories() {
  const existingStories = getStories();
  
  // Если истории уже есть, возвращаем их
  if (existingStories.length > 0) {
    return getUnviewedStories();
  }

  const testUsers = [
    {
      userId: 'test_user_1',
      username: 'alex',
      displayName: 'Александр',
      photo: null,
    },
    {
      userId: 'test_user_2',
      username: 'maria',
      displayName: 'Мария',
      photo: null,
    },
    {
      userId: 'test_user_3',
      username: 'ivan',
      displayName: 'Иван',
      photo: null,
    },
  ];

  const testStories = [
    {
      userId: 'test_user_1',
      mediaUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=1200&fit=crop',
      mediaType: 'image',
      caption: 'Прекрасный день! ☀️',
    },
    {
      userId: 'test_user_1',
      mediaUrl: 'https://images.unsplash.com/photo-1682687221038-404670f01d03?w=800&h=1200&fit=crop',
      mediaType: 'image',
      caption: 'Новые впечатления 🌟',
    },
    {
      userId: 'test_user_2',
      mediaUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=1200&fit=crop',
      mediaType: 'image',
      caption: 'Вечерняя прогулка 🌆',
    },
    {
      userId: 'test_user_3',
      mediaUrl: 'https://images.unsplash.com/photo-1682687221038-404670f01d03?w=800&h=1200&fit=crop',
      mediaType: 'image',
      caption: 'Рабочий режим 💼',
    },
  ];

  testUsers.forEach(user => {
    const userStories = testStories.filter(s => s.userId === user.userId);
    userStories.forEach(story => {
      addStory({
        ...user,
        ...story,
      });
    });
  });

  return getUnviewedStories();
}
