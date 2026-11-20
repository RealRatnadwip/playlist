-- Migration 0001: Initial Schema for playlist.ratnadwip.com
-- Cloudflare D1 Relational Schema

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    story_content TEXT,
    cover_image_url TEXT,
    spotify_playlist_url TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    published_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_playlists_slug ON playlists(slug);
CREATE INDEX IF NOT EXISTS idx_playlists_status ON playlists(status);
CREATE INDEX IF NOT EXISTS idx_playlists_order ON playlists(display_order);
CREATE INDEX IF NOT EXISTS idx_playlists_featured ON playlists(is_featured);

-- Songs Catalog Table (deduplicated by spotify_track_id)
CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    spotify_track_id TEXT UNIQUE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    artwork_url TEXT,
    duration_ms INTEGER DEFAULT 0,
    spotify_url TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_songs_spotify_id ON songs(spotify_track_id);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);

-- Playlist-Song Junction Table
CREATE TABLE IF NOT EXISTS playlist_songs (
    id TEXT PRIMARY KEY,
    playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    personal_note TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_pos ON playlist_songs(playlist_id, position);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

-- Playlist-Tag Junction Table
CREATE TABLE IF NOT EXISTS playlist_tags (
    playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (playlist_id, tag_id)
);

-- Key-Value Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Spotify OAuth Tokens Storage
CREATE TABLE IF NOT EXISTS spotify_tokens (
    id TEXT PRIMARY KEY, -- 'primary'
    encrypted_refresh_token TEXT NOT NULL,
    access_token_cache TEXT,
    expires_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
);

-- Privacy-Respecting Analytics & Visit Counter
CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'site_visit', 'playlist_view', 'spotify_outbound'
    playlist_id TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);

