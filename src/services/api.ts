import { Playlist, NowPlaying, ArchiveStats, SiteSettings, AdminUser, SpotifyConnectionStatus } from '../types';
import { MOCK_NOW_PLAYING, MOCK_PLAYLISTS, MOCK_STATS, MOCK_SETTINGS } from './mockData';

const API_BASE = '/api';

/**
 * Public API client with transparent dev fallback
 */

export async function fetchNowPlaying(): Promise<NowPlaying> {
  try {
    const res = await fetch(`${API_BASE}/spotify/now-playing`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Dev fallback if backend functions aren't running
  }
  return MOCK_NOW_PLAYING;
}

export async function fetchPlaylists(tag?: string, sort = 'order'): Promise<Playlist[]> {
  try {
    const params = new URLSearchParams();
    if (tag && tag !== 'all') params.set('tag', tag);
    if (sort) params.set('sort', sort);

    const res = await fetch(`${API_BASE}/playlists?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data.playlists || [];
    }
  } catch {
    // Dev fallback
  }

  // Filter & sort mock data
  let result = [...MOCK_PLAYLISTS];
  if (tag && tag !== 'all') {
    result = result.filter(p => p.tags?.some(t => t.toLowerCase() === tag.toLowerCase()));
  }
  return result;
}

export async function fetchPlaylistBySlug(slug: string): Promise<Playlist | null> {
  try {
    const res = await fetch(`${API_BASE}/playlists/${slug}`);
    if (res.ok) {
      const data = await res.json();
      return data.playlist || null;
    }
  } catch {
    // Dev fallback
  }

  const found = MOCK_PLAYLISTS.find(p => p.slug === slug);
  return found || null;
}

export async function fetchStats(): Promise<ArchiveStats> {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Dev fallback
  }
  return MOCK_STATS;
}

export async function fetchPublicSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_BASE}/settings/public`);
    if (res.ok) {
      const data = await res.json();
      return data.settings || MOCK_SETTINGS;
    }
  } catch {
    // Dev fallback
  }
  return MOCK_SETTINGS;
}

export async function recordVisit(playlistId?: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId }),
    });
  } catch {
    // Silent fail for analytics
  }
}

/**
 * Admin API client
 */

export async function adminLogin(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Authentication failed' };
  } catch (err: any) {
    // Local dev fallback credentials for offline testing
    if (username === 'admin' && password === 'password123') {
      return { success: true, user: { id: 'usr-dev', username: 'admin' } };
    }
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST' });
  } catch {
    // No-op
  }
}

export async function checkAdminAuth(): Promise<{ authenticated: boolean; user?: AdminUser }> {
  try {
    const res = await fetch(`${API_BASE}/admin/me`);
    if (res.ok) {
      const data = await res.json();
      return { authenticated: true, user: data.user };
    }
  } catch {
    // No-op
  }
  return { authenticated: false };
}

export async function adminSetup(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Setup failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Setup request failed' };
  }
}

export async function fetchAdminPlaylists(): Promise<Playlist[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists`);
    if (res.ok) {
      const data = await res.json();
      return data.playlists || [];
    }
  } catch {
    // Fallback
  }
  return MOCK_PLAYLISTS;
}

export async function fetchAdminPlaylistById(id: string): Promise<Playlist | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists/${id}`);
    if (res.ok) {
      const data = await res.json();
      return data.playlist || null;
    }
  } catch {
    // Fallback
  }
  return MOCK_PLAYLISTS.find(p => p.id === id) || null;
}

export async function createAdminPlaylist(playlistData: Partial<Playlist>): Promise<{ success: boolean; playlistId?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlistData),
    });
    const data = await res.json();
    if (res.ok) return { success: true, playlistId: data.playlistId };
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminPlaylist(id: string, playlistData: Partial<Playlist>): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlistData),
    });
    const data = await res.json();
    if (res.ok) return { success: true };
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminPlaylist(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) return { success: true };
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function setPlaylistStatus(id: string, status: 'published' | 'draft' | 'archived'): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function addSongToPlaylist(playlistId: string, songData: any): Promise<{ success: boolean; playlistSongId?: string; songId?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData),
    });
    const data = await res.json();
    if (res.ok) return { success: true, playlistSongId: data.playlistSongId, songId: data.songId };
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updatePlaylistSongs(playlistId: string, payload: { reorder?: any[]; updates?: any[] }): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists/${playlistId}/songs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function removeSongFromPlaylist(playlistId: string, playlistSongId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists/${playlistId}/songs?playlistSongId=${playlistSongId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkSpotifyStatus(): Promise<SpotifyConnectionStatus> {
  try {
    const res = await fetch(`${API_BASE}/admin/spotify/status`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return {
    isConnected: false,
    tokenValid: false,
    clientIdConfigured: false,
    clientSecretConfigured: false,
    redirectUri: `${window.location.origin}/api/admin/spotify/callback`,
    lastUpdated: null,
  };
}

export async function connectSpotify(): Promise<{ authUrl?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/spotify/connect`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) return { authUrl: data.authUrl };
    return { error: data.error };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function disconnectSpotify(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/spotify/disconnect`, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function lookupSpotifyTrack(query: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/spotify/track-lookup?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (res.ok) return data.track;
  throw new Error(data.error || 'Failed to lookup track');
}

export async function lookupSpotifyPlaylist(query: string): Promise<{ playlistId: string; count: number; tracks: any[] }> {
  const res = await fetch(`${API_BASE}/admin/spotify/playlist-lookup?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (res.ok) return data;
  throw new Error(data.error || 'Failed to lookup playlist');
}

export async function addBatchSongsToPlaylist(
  playlistId: string,
  tracks: any[]
): Promise<{ success: boolean; count?: number; tracks?: any[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracks }),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, count: data.count, tracks: data.tracks };
    }
    return { success: false, error: data.error || 'Failed to add tracks' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_BASE}/admin/settings`);
    if (res.ok) {
      const data = await res.json();
      return data.settings || MOCK_SETTINGS;
    }
  } catch {
    // Fallback
  }
  return MOCK_SETTINGS;
}

export async function updateAdminSettings(settings: SiteSettings): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

