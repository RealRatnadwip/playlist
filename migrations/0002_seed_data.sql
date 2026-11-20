-- Migration 0002: Curated Seed Data for playlist.ratnadwip.com
-- Personal playlists, authentic stories, songs, and initial site settings

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

-- Playlists
INSERT OR REPLACE INTO playlists (id, title, slug, description, story_content, cover_image_url, spotify_playlist_url, is_featured, status, display_order, created_at, updated_at, published_at) VALUES
(
    'pl-kolkata-nights',
    'Late Nights in North Kolkata',
    'late-nights-in-north-kolkata',
    'Tram wires overhead, wet asphalt, and the city finally holding its breath after 1 AM.',
    'There is a particular stillness that only North Kolkata knows once the tram lines shut down and the street chai stalls start packing their tin kettles. Around Shyambazar and College Street, the yellow sodium streetlamps buzz at a low frequency that almost matches a cello.

I assembled these songs across two winters. Most of them were listened to while walking alone from Hedua toward Girish Park, hands deep in the pockets of an oversized corduroy jacket.

When the daytime chaos drains away, the city feels less like a metropolis and more like an old brick house with high ceilings and tall wooden louvers. These tracks carry that specific reverb—warm acoustic strings, tape hiss, and melodies that don''t rush you to feel anything before you''re ready.',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    1,
    'published',
    1,
    1708473600000,
    1732147200000,
    1708473600000
),
(
    'pl-monsoon-windows',
    'Rain Against the French Windows',
    'rain-against-the-french-windows',
    'Porcelain cups, heavy July clouds over the terrace, and gentle melancholic chords.',
    'Every monsoon feels like someone rewinding an old cassette you thought you lost. The sky turns the color of bruised plums by three in the afternoon, and suddenly the house gets dark enough that you have to flip on the small corner reading lamp.

This collection is reserved strictly for afternoons when rain lashes against the glass with enough weight to drown out everything else.

There is no percussion here that demands your pulse. Just upright pianos with felt dampers on, nylon-string guitars recorded close enough to hear fingers sliding against frets, and voices that sound like quiet confessions in an empty room.',
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1000&q=80',
    'https://open.spotify.com/playlist/37i9dQZF1DXbvABJXBIyiY',
    1,
    'published',
    2,
    1719273600000,
    1732147200000,
    1719273600000
),
(
    'pl-tunnels-overpasses',
    'Tunnels, Overpasses & 2 AM Highways',
    'tunnels-overpasses-2am-highways',
    'Yellow highway lights streaking across the windshield when nobody wants to arrive anywhere in a hurry.',
    'Driving at night without a destination is one of the few true luxuries left in modern life. Once you cross Vidyasagar Setu or head onto the Kona Expressway late enough, the horizon opens up and the dashboard lights reflect off the windshield like miniature navigation constellations.

This playlist was built around tempo. Not the frantic energy of club music, but the steady, undulating pulse of analog synthesizers and four-on-the-floor rhythms that match tyre revolutions on damp tarmac.

It is music for when your mind is too restless to sleep, but too tired to argue with itself anymore.',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
    'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    0,
    'published',
    3,
    1722816000000,
    1732147200000,
    1722816000000
),
(
    'pl-cassettes-drawer',
    'Cassettes in the Wooden Drawer',
    'cassettes-in-the-wooden-drawer',
    'TDK 90-minute spools, R.D. Burman arrangements, and realizing musical taste is an inheritance.',
    'In my parents'' house, there is a teak wood bureau whose bottom-left drawer still smells of aged magnetic tape and camphor. Inside are dozens of handwritten cassettes with labels penned in faded blue ink.

Growing up, those spools were the soundtrack to Sunday mornings: Mohiner Ghoraguli, Kishore Kumar songs recorded from All India Radio broadcasts, and obscure Rabindrasangeet arrangements by Hemanta Mukherjee.

This playlist is my attempt to bridge that world with the present. It contains original recordings alongside modern indie re-interpretations that preserve the unmistakable warmth of analogue magnetic dust.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    'https://open.spotify.com/playlist/37i9dQZF1DX5Ejj0EkURtP',
    0,
    'published',
    4,
    1725580800000,
    1732147200000,
    1725580800000
),
(
    'pl-songs-for-someone',
    'Songs for Nobody in Particular',
    'songs-for-nobody-in-particular',
    'A quiet pocket of songs kept safe from algorithmic recommendations.',
    'Some songs are too delicate to play in company. They require a certain kind of vulnerability that you only offer to an empty ceiling or a 4 AM cup of black coffee.

I didn''t make this for an audience, and I didn''t assemble it with any thematic discipline. If a track gave me goosebumps at the three-minute mark, or if the outro took five minutes to fade into silence, it found a home here.

Listen from top to bottom on good headphones with the volume set comfortably low.',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    0,
    'published',
    5,
    1728950400000,
    1732147200000,
    1728950400000
);

-- Playlist Tag Junctions
INSERT OR REPLACE INTO playlist_tags (playlist_id, tag_id) VALUES
('pl-kolkata-nights', 'tag-late-nights'),
('pl-kolkata-nights', 'tag-bengali'),
('pl-kolkata-nights', 'tag-indie'),
('pl-monsoon-windows', 'tag-rain'),
('pl-monsoon-windows', 'tag-acoustic'),
('pl-monsoon-windows', 'tag-indie'),
('pl-tunnels-overpasses', 'tag-long-drives'),
('pl-tunnels-overpasses', 'tag-late-nights'),
('pl-cassettes-drawer', 'tag-nostalgia'),
('pl-cassettes-drawer', 'tag-bengali'),
('pl-songs-for-someone', 'tag-for-someone'),
('pl-songs-for-someone', 'tag-indie'),
('pl-songs-for-someone', 'tag-acoustic');

-- Songs Catalog
INSERT OR REPLACE INTO songs (id, spotify_track_id, title, artist, album, artwork_url, duration_ms, spotify_url, created_at) VALUES
('song-101', '4cOdK2wGLETKBW3PvgPWqT', 'Midnight City', 'M83', 'Hurry Up, We''re Dreaming', 'https://i.scdn.co/image/ab67616d0000b2734a4d4b1a457c1511fb3663a7', 243000, 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT', 1708473600000),
('song-102', '5chkAMk1uvRbzqJVs4KEoE', 'Bhalobashi Jyotsnay', 'Mohiner Ghoraguli', 'Abar Bochhor Kuri Pore', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80', 278000, 'https://open.spotify.com/track/5chkAMk1uvRbzqJVs4KEoE', 1708473600000),
('song-103', '3n3Ppam7vgaVa1iaRUc9Lp', 'Holocene', 'Bon Iver', 'Bon Iver', 'https://i.scdn.co/image/ab67616d0000b273b069d2551522818c39b1a5e1', 336000, 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp', 1708473600000),
('song-104', '0GjEhRrWXrvoK4oaTl00vd', 'Clair de Lune', 'Claude Debussy, Martin Jones', 'Debussy: Piano Works', 'https://images.unsplash.com/photo-1520523839898-507127027581?auto=format&fit=crop&w=400&q=80', 304000, 'https://open.spotify.com/track/0GjEhRrWXrvoK4oaTl00vd', 1708473600000),
('song-105', '7qiZfU4dY1lWllzX7mPBI3', 'Shape of My Heart', 'Sting', 'Ten Summoner''s Tales', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', 278000, 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3', 1708473600000),
('song-106', '27L8xD91ST3edz9RW91q4e', 'Space Song', 'Beach House', 'Depression Cherry', 'https://i.scdn.co/image/ab67616d0000b273d22b271d18f4a25336bf9db5', 320000, 'https://open.spotify.com/track/27L8xD91ST3edz9RW91q4e', 1719273600000),
('song-107', '1BxfuPKGuaTgP7aM0fbdZZ', 'Nightcall', 'Kavinsky', 'OutRun', 'https://i.scdn.co/image/ab67616d0000b273ea3f7d4c82c68c6c51152a46', 259000, 'https://open.spotify.com/track/1BxfuPKGuaTgP7aM0fbdZZ', 1722816000000),
('song-108', '4bHsxqRFFGmgTyAjrl5D4P', 'Aamaro Porano Jaha Chay', 'Sahana Bajpaie', 'Notun Kore Pabo Bole', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80', 285000, 'https://open.spotify.com/track/4bHsxqRFFGmgTyAjrl5D4P', 1725580800000),
('song-109', '18flgZ47Z0kZ6OdfaG9Jz5', 'Nude', 'Radiohead', 'In Rainbows', 'https://i.scdn.co/image/ab67616d0000b273b1d3d6e5c8e31dc9ea35ec8e', 255000, 'https://open.spotify.com/track/18flgZ47Z0kZ6OdfaG9Jz5', 1728950400000);

-- Playlist-Song Associations with Personal Notes
INSERT OR REPLACE INTO playlist_songs (id, playlist_id, song_id, position, personal_note, created_at) VALUES
('ps-1', 'pl-kolkata-nights', 'song-102', 1, 'Track 01 — Listened to this leaning against the iron railings near Hedua pool. The harmonica always catches me off-guard.', 1708473600000),
('ps-2', 'pl-kolkata-nights', 'song-103', 2, 'Track 02 — That opening acoustic cadence feels like warm breath in freezing December fog.', 1708473600000),
('ps-3', 'pl-kolkata-nights', 'song-105', 3, 'Track 03 — The subtle Spanish guitar picking by Dominic Miller is perfection.', 1708473600000),

('ps-4', 'pl-monsoon-windows', 'song-103', 1, 'Track 01 — Needs to be played when the rain first hits the tin sunshades outside.', 1719273600000),
('ps-5', 'pl-monsoon-windows', 'song-104', 2, 'Track 02 — Reminds me of sitting in the bay window with cold chai and zero desire to check my phone.', 1719273600000),
('ps-6', 'pl-monsoon-windows', 'song-106', 3, 'Track 03 — Floating guitar arpeggios that sound like light breaking through wet foliage.', 1719273600000),

('ps-7', 'pl-tunnels-overpasses', 'song-107', 1, 'Track 01 — The moment the toll gate opens and the tarmac stretches empty into the dark.', 1722816000000),
('ps-8', 'pl-tunnels-overpasses', 'song-101', 2, 'Track 02 — Roll down the windows right before the bridge. Let the cold wind rush in.', 1722816000000),

('ps-9', 'pl-cassettes-drawer', 'song-102', 1, 'Track 01 — One of the first cassette sides I remember memorizing word for word.', 1725580800000),
('ps-10', 'pl-cassettes-drawer', 'song-108', 2, 'Track 02 — Sahana''s voice carries the warmth of late monsoon dusks in Shantiniketan.', 1725580800000),

('ps-11', 'pl-songs-for-someone', 'song-109', 1, 'Track 01 — "Don''t get any big ideas, they''re not gonna happen." A quiet masterpiece.', 1728950400000),
('ps-12', 'pl-songs-for-someone', 'song-106', 2, 'Track 02 — Keeps you company when there''s nothing else to say.', 1728950400000);

