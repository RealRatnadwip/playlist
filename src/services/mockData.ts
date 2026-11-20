import { Playlist, NowPlaying, ArchiveStats, SiteSettings } from '../types';

export const MOCK_NOW_PLAYING: NowPlaying = {
  isPlaying: false,
  title: null,
  artist: null,
  album: null,
  albumArtwork: null,
  spotifyUrl: null,
  trackId: null,
  progressMs: 0,
  durationMs: 0,
  fetchedAt: Date.now(),
  message: 'Nothing playing right now. A rare moment of silence.',
};

export const MOCK_STATS: ArchiveStats = {
  totalPlaylists: 0,
  totalSongs: 0,
  totalArtists: 0,
  totalVisits: 0,
  latestPlaylist: null,
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

// Clean blank slate: no placeholder playlists
export const MOCK_PLAYLISTS: Playlist[] = [];
