-- Migration 0002: Initial Site Settings & Tags
-- Playlists and songs are intentionally left blank for a clean slate.

-- Initial Site Settings
INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES
('about_heading', 'A little about what''s playing in my head.', 1732147200000),
('about_body', 'I''ve always believed that you can know someone better through what they listen to at 1 AM than through a resume. This archive is my personal catalog of sounds, memories, and the quiet records that anchor different seasons of my life.

Every playlist here has a reason to exist. Some were made for specific people, some during quiet train journeys, and some simply because a song refused to leave my chest.

No algorithms. No shuffle recommendations. Just the songs I return to when the world gets too loud.', 1732147200000),
('hero_intro', 'A personal music archive, listening journal and playlist collection.', 1732147200000),
('footer_signature', 'Made with music and a little too much attachment to playlists.', 1732147200000),
('owner_name', 'Ratnadwip Sarkar', 1732147200000),
('portfolio_url', 'https://ratnadwip.com', 1732147200000);

-- Initial Tags
INSERT OR IGNORE INTO tags (id, name, slug) VALUES
('tag-late-nights', 'Late nights', 'late-nights'),
('tag-bengali', 'Bengali', 'bengali'),
('tag-indie', 'Indie', 'indie'),
('tag-rain', 'Monsoon', 'monsoon'),
('tag-acoustic', 'Acoustic', 'acoustic'),
('tag-long-drives', 'Long drives', 'long-drives'),
('tag-for-someone', 'For someone', 'for-someone'),
('tag-nostalgia', 'Nostalgia', 'nostalgia');
