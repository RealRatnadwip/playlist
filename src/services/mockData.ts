import { Playlist, NowPlaying, ArchiveStats, SiteSettings } from '../types';

export const MOCK_NOW_PLAYING: NowPlaying = {
  isPlaying: true,
  title: 'Midnight City',
  artist: 'M83',
  album: "Hurry Up, We're Dreaming",
  albumArtwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  spotifyUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
  trackId: '4cOdK2wGLETKBW3PvgPWqT',
  progressMs: 74000,
  durationMs: 243000,
  fetchedAt: Date.now() - 5000,
};

export const MOCK_STATS: ArchiveStats = {
  totalPlaylists: 5,
  totalSongs: 12,
  totalArtists: 9,
  totalVisits: 142,
  latestPlaylist: {
    title: 'Late Nights in North Kolkata',
    slug: 'late-nights-in-north-kolkata',
    updated_at: Date.now() - 86400000 * 2,
  },
};

export const MOCK_SETTINGS: SiteSettings = {
  about_heading: "A little about what's playing in my head.",
  about_body: `I've always believed that you can know someone better through what they listen to at 1 AM than through a resume. This archive is my personal catalog of sounds, memories, and the quiet records that anchor different seasons of my life.

Every playlist here has a reason to exist. Some were made for specific people, some during quiet train journeys, and some simply because a song refused to leave my chest.

No algorithms. No shuffle recommendations. Just the songs I return to when the world gets too loud.`,
  hero_intro: 'A personal music archive, listening journal and playlist collection.',
  footer_signature: 'Made with music and a little too much attachment to playlists.',
  owner_name: 'Ratnadwip Sarkar',
  portfolio_url: 'https://ratnadwip.com',
};

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-kolkata-nights',
    title: 'Late Nights in North Kolkata',
    slug: 'late-nights-in-north-kolkata',
    description: 'Tram wires overhead, wet asphalt, and the city finally holding its breath after 1 AM.',
    story_content: `There is a particular stillness that only North Kolkata knows once the tram lines shut down and the street chai stalls start packing their tin kettles. Around Shyambazar and College Street, the yellow sodium streetlamps buzz at a low frequency that almost matches a cello.

I assembled these songs across two winters. Most of them were listened to while walking alone from Hedua toward Girish Park, hands deep in the pockets of an oversized corduroy jacket.

When the daytime chaos drains away, the city feels less like a metropolis and more like an old brick house with high ceilings and tall wooden louvers. These tracks carry that specific reverb—warm acoustic strings, tape hiss, and melodies that don't rush you to feel anything before you're ready.`,
    cover_image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    spotify_playlist_url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    is_featured: true,
    status: 'published',
    display_order: 1,
    created_at: 1708473600000,
    updated_at: Date.now() - 86400000 * 2,
    published_at: 1708473600000,
    tags: ['Late nights', 'Bengali', 'Indie'],
    track_count: 3,
    artist_count: 3,
    tracks: [
      {
        id: 'song-102',
        spotify_track_id: '5chkAMk1uvRbzqJVs4KEoE',
        title: 'Bhalobashi Jyotsnay',
        artist: 'Mohiner Ghoraguli',
        album: 'Abar Bochhor Kuri Pore',
        artwork_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        duration_ms: 278000,
        spotify_url: 'https://open.spotify.com/track/5chkAMk1uvRbzqJVs4KEoE',
        position: 1,
        personal_note: 'Track 01 — Listened to this leaning against the iron railings near Hedua pool. The harmonica always catches me off-guard.',
      },
      {
        id: 'song-103',
        spotify_track_id: '3n3Ppam7vgaVa1iaRUc9Lp',
        title: 'Holocene',
        artist: 'Bon Iver',
        album: 'Bon Iver',
        artwork_url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
        duration_ms: 336000,
        spotify_url: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
        position: 2,
        personal_note: 'Track 02 — That opening acoustic cadence feels like warm breath in freezing December fog.',
      },
      {
        id: 'song-105',
        spotify_track_id: '7qiZfU4dY1lWllzX7mPBI3',
        title: 'Shape of My Heart',
        artist: 'Sting',
        album: "Ten Summoner's Tales",
        artwork_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
        duration_ms: 278000,
        spotify_url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        position: 3,
        personal_note: 'Track 03 — The subtle Spanish guitar picking by Dominic Miller is perfection.',
      },
    ],
  },
  {
    id: 'pl-monsoon-windows',
    title: 'Rain Against the French Windows',
    slug: 'rain-against-the-french-windows',
    description: 'Porcelain cups, heavy July clouds over the terrace, and gentle melancholic chords.',
    story_content: `Every monsoon feels like someone rewinding an old cassette you thought you lost. The sky turns the color of bruised plums by three in the afternoon, and suddenly the house gets dark enough that you have to flip on the small corner reading lamp.

This collection is reserved strictly for afternoons when rain lashes against the glass with enough weight to drown out everything else.

There is no percussion here that demands your pulse. Just upright pianos with felt dampers on, nylon-string guitars recorded close enough to hear fingers sliding against frets, and voices that sound like quiet confessions in an empty room.`,
    cover_image_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1000&q=80',
    spotify_playlist_url: 'https://open.spotify.com/playlist/37i9dQZF1DXbvABJXBIyiY',
    is_featured: true,
    status: 'published',
    display_order: 2,
    created_at: 1719273600000,
    updated_at: 1732147200000,
    published_at: 1719273600000,
    tags: ['Monsoon', 'Acoustic', 'Indie'],
    track_count: 3,
    artist_count: 3,
    tracks: [
      {
        id: 'song-103',
        spotify_track_id: '3n3Ppam7vgaVa1iaRUc9Lp',
        title: 'Holocene',
        artist: 'Bon Iver',
        album: 'Bon Iver',
        artwork_url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
        duration_ms: 336000,
        spotify_url: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
        position: 1,
        personal_note: 'Track 01 — Needs to be played when the rain first hits the tin sunshades outside.',
      },
      {
        id: 'song-104',
        spotify_track_id: '0GjEhRrWXrvoK4oaTl00vd',
        title: 'Clair de Lune',
        artist: 'Claude Debussy, Martin Jones',
        album: 'Debussy: Piano Works',
        artwork_url: 'https://images.unsplash.com/photo-1520523839898-507127027581?auto=format&fit=crop&w=400&q=80',
        duration_ms: 304000,
        spotify_url: 'https://open.spotify.com/track/0GjEhRrWXrvoK4oaTl00vd',
        position: 2,
        personal_note: 'Track 02 — Reminds me of sitting in the bay window with cold chai and zero desire to check my phone.',
      },
      {
        id: 'song-106',
        spotify_track_id: '27L8xD91ST3edz9RW91q4e',
        title: 'Space Song',
        artist: 'Beach House',
        album: 'Depression Cherry',
        artwork_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        duration_ms: 320000,
        spotify_url: 'https://open.spotify.com/track/27L8xD91ST3edz9RW91q4e',
        position: 3,
        personal_note: 'Track 03 — Floating guitar arpeggios that sound like light breaking through wet foliage.',
      },
    ],
  },
  {
    id: 'pl-tunnels-overpasses',
    title: 'Tunnels, Overpasses & 2 AM Highways',
    slug: 'tunnels-overpasses-2am-highways',
    description: 'Yellow highway lights streaking across the windshield when nobody wants to arrive anywhere in a hurry.',
    story_content: `Driving at night without a destination is one of the few true luxuries left in modern life. Once you cross Vidyasagar Setu or head onto the Kona Expressway late enough, the horizon opens up and the dashboard lights reflect off the windshield like miniature navigation constellations.

This playlist was built around tempo. Not the frantic energy of club music, but the steady, undulating pulse of analog synthesizers and four-on-the-floor rhythms that match tyre revolutions on damp tarmac.

It is music for when your mind is too restless to sleep, but too tired to argue with itself anymore.`,
    cover_image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
    spotify_playlist_url: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    is_featured: false,
    status: 'published',
    display_order: 3,
    created_at: 1722816000000,
    updated_at: 1732147200000,
    published_at: 1722816000000,
    tags: ['Long drives', 'Late nights'],
    track_count: 2,
    artist_count: 2,
    tracks: [
      {
        id: 'song-107',
        spotify_track_id: '1BxfuPKGuaTgP7aM0fbdZZ',
        title: 'Nightcall',
        artist: 'Kavinsky',
        album: 'OutRun',
        artwork_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
        duration_ms: 259000,
        spotify_url: 'https://open.spotify.com/track/1BxfuPKGuaTgP7aM0fbdZZ',
        position: 1,
        personal_note: 'Track 01 — The moment the toll gate opens and the tarmac stretches empty into the dark.',
      },
      {
        id: 'song-101',
        spotify_track_id: '4cOdK2wGLETKBW3PvgPWqT',
        title: 'Midnight City',
        artist: 'M83',
        album: "Hurry Up, We're Dreaming",
        artwork_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
        duration_ms: 243000,
        spotify_url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
        position: 2,
        personal_note: 'Track 02 — Roll down the windows right before the bridge. Let the cold wind rush in.',
      },
    ],
  },
  {
    id: 'pl-cassettes-drawer',
    title: 'Cassettes in the Wooden Drawer',
    slug: 'cassettes-in-the-wooden-drawer',
    description: 'TDK 90-minute spools, R.D. Burman arrangements, and realizing musical taste is an inheritance.',
    story_content: `In my parents' house, there is a teak wood bureau whose bottom-left drawer still smells of aged magnetic tape and camphor. Inside are dozens of handwritten cassettes with labels penned in faded blue ink.

Growing up, those spools were the soundtrack to Sunday mornings: Mohiner Ghoraguli, Kishore Kumar songs recorded from All India Radio broadcasts, and obscure Rabindrasangeet arrangements by Hemanta Mukherjee.

This playlist is my attempt to bridge that world with the present. It contains original recordings alongside modern indie re-interpretations that preserve the unmistakable warmth of analogue magnetic dust.`,
    cover_image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    spotify_playlist_url: 'https://open.spotify.com/playlist/37i9dQZF1DX5Ejj0EkURtP',
    is_featured: false,
    status: 'published',
    display_order: 4,
    created_at: 1725580800000,
    updated_at: 1732147200000,
    published_at: 1725580800000,
    tags: ['Nostalgia', 'Bengali'],
    track_count: 2,
    artist_count: 2,
    tracks: [
      {
        id: 'song-102',
        spotify_track_id: '5chkAMk1uvRbzqJVs4KEoE',
        title: 'Bhalobashi Jyotsnay',
        artist: 'Mohiner Ghoraguli',
        album: 'Abar Bochhor Kuri Pore',
        artwork_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        duration_ms: 278000,
        spotify_url: 'https://open.spotify.com/track/5chkAMk1uvRbzqJVs4KEoE',
        position: 1,
        personal_note: 'Track 01 — One of the first cassette sides I remember memorizing word for word.',
      },
      {
        id: 'song-108',
        spotify_track_id: '4bHsxqRFFGmgTyAjrl5D4P',
        title: 'Aamaro Porano Jaha Chay',
        artist: 'Sahana Bajpaie',
        album: 'Notun Kore Pabo Bole',
        artwork_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80',
        duration_ms: 285000,
        spotify_url: 'https://open.spotify.com/track/4bHsxqRFFGmgTyAjrl5D4P',
        position: 2,
        personal_note: "Track 02 — Sahana's voice carries the warmth of late monsoon dusks in Shantiniketan.",
      },
    ],
  },
  {
    id: 'pl-songs-for-someone',
    title: 'Songs for Nobody in Particular',
    slug: 'songs-for-nobody-in-particular',
    description: 'A quiet pocket of songs kept safe from algorithmic recommendations.',
    story_content: `Some songs are too delicate to play in company. They require a certain kind of vulnerability that you only offer to an empty ceiling or a 4 AM cup of black coffee.

I didn't make this for an audience, and I didn't assemble it with any thematic discipline. If a track gave me goosebumps at the three-minute mark, or if the outro took five minutes to fade into silence, it found a home here.

Listen from top to bottom on good headphones with the volume set comfortably low.`,
    cover_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    spotify_playlist_url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    is_featured: false,
    status: 'published',
    display_order: 5,
    created_at: 1728950400000,
    updated_at: 1732147200000,
    published_at: 1728950400000,
    tags: ['For someone', 'Indie', 'Acoustic'],
    track_count: 2,
    artist_count: 2,
    tracks: [
      {
        id: 'song-109',
        spotify_track_id: '18flgZ47Z0kZ6OdfaG9Jz5',
        title: 'Nude',
        artist: 'Radiohead',
        album: 'In Rainbows',
        artwork_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
        duration_ms: 255000,
        spotify_url: 'https://open.spotify.com/track/18flgZ47Z0kZ6OdfaG9Jz5',
        position: 1,
        personal_note: 'Track 01 — "Don\'t get any big ideas, they\'re not gonna happen." A quiet masterpiece.',
      },
      {
        id: 'song-106',
        spotify_track_id: '27L8xD91ST3edz9RW91q4e',
        title: 'Space Song',
        artist: 'Beach House',
        album: 'Depression Cherry',
        artwork_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        duration_ms: 320000,
        spotify_url: 'https://open.spotify.com/track/27L8xD91ST3edz9RW91q4e',
        position: 2,
        personal_note: 'Track 02 — Keeps you company when there\'s nothing else to say.',
      },
    ],
  },
];

