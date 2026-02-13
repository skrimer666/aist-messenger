-- Таблица историй (Stories)
-- Пользователи могут добавлять истории, которые видят их контакты
-- Истории автоматически удаляются через 24 часа

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Таблица просмотров историй (Story Views)
-- Отслеживает, какие пользователи просмотрели какие истории
CREATE TABLE IF NOT EXISTS story_views (
  id SERIAL PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);

-- Таблица подписок/контактов для историй (Story Subscriptions)
-- Определяет, чьи истории видит пользователь
CREATE TABLE IF NOT EXISTS story_subscriptions (
  subscriber_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(subscriber_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_story_subscriptions_subscriber ON story_subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_story_subscriptions_target ON story_subscriptions(target_user_id);

GRANT ALL ON ALL TABLES IN SCHEMA public TO aist_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO aist_app;
