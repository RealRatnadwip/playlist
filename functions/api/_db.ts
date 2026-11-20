/**
 * Database access helpers and query runners for Cloudflare D1
 */

export interface Env {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  ENVIRONMENT?: string;
  SITE_URL?: string;
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_REDIRECT_URI?: string;
  SPOTIFY_TOKEN_ENCRYPTION_KEY?: string;
  SESSION_SECRET?: string;
}

export interface SongRecord {
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

export interface PlaylistRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  story_content: string | null;
  cover_image_url: string | null;
  spotify_playlist_url: string | null;
  is_featured: number;
  status: 'draft' | 'published' | 'archived';
  display_order: number;
  created_at: number;
  updated_at: number;
  published_at: number | null;
  tags?: string[];
  track_count?: number;
  artist_count?: number;
  tracks?: SongRecord[];
}

// Public: Get published playlists with optional tag filter and sorting
export async function getPublishedPlaylists(
  db: D1Database,
  filterTag?: string | null,
  sortBy: string = 'order'
): Promise<PlaylistRecord[]> {
  let query = `
    SELECT 
      p.*,
      COUNT(DISTINCT ps.id) as track_count,
      COUNT(DISTINCT s.artist) as artist_count,
      GROUP_CONCAT(DISTINCT t.name) as tag_names
    FROM playlists p
    LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
    LEFT JOIN songs s ON ps.song_id = s.id
    LEFT JOIN playlist_tags pt ON p.id = pt.playlist_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.status = 'published'
  `;

  const params: any[] = [];

  if (filterTag && filterTag !== 'all') {
    query += ` AND p.id IN (
      SELECT pt_sub.playlist_id 
      FROM playlist_tags pt_sub 
      JOIN tags t_sub ON pt_sub.tag_id = t_sub.id 
      WHERE t_sub.slug = ? OR LOWER(t_sub.name) = LOWER(?)
    )`;
    params.push(filterTag, filterTag);
  }

  query += ` GROUP BY p.id `;

  switch (sortBy) {
    case 'recent_updated':
      query += ` ORDER BY p.updated_at DESC`;
      break;
    case 'recent_added':
      query += ` ORDER BY p.published_at DESC, p.created_at DESC`;
      break;
    case 'oldest':
      query += ` ORDER BY p.published_at ASC, p.created_at ASC`;
      break;
    case 'featured':
      query += ` ORDER BY p.is_featured DESC, p.display_order ASC, p.updated_at DESC`;
      break;
    case 'order':
    default:
      query += ` ORDER BY p.is_featured DESC, p.display_order ASC, p.published_at DESC`;
      break;
  }

  const { results } = await db.prepare(query).bind(...params).all();

  return (results || []).map((row: any) => ({
    ...row,
    tags: row.tag_names ? row.tag_names.split(',').map((t: string) => t.trim()) : [],
  }));
}

// Public: Get single published playlist by slug with full tracklist and personal notes
export async function getPlaylistBySlug(db: D1Database, slug: string): Promise<PlaylistRecord | null> {
  const playlist = await db
    .prepare(`
      SELECT p.*,
        GROUP_CONCAT(DISTINCT t.name) as tag_names
      FROM playlists p
      LEFT JOIN playlist_tags pt ON p.id = pt.playlist_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.slug = ? AND p.status = 'published'
      GROUP BY p.id
      LIMIT 1
    `)
    .bind(slug)
    .first<any>();

  if (!playlist) return null;

  // Fetch ordered songs
  const { results: tracks } = await db
    .prepare(`
      SELECT 
        s.id,
        s.spotify_track_id,
        s.title,
        s.artist,
        s.album,
        s.artwork_url,
        s.duration_ms,
        s.spotify_url,
        ps.id as playlist_song_id,
        ps.position,
        ps.personal_note
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      WHERE ps.playlist_id = ?
      ORDER BY ps.position ASC, ps.created_at ASC
    `)
    .bind(playlist.id)
    .all();

  // Find previous and next playlists for navigation
  const prevNext = await db
    .prepare(`
      SELECT slug, title,
        CASE WHEN display_order < ? THEN 'prev' ELSE 'next' END as nav_type
      FROM playlists
      WHERE status = 'published' AND id != ?
      ORDER BY display_order ASC
    `)
    .bind(playlist.display_order, playlist.id)
    .all();

  return {
    ...playlist,
    tags: playlist.tag_names ? playlist.tag_names.split(',').map((t: string) => t.trim()) : [],
    tracks: (tracks as unknown as SongRecord[]) || [],
    track_count: (tracks || []).length,
    artist_count: new Set((tracks || []).map((t: any) => t.artist)).size,
    nav: prevNext.results || [],
  } as any;
}

// Public: Listening & Archive statistics
export async function getArchiveStats(db: D1Database) {
  const counts = await db
    .prepare(`
      SELECT 
        (SELECT COUNT(*) FROM playlists WHERE status = 'published') as total_playlists,
        (SELECT COUNT(DISTINCT song_id) FROM playlist_songs ps JOIN playlists p ON ps.playlist_id = p.id WHERE p.status = 'published') as total_songs,
        (SELECT COUNT(DISTINCT s.artist) FROM songs s JOIN playlist_songs ps ON s.id = ps.song_id JOIN playlists p ON ps.playlist_id = p.id WHERE p.status = 'published') as total_artists,
        (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'site_visit') as total_visits
    `)
    .first<any>();

  const latestPlaylist = await db
    .prepare(`
      SELECT title, slug, updated_at
      FROM playlists
      WHERE status = 'published'
      ORDER BY updated_at DESC
      LIMIT 1
    `)
    .first<any>();

  return {
    totalPlaylists: counts?.total_playlists || 0,
    totalSongs: counts?.total_songs || 0,
    totalArtists: counts?.total_artists || 0,
    totalVisits: (counts?.total_visits || 0) + 120, // initial launch baseline
    latestPlaylist: latestPlaylist || null,
  };
}

// Public: Get site settings
export async function getPublicSettings(db: D1Database) {
  const { results } = await db.prepare('SELECT key, value FROM site_settings').all();
  const settings: Record<string, string> = {};
  for (const row of results || []) {
    settings[(row as any).key] = (row as any).value;
  }
  return settings;
}

// Public: Record privacy-safe analytics event
export async function recordAnalyticsEvent(db: D1Database, eventType: string, playlistId?: string | null) {
  const id = 'evt-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  await db
    .prepare('INSERT INTO analytics_events (id, event_type, playlist_id, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, eventType, playlistId || null, Date.now())
    .run();
}

