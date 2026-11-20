/**
 * Spotify Web API integration client
 * Handles OAuth token refresh, currently playing playback, and track lookup
 */
import { decryptData, encryptData } from './_crypto';

const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface NowPlayingResponse {
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

// Extract Spotify Track ID from track URL or URI
export function extractTrackId(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();

  // If it's already an ID (22 characters alphanumeric)
  if (/^[a-zA-Z0-9]{22}$/.test(clean)) {
    return clean;
  }

  // spotify:track:4cOdK2wGLETKBW3PvgPWqT
  const uriMatch = clean.match(/spotify:track:([a-zA-Z0-9]{22})/);
  if (uriMatch) return uriMatch[1];

  // https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=...
  const urlMatch = clean.match(/spotify\.com\/track\/([a-zA-Z0-9]{22})/);
  if (urlMatch) return urlMatch[1];

  return null;
}

// Retrieve valid Spotify Access Token (refreshing if expired)
export async function getValidSpotifyAccessToken(env: any, db: D1Database): Promise<string | null> {
  const tokenRecord = await db
    .prepare('SELECT encrypted_refresh_token, access_token_cache, expires_at FROM spotify_tokens WHERE id = ?')
    .bind('primary')
    .first<any>();

  if (!tokenRecord || !tokenRecord.encrypted_refresh_token) {
    return null;
  }

  const now = Date.now();
  // If cached access token is valid for at least another 60 seconds, reuse it
  if (tokenRecord.access_token_cache && tokenRecord.expires_at > now + 60000) {
    return tokenRecord.access_token_cache;
  }

  // Otherwise, refresh access token using refresh token
  const encryptionKey = env.SPOTIFY_TOKEN_ENCRYPTION_KEY || 'default-secret-key-32-chars-long-rnd';
  let refreshToken: string;
  try {
    refreshToken = await decryptData(tokenRecord.encrypted_refresh_token, encryptionKey);
  } catch (err) {
    console.error('Failed to decrypt Spotify refresh token:', err);
    return null;
  }

  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment');
    return null;
  }

  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const tokenResponse = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    console.error('Spotify token refresh failed:', tokenResponse.status, errorBody);
    return null;
  }

  const tokenData = await tokenResponse.json<any>();
  const newAccessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 3600;
  const newExpiresAt = now + expiresIn * 1000;

  // If a new refresh token was returned, re-encrypt and store it
  let encryptedRefresh = tokenRecord.encrypted_refresh_token;
  if (tokenData.refresh_token) {
    encryptedRefresh = await encryptData(tokenData.refresh_token, encryptionKey);
  }

  await db
    .prepare(`
      UPDATE spotify_tokens 
      SET encrypted_refresh_token = ?, access_token_cache = ?, expires_at = ?, updated_at = ? 
      WHERE id = 'primary'
    `)
    .bind(encryptedRefresh, newAccessToken, newExpiresAt, now)
    .run();

  return newAccessToken;
}

// Fetch currently playing track from Spotify
export async function getCurrentlyPlaying(env: any, db: D1Database): Promise<NowPlayingResponse> {
  const accessToken = await getValidSpotifyAccessToken(env, db);

  if (!accessToken) {
    return {
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
      message: 'Spotify connection not configured or currently inactive.',
    };
  }

  try {
    const playerResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 204 No Content means nothing currently playing
    if (playerResponse.status === 204) {
      return await getRecentlyPlayedFallback(accessToken);
    }

    if (!playerResponse.ok) {
      if (playerResponse.status === 401) {
        // Token might have expired during call; fall back to recently played
        return await getRecentlyPlayedFallback(accessToken);
      }
      return {
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
        message: 'Currently away from the speakers.',
      };
    }

    const data = await playerResponse.json<any>();

    // If it's a podcast or no item track
    if (!data || !data.item || data.currently_playing_type !== 'track') {
      return await getRecentlyPlayedFallback(accessToken);
    }

    const item = data.item;
    const isPlaying = Boolean(data.is_playing);

    // If track is paused, show as paused with message or fallback
    if (!isPlaying) {
      return {
        isPlaying: false,
        title: item.name,
        artist: (item.artists || []).map((a: any) => a.name).join(', '),
        album: item.album?.name || null,
        albumArtwork: item.album?.images?.[0]?.url || null,
        spotifyUrl: item.external_urls?.spotify || null,
        trackId: item.id,
        progressMs: data.progress_ms || 0,
        durationMs: item.duration_ms || 0,
        fetchedAt: Date.now(),
        isRecent: true,
        message: 'A rare moment of silence.',
      };
    }

    return {
      isPlaying: true,
      title: item.name,
      artist: (item.artists || []).map((a: any) => a.name).join(', '),
      album: item.album?.name || null,
      albumArtwork: item.album?.images?.[0]?.url || null,
      spotifyUrl: item.external_urls?.spotify || null,
      trackId: item.id,
      progressMs: data.progress_ms || 0,
      durationMs: item.duration_ms || 0,
      fetchedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching currently playing from Spotify:', error);
    return {
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
      message: 'Currently away from the speakers.',
    };
  }
}

// Fallback to last played song from /me/player/recently-played
async function getRecentlyPlayedFallback(accessToken: string): Promise<NowPlayingResponse> {
  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return {
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
    }

    const data = await res.json<any>();
    const item = data?.items?.[0]?.track;

    if (!item) {
      return {
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
    }

    return {
      isPlaying: false,
      isRecent: true,
      title: item.name,
      artist: (item.artists || []).map((a: any) => a.name).join(', '),
      album: item.album?.name || null,
      albumArtwork: item.album?.images?.[0]?.url || null,
      spotifyUrl: item.external_urls?.spotify || null,
      trackId: item.id,
      progressMs: 0,
      durationMs: item.duration_ms || 0,
      fetchedAt: Date.now(),
      message: 'Recently played',
    };
  } catch (err) {
    return {
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
  }
}

// Fetch single track metadata by track ID
export async function getTrackMetadata(accessToken: string, trackId: string) {
  const res = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Spotify track lookup failed with status ${res.status}`);
  }

  const track = await res.json<any>();
  return {
    spotifyTrackId: track.id,
    title: track.name,
    artist: (track.artists || []).map((a: any) => a.name).join(', '),
    album: track.album?.name || '',
    artworkUrl: track.album?.images?.[0]?.url || '',
    durationMs: track.duration_ms || 0,
    spotifyUrl: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
  };
}

