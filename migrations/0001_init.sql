-- migrations/0001_init.sql

-- ===== Auth =====
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  github_id TEXT NULL,
  google_id TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_admin_sessions_user ON admin_sessions(admin_user_id);

-- ===== Toolbox =====
CREATE TABLE toolbox_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE toolbox_category_i18n (
  category_id INTEGER NOT NULL REFERENCES toolbox_categories(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('es','en')),
  label TEXT NOT NULL,
  PRIMARY KEY (category_id, locale)
);

CREATE TABLE toolbox_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES toolbox_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_toolbox_groups_category ON toolbox_groups(category_id);

CREATE TABLE toolbox_tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES toolbox_categories(id) ON DELETE CASCADE,
  group_id INTEGER NULL REFERENCES toolbox_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_toolbox_tools_category ON toolbox_tools(category_id);
CREATE INDEX idx_toolbox_tools_group ON toolbox_tools(group_id);

-- ===== Proyectos =====
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('featured','secondary')),
  category TEXT NULL CHECK (category IN ('landing','mobile','webapp','api')),
  href TEXT NOT NULL,
  media_r2_key TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE project_i18n (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('es','en')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NULL,
  PRIMARY KEY (project_id, locale)
);

CREATE TABLE project_technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_project_technologies_project ON project_technologies(project_id);

CREATE TABLE project_toolbox (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  toolbox_category_id INTEGER NOT NULL REFERENCES toolbox_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, toolbox_category_id)
);

-- ===== LinkedIn: experiencia =====
CREATE TABLE linkedin_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE linkedin_experience_i18n (
  experience_id INTEGER NOT NULL REFERENCES linkedin_experience(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('es','en')),
  role TEXT NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (experience_id, locale)
);

-- ===== LinkedIn: certificaciones =====
CREATE TABLE linkedin_certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificate_url TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE linkedin_certification_i18n (
  certification_id INTEGER NOT NULL REFERENCES linkedin_certifications(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('es','en')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (certification_id, locale)
);

-- ===== LinkedIn: contadores (fila única) =====
CREATE TABLE linkedin_profile_stats (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  connections_count INTEGER NOT NULL,
  followers_count INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('mock','live')) DEFAULT 'mock',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ===== Blog (esquema preparado, sin UI aún) =====
CREATE TABLE blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  cover_r2_key TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','published')) DEFAULT 'draft',
  published_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE blog_post_i18n (
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('es','en')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (post_id, locale)
);

CREATE TABLE blog_post_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE (post_id, tag)
);
