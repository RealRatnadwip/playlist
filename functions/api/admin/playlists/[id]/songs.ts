import { Env } from '../../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../../_auth';
import { generateRandomToken } from '../../../_crypto';

// POST: Add song to playlist
export const onRequestPost: PagesFunction<Env, 'id'> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const playlistId = context.params.id as string;

  try {
    const body = await context.request.json<any>();
    const {
      spotifyTrackId,
      title,
      artist,
      album,
      artworkUrl,
      durationMs = 0,
      spotifyUrl,
      personalNote,
      position,
    } = body;

    if (!title || !artist) {
      return new Response(JSON.stringify({ error: 'Song title and artist are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();
    let songId: string;

    // Check if song already exists in catalog
    if (spotifyTrackId) {
      const existing = await context.env.DB
        .prepare('SELECT id FROM songs WHERE spotify_track_id = ?')
        .bind(spotifyTrackId)
        .first<any>();

      if (existing) {
        songId = existing.id;
      } else {
        songId = 'song-' + generateRandomToken(8);
        await context.env.DB
          .prepare(`
            INSERT INTO songs (id, spotify_track_id, title, artist, album, artwork_url, duration_ms, spotify_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(songId, spotifyTrackId, title.trim(), artist.trim(), album || null, artworkUrl || null, Number(durationMs), spotifyUrl || null, now)
          .run();
      }
    } else {
      songId = 'song-' + generateRandomToken(8);
      await context.env.DB
        .prepare(`
          INSERT INTO songs (id, spotify_track_id, title, artist, album, artwork_url, duration_ms, spotify_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(songId, null, title.trim(), artist.trim(), album || null, artworkUrl || null, Number(durationMs), spotifyUrl || null, now)
        .run();
    }

    // Determine position
    let finalPos = position;
    if (finalPos === undefined || finalPos === null) {
      const maxPos = await context.env.DB
        .prepare('SELECT MAX(position) as max_p FROM playlist_songs WHERE playlist_id = ?')
        .bind(playlistId)
        .first<any>();
      finalPos = (maxPos?.max_p || 0) + 1;
    }

    const playlistSongId = 'ps-' + generateRandomToken(8);
    await context.env.DB
      .prepare(`
        INSERT INTO playlist_songs (id, playlist_id, song_id, position, personal_note, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(playlistSongId, playlistId, songId, finalPos, personalNote || null, now)
      .run();

    // Touch playlist updated_at
    await context.env.DB.prepare('UPDATE playlists SET updated_at = ? WHERE id = ?').bind(now, playlistId).run();

    return new Response(
      JSON.stringify({
        success: true,
        playlistSongId,
        songId,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Add song error:', error);
    return new Response(JSON.stringify({ error: 'Failed to add song to playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PUT: Reorder tracks or update personal annotations
export const onRequestPut: PagesFunction<Env, 'id'> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const playlistId = context.params.id as string;

  try {
    const body = await context.request.json<any>();
    const { updates, reorder } = body;
    const now = Date.now();

    // Reorder array: [{ playlistSongId, position }]
    if (Array.isArray(reorder)) {
      for (const item of reorder) {
        if (!item.playlistSongId || item.position === undefined) continue;
        await context.env.DB
          .prepare('UPDATE playlist_songs SET position = ? WHERE id = ? AND playlist_id = ?')
          .bind(item.position, item.playlistSongId, playlistId)
          .run();
      }
    }

    // Update individual track notes
    if (Array.isArray(updates)) {
      for (const u of updates) {
        if (!u.playlistSongId) continue;
        await context.env.DB
          .prepare('UPDATE playlist_songs SET personal_note = ? WHERE id = ? AND playlist_id = ?')
          .bind(u.personalNote ?? null, u.playlistSongId, playlistId)
          .run();
      }
    }

    await context.env.DB.prepare('UPDATE playlists SET updated_at = ? WHERE id = ?').bind(now, playlistId).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to update songs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE: Remove song from playlist
export const onRequestDelete: PagesFunction<Env, 'id'> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const playlistId = context.params.id as string;
  const url = new URL(context.request.url);
  const playlistSongId = url.searchParams.get('playlistSongId');

  if (!playlistSongId) {
    return new Response(JSON.stringify({ error: 'playlistSongId query param required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await context.env.DB
      .prepare('DELETE FROM playlist_songs WHERE id = ? AND playlist_id = ?')
      .bind(playlistSongId, playlistId)
      .run();

    await context.env.DB.prepare('UPDATE playlists SET updated_at = ? WHERE id = ?').bind(Date.now(), playlistId).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to remove song' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

