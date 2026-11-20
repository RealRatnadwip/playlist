export interface Song {
  id: string;
  spotify_track_id: string | null;
  title: string;
  artist: string;
  album: string | null;
  artwork_url: string | null;
  duration_ms: number;
  spotify_url: string | null;
  position?: number;
  personal_note?: string | null;
  playlist_song_id?: string;
}

export interface Playlist {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  story_content: string | null;
  cover_image_url: string | null;
  spotify_playlist_url: string | null;
  is_featured: number | boolean;
  status: 'draft' | 'published' | 'archived';
  display_order: number;
  created_at: number;
  updated_at: number;
  published_at: number | null;
  tags?: string[];
  track_count?: number;
  artist_count?: number;
  tracks?: Song[];
  nav?: { slug: string; title: string; nav_type: 'prev' | 'next' }[];
}

export interface NowPlaying {
  isPlaying: boolean;
  title: string | null;
  artist: string | null;
  album: string | null;
  albumArtwork: string | null;
  spotifyUrl: string | null;
  trackId: string | null;
  progressMs: number;
  durationMs: number;
  fetchedAt: number;
  isRecent?: boolean;
  message?: string;
}

export interface ArchiveStats {
  totalPlaylists: number;
  totalSongs: number;
  totalArtists: number;
  totalVisits: number;
  latestPlaylist: {
    title: string;
    slug: string;
    updated_at: number;
  } | null;
}

export interface SiteSettings {
  about_heading?: string;
  about_body?: string;
  hero_intro?: string;
  footer_signature?: string;
  owner_name?: string;
  portfolio_url?: string;
  [key: string]: string | undefined;
}

export interface AdminUser {
  id: string;
  username: string;
}

export interface SpotifyConnectionStatus {
  isConnected: boolean;
  tokenValid: boolean;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  redirectUri: string;
  lastUpdated: number | null;
}

