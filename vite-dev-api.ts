import type { Plugin, ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';

// Parse .env file manually to ensure all variables are loaded in dev server
function parseEnv(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return env;

  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      env[key] = val;
    }
  }
  return env;
}

// Local file token store
const TOKEN_FILE = path.resolve(process.cwd(), '.spotify_token.json');
const LOCAL_DB_FILE = path.resolve(process.cwd(), '.local_db.json');

function getStoredToken(): string | null {
  if (fs.existsSync(TOKEN_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
      if (data && data.refreshToken) return data.refreshToken;
    } catch {
      // ignore
    }
  }
  return null;
}

function saveStoredToken(refreshToken: string) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ refreshToken, updatedAt: Date.now() }, null, 2));
}

function clearStoredToken() {
  if (fs.existsSync(TOKEN_FILE)) {
    fs.unlinkSync(TOKEN_FILE);
  }
}

// Initial Local Database Seeding
function getLocalDb() {
  if (fs.existsSync(LOCAL_DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
    } catch {
      // ignore
    }
  }

  // Default initial seed data
  const initial = {
    settings: {
      about_heading: "A little about what's playing in my head.",
      about_body: `I've always believed that you can know someone better through what they listen to at 1 AM than through a resume. This archive is my personal catalog of sounds, memories, and the quiet records that anchor different seasons of my life.

Every playlist here has a reason to exist. Some were made for specific people, some during quiet train journeys, and some simply because a song refused to leave my chest.

No algorithms. No shuffle recommendations. Just the songs I return to when the world gets too loud.`,
      hero_intro: 'A personal music archive, listening journal and playlist collection.',
      footer_signature: 'Made with music and a little too much attachment to playlists.',
      owner_name: 'Ratnadwip Sarkar',
      portfolio_url: 'https://ratnadwip.com',
    },
    playlists: [],
    visits: 0,
  };

  fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(initial, null, 2));
  return initial;
}

function saveLocalDb(db: any) {
  fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(db, null, 2));
}

// Fetch helper to get valid access token from refresh token
async function getSpotifyAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string | null> {
  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
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

    if (!res.ok) {
      const err = await res.text();
      console.error('[Spotify Dev API] Refresh token exchange failed:', res.status, err);
      return null;
    }

    const data: any = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('[Spotify Dev API] Token error:', err);
    return null;
  }
}

// Client Credentials token for looking up public track metadata
async function getClientCredentialsToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString(),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Vite Dev Server API Plugin
 * Implements real Spotify playback and local database during `npm run dev`
 */
export function viteDevApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-dev-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || '';
        if (!urlStr.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = new URL(urlStr, `http://${req.headers.host || 'localhost:3000'}`);
        const pathname = parsedUrl.pathname;
        const method = req.method || 'GET';

        // Load latest variables from .env
        const env = parseEnv(path.resolve(process.cwd(), '.env'));
        const clientId = env.SPOTIFY_CLIENT_ID || '';
        const clientSecret = env.SPOTIFY_CLIENT_SECRET || '';
        let refreshToken = env.SPOTIFY_REFRESH_TOKEN || getStoredToken();

        const rawHost = req.headers.host || '127.0.0.1:3000';
        // Spotify Developer Dashboard disallows "localhost" - loopback IP "127.0.0.1" is required
        const safeHost = rawHost.replace(/^localhost/, '127.0.0.1');
        const localRedirectUri = env.SPOTIFY_REDIRECT_URI && env.SPOTIFY_REDIRECT_URI.includes('127.0.0.1')
          ? env.SPOTIFY_REDIRECT_URI
          : `http://${safeHost}/api/admin/spotify/callback`;

        const sendJson = (statusCode: number, data: any) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.end(JSON.stringify(data));
        };

        const readBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        // --- 1. SPOTIFY: GET /api/spotify/now-playing ---
        if (pathname === '/api/spotify/now-playing' && method === 'GET') {
          if (!clientId || !clientSecret) {
            return sendJson(200, {
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
              message: 'Spotify Client ID and Secret not configured in .env',
            });
          }

          if (!refreshToken) {
            return sendJson(200, {
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
              message: 'Spotify account not connected yet. Visit /admin to connect your Spotify account.',
            });
          }

          const accessToken = await getSpotifyAccessToken(clientId, clientSecret, refreshToken);
          if (!accessToken) {
            return sendJson(200, {
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
              message: 'Spotify authorization expired or revoked. Please re-connect at /admin.',
            });
          }

          try {
            const playerRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (playerRes.status === 200) {
              const data: any = await playerRes.json();
              if (data && data.item && data.currently_playing_type === 'track') {
                const item = data.item;
                const isPlaying = Boolean(data.is_playing);
                return sendJson(200, {
                  isPlaying,
                  title: item.name,
                  artist: (item.artists || []).map((a: any) => a.name).join(', '),
                  album: item.album?.name || null,
                  albumArtwork: item.album?.images?.[0]?.url || null,
                  spotifyUrl: item.external_urls?.spotify || null,
                  trackId: item.id,
                  progressMs: data.progress_ms || 0,
                  durationMs: item.duration_ms || 0,
                  fetchedAt: Date.now(),
                  isRecent: !isPlaying,
                  message: isPlaying ? undefined : 'A rare moment of silence.',
                });
              }
            }

            // Fallback to recently played
            const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (recentRes.ok) {
              const recentData: any = await recentRes.json();
              const track = recentData?.items?.[0]?.track;
              if (track) {
                return sendJson(200, {
                  isPlaying: false,
                  title: track.name,
                  artist: (track.artists || []).map((a: any) => a.name).join(', '),
                  album: track.album?.name || null,
                  albumArtwork: track.album?.images?.[0]?.url || null,
                  spotifyUrl: track.external_urls?.spotify || null,
                  trackId: track.id,
                  progressMs: 0,
                  durationMs: track.duration_ms || 0,
                  fetchedAt: Date.now(),
                  isRecent: true,
                  message: 'Nothing playing right now. A rare moment of silence.',
                });
              }
            }

            return sendJson(200, {
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
            });
          } catch (err: any) {
            console.error('[Spotify Dev API] Error fetching playback:', err);
            return sendJson(200, {
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
            });
          }
        }

        // --- 2. SPOTIFY: POST /api/admin/spotify/connect ---
        if (pathname === '/api/admin/spotify/connect' && method === 'POST') {
          if (!clientId) {
            return sendJson(400, { error: 'SPOTIFY_CLIENT_ID not found in .env' });
          }

          console.log('[Spotify Dev API] Connecting Spotify with redirect_uri:', localRedirectUri);

          const scopes = [
            'user-read-currently-playing',
            'user-read-recently-played',
            'user-read-playback-state',
          ].join(' ');

          const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${encodeURIComponent(
            clientId
          )}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(
            localRedirectUri
          )}&state=local_dev`;

          return sendJson(200, { authUrl, redirectUri: localRedirectUri });
        }

        // --- 3. SPOTIFY: GET /api/admin/spotify/callback ---
        if (pathname === '/api/admin/spotify/callback' && method === 'GET') {
          const code = parsedUrl.searchParams.get('code');
          if (!code) {
            res.statusCode = 302;
            res.setHeader('Location', '/admin?spotify_error=missing_code');
            return res.end();
          }

          try {
            const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${basicAuth}`,
              },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: localRedirectUri,
              }).toString(),
            });

            if (!tokenRes.ok) {
              const err = await tokenRes.text();
              console.error('[Spotify Dev API] Callback code exchange failed:', tokenRes.status, err);
              res.statusCode = 302;
              res.setHeader('Location', '/admin?spotify_error=exchange_failed');
              return res.end();
            }

            const tokenData: any = await tokenRes.json();
            if (tokenData.refresh_token) {
              saveStoredToken(tokenData.refresh_token);
              console.log('[Spotify Dev API] Spotify connected successfully! Stored refresh token locally.');
            }

            res.statusCode = 302;
            res.setHeader('Location', '/admin?spotify=connected');
            return res.end();
          } catch (err) {
            console.error('[Spotify Dev API] Callback error:', err);
            res.statusCode = 302;
            res.setHeader('Location', '/admin?spotify_error=internal_error');
            return res.end();
          }
        }

        // --- 4. SPOTIFY: GET /api/admin/spotify/status ---
        if (pathname === '/api/admin/spotify/status' && method === 'GET') {
          const isConnected = Boolean(refreshToken);
          return sendJson(200, {
            isConnected,
            tokenValid: isConnected,
            clientIdConfigured: Boolean(clientId),
            clientSecretConfigured: Boolean(clientSecret),
            redirectUri: localRedirectUri,
            lastUpdated: Date.now(),
          });
        }

        // --- 5. SPOTIFY: POST /api/admin/spotify/disconnect ---
        if (pathname === '/api/admin/spotify/disconnect' && method === 'POST') {
          clearStoredToken();
          return sendJson(200, { success: true, message: 'Spotify disconnected' });
        }

        // --- 6. SPOTIFY: GET /api/admin/spotify/track-lookup ---
        if (pathname === '/api/admin/spotify/track-lookup' && method === 'GET') {
          const query = parsedUrl.searchParams.get('q') || '';
          let trackId = query.trim();
          const match = query.match(/track\/([a-zA-Z0-9]{22})/);
          if (match) trackId = match[1];

          let token: string | null = null;
          if (refreshToken) {
            token = await getSpotifyAccessToken(clientId, clientSecret, refreshToken);
          }
          if (!token && clientId && clientSecret) {
            token = await getClientCredentialsToken(clientId, clientSecret);
          }

          if (!token) {
            return sendJson(400, { error: 'Unable to authenticate with Spotify' });
          }

          try {
            const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!trackRes.ok) {
              return sendJson(trackRes.status, { error: 'Track not found' });
            }
            const track: any = await trackRes.json();
            return sendJson(200, {
              track: {
                spotifyTrackId: track.id,
                title: track.name,
                artist: (track.artists || []).map((a: any) => a.name).join(', '),
                album: track.album?.name || '',
                artworkUrl: track.album?.images?.[0]?.url || '',
                durationMs: track.duration_ms || 0,
                spotifyUrl: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
              },
            });
          } catch (err: any) {
            return sendJson(500, { error: err.message });
          }
        }

        // --- 6b. SPOTIFY: GET /api/admin/spotify/playlist-lookup ---
        if (pathname === '/api/admin/spotify/playlist-lookup' && method === 'GET') {
          const query = parsedUrl.searchParams.get('q') || '';
          let playlistId = query.trim();
          const match = query.match(/playlist\/([a-zA-Z0-9]{22})/);
          if (match) playlistId = match[1];

          let token: string | null = null;
          if (refreshToken) {
            token = await getSpotifyAccessToken(clientId, clientSecret, refreshToken);
          }
          if (!token && clientId && clientSecret) {
            token = await getClientCredentialsToken(clientId, clientSecret);
          }

          if (!token) {
            return sendJson(400, { error: 'Unable to authenticate with Spotify' });
          }

          try {
            const plRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!plRes.ok) {
              return sendJson(plRes.status, { error: 'Playlist not found on Spotify' });
            }
            const data: any = await plRes.json();
            const tracks = (data.items || [])
              .filter((item: any) => item && item.track && item.track.id)
              .map((item: any) => {
                const t = item.track;
                return {
                  spotifyTrackId: t.id,
                  title: t.name,
                  artist: (t.artists || []).map((a: any) => a.name).join(', '),
                  album: t.album?.name || '',
                  artworkUrl: t.album?.images?.[0]?.url || t.album?.images?.[1]?.url || '',
                  durationMs: t.duration_ms || 0,
                  spotifyUrl: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
                };
              });

            return sendJson(200, { playlistId, count: tracks.length, tracks });
          } catch (err: any) {
            return sendJson(500, { error: err.message });
          }
        }

        // --- 7. PLAYLISTS: GET /api/playlists ---
        if (pathname === '/api/playlists' && method === 'GET') {
          const db = getLocalDb();
          const tag = parsedUrl.searchParams.get('tag');
          let pls = db.playlists.filter((p: any) => p.status === 'published');
          if (tag && tag !== 'all') {
            pls = pls.filter((p: any) => p.tags?.some((t: string) => t.toLowerCase() === tag.toLowerCase()));
          }
          return sendJson(200, { playlists: pls });
        }

        // --- 8. PLAYLISTS: GET /api/playlists/:slug ---
        if (pathname.startsWith('/api/playlists/') && method === 'GET') {
          const slug = pathname.replace('/api/playlists/', '');
          const db = getLocalDb();
          const pl = db.playlists.find((p: any) => p.slug === slug && p.status === 'published');
          if (pl) return sendJson(200, { playlist: pl });
          return sendJson(404, { error: 'Playlist not found' });
        }

        // --- 9. STATS: GET /api/stats ---
        if (pathname === '/api/stats' && method === 'GET') {
          const db = getLocalDb();
          const published = db.playlists.filter((p: any) => p.status === 'published');
          const allArtists = new Set<string>();
          let totalSongs = 0;
          for (const p of published) {
            totalSongs += (p.tracks || []).length;
            for (const t of p.tracks || []) {
              if (t.artist) allArtists.add(t.artist);
            }
          }
          return sendJson(200, {
            totalPlaylists: published.length,
            totalSongs,
            totalArtists: allArtists.size,
            totalVisits: (db.visits || 0) + 1,
            latestPlaylist: published[0] || null,
          });
        }

        // --- 10. SETTINGS: GET /api/settings/public ---
        if (pathname === '/api/settings/public' && method === 'GET') {
          const db = getLocalDb();
          return sendJson(200, { settings: db.settings });
        }

        // --- 11. ANALYTICS: POST /api/analytics/visit ---
        if (pathname === '/api/analytics/visit' && method === 'POST') {
          const db = getLocalDb();
          db.visits = (db.visits || 140) + 1;
          saveLocalDb(db);
          return sendJson(200, { success: true });
        }

        // --- 12. ADMIN: POST /api/admin/login ---
        if (pathname === '/api/admin/login' && method === 'POST') {
          const body = await readBody();
          // In local dev, accept admin login or any password
          res.setHeader('Set-Cookie', 'ratnadwip_admin_session=dev_session_token; Path=/; HttpOnly; SameSite=Lax');
          return sendJson(200, {
            success: true,
            user: { id: 'usr-admin', username: body.username || 'admin' },
          });
        }

        // --- 13. ADMIN: GET /api/admin/me ---
        if (pathname === '/api/admin/me' && method === 'GET') {
          return sendJson(200, {
            authenticated: true,
            user: { id: 'usr-admin', username: 'admin' },
          });
        }

        // --- 14. ADMIN: GET /api/admin/playlists ---
        if (pathname === '/api/admin/playlists' && method === 'GET') {
          const db = getLocalDb();
          return sendJson(200, { playlists: db.playlists });
        }

        // --- 15. ADMIN: POST /api/admin/playlists ---
        if (pathname === '/api/admin/playlists' && method === 'POST') {
          const body = await readBody();
          const db = getLocalDb();
          const newId = 'pl-' + Date.now().toString(36);
          const newPl = {
            id: newId,
            title: body.title,
            slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
            description: body.description || '',
            story_content: body.storyContent || '',
            cover_image_url: body.coverImageUrl || '',
            spotify_playlist_url: body.spotifyPlaylistUrl || '',
            is_featured: Boolean(body.isFeatured),
            status: body.status || 'draft',
            display_order: Number(body.displayOrder) || 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            published_at: body.status === 'published' ? Date.now() : null,
            tags: body.tags || [],
            tracks: [],
            track_count: 0,
            artist_count: 0,
          };
          db.playlists.unshift(newPl);
          saveLocalDb(db);
          return sendJson(201, { success: true, playlistId: newId });
        }

        // --- 16. ADMIN: GET /api/admin/playlists/:id ---
        if (pathname.startsWith('/api/admin/playlists/') && method === 'GET') {
          const id = pathname.replace('/api/admin/playlists/', '');
          const db = getLocalDb();
          const pl = db.playlists.find((p: any) => p.id === id);
          if (pl) return sendJson(200, { playlist: pl });
          return sendJson(404, { error: 'Playlist not found' });
        }

        // --- 17. ADMIN: PUT /api/admin/playlists/:id ---
        if (pathname.startsWith('/api/admin/playlists/') && method === 'PUT') {
          const id = pathname.replace('/api/admin/playlists/', '');
          const body = await readBody();
          const db = getLocalDb();
          const idx = db.playlists.findIndex((p: any) => p.id === id);
          if (idx !== -1) {
            db.playlists[idx] = {
              ...db.playlists[idx],
              ...body,
              updated_at: Date.now(),
            };
            saveLocalDb(db);
            return sendJson(200, { success: true });
          }
          return sendJson(404, { error: 'Playlist not found' });
        }

        // --- 18. ADMIN: DELETE /api/admin/playlists/:id ---
        if (pathname.startsWith('/api/admin/playlists/') && method === 'DELETE') {
          const id = pathname.replace('/api/admin/playlists/', '');
          const db = getLocalDb();
          db.playlists = db.playlists.filter((p: any) => p.id !== id);
          saveLocalDb(db);
          return sendJson(200, { success: true });
        }

        // --- 19. ADMIN: POST /api/admin/playlists/:id/songs ---
        if (pathname.includes('/songs') && method === 'POST') {
          const playlistId = pathname.split('/playlists/')[1]?.split('/songs')[0];
          const body = await readBody();
          const db = getLocalDb();
          const pl = db.playlists.find((p: any) => p.id === playlistId);
          if (pl) {
            if (!pl.tracks) pl.tracks = [];

            // Batch addition
            if (body.tracks && Array.isArray(body.tracks)) {
              const inserted: any[] = [];
              for (const t of body.tracks) {
                if (!t.title || !t.artist) continue;
                const songId = 'song-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
                const playlistSongId = 'ps-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
                const newTrack = {
                  id: songId,
                  spotify_track_id: t.spotifyTrackId || null,
                  playlist_song_id: playlistSongId,
                  title: t.title,
                  artist: t.artist,
                  album: t.album || '',
                  artwork_url: t.artworkUrl || null,
                  duration_ms: t.durationMs || 0,
                  spotify_url: t.spotifyUrl || null,
                  personal_note: t.personalNote || null,
                  position: pl.tracks.length + 1,
                };
                pl.tracks.push(newTrack);
                inserted.push(newTrack);
              }
              pl.track_count = pl.tracks.length;
              pl.artist_count = new Set(pl.tracks.map((t: any) => t.artist)).size;
              saveLocalDb(db);
              return sendJson(201, { success: true, count: inserted.length, tracks: inserted });
            }

            const songId = 'song-' + Date.now().toString(36);
            const playlistSongId = 'ps-' + Date.now().toString(36);
            pl.tracks.push({
              id: songId,
              spotify_track_id: body.spotifyTrackId || null,
              playlist_song_id: playlistSongId,
              title: body.title,
              artist: body.artist,
              album: body.album,
              artwork_url: body.artworkUrl,
              duration_ms: body.durationMs || 0,
              spotify_url: body.spotifyUrl,
              personal_note: body.personalNote || null,
              position: pl.tracks.length + 1,
            });
            pl.track_count = pl.tracks.length;
            pl.artist_count = new Set(pl.tracks.map((t: any) => t.artist)).size;
            saveLocalDb(db);
            return sendJson(201, { success: true, playlistSongId, songId });
          }
          return sendJson(404, { error: 'Playlist not found' });
        }

        // --- 20. ADMIN: GET /api/admin/settings & PUT ---
        if (pathname === '/api/admin/settings') {
          const db = getLocalDb();
          if (method === 'GET') {
            return sendJson(200, { settings: db.settings });
          }
          if (method === 'PUT') {
            const body = await readBody();
            db.settings = { ...db.settings, ...(body.settings || {}) };
            saveLocalDb(db);
            return sendJson(200, { success: true });
          }
        }

        // Default 404 for unhandled API routes
        return sendJson(404, { error: `Route ${pathname} not found in local dev API` });
      });
    },
  };
}
