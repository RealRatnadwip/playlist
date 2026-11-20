import { Env, SongRecord } from '../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../_auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET: Fetch playlist with tracklist for editor
export const onRequestGet: PagesFunction<Env, 'id'> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const playlistId = context.params.id as string;

  try {
    const playlist = await context.env.DB
      .prepare(`
        SELECT p.*,
          GROUP_CONCAT(DISTINCT t.name) as tag_names
        FROM playlists p
        LEFT JOIN playlist_tags pt ON p.id = pt.playlist_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = ?
        GROUP BY p.id
        LIMIT 1
      `)
      .bind(playlistId)
      .first<any>();

    if (!playlist) {
      return new Response(JSON.stringify({ error: 'Playlist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { results: tracks } = await context.env.DB
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
      .bind(playlistId)
      .all();

    return new Response(
      JSON.stringify({
        playlist: {
          ...playlist,
          tags: playlist.tag_names ? playlist.tag_names.split(',').map((t: string) => t.trim()) : [],
          tracks: (tracks as unknown as SongRecord[]) || [],
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PUT: Update playlist metadata and story
export const onRequestPut: PagesFunction<Env, 'id'> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const playlistId = context.params.id as string;

  try {
    const body = await context.request.json<any>();
    const {
      title,
      slug: customSlug,
      description,
      storyContent,
      coverImageUrl,
      spotifyPlaylistUrl,
      isFeatured,
      status,
      displayOrder,
      tags,
    } = body;

    const existing = await context.env.DB
      .prepare('SELECT id, status, published_at FROM playlists WHERE id = ?')
      .bind(playlistId)
      .first<any>();

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Playlist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();
    let publishedAt = existing.published_at;
    if (status === 'published' && (!publishedAt || existing.status !== 'published')) {
      publishedAt = now;
    }

    const newSlug = customSlug ? slugify(customSlug) : undefined;

    await context.env.DB
      .prepare(`
        UPDATE playlists SET
          title = COALESCE(?, title),
          slug = COALESCE(?, slug),
          description = ?,
          story_content = ?,
          cover_image_url = ?,
          spotify_playlist_url = ?,
          is_featured = COALESCE(?, is_featured),
          status = COALESCE(?, status),
          display_order = COALESCE(?, display_order),
          updated_at = ?,
          published_at = ?
        WHERE id = ?
      `)
      .bind(
        title?.trim() || null,
        newSlug || null,
        description ?? null,
        storyContent ?? null,
        coverImageUrl ?? null,
        spotifyPlaylistUrl ?? null,
        isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
        status || null,
        displayOrder !== undefined ? Number(displayOrder) : null,
        now,
        publishedAt,
        playlistId
      )
      .run();

    // If tags were provided, update them
    if (Array.isArray(tags)) {
      await context.env.DB.prepare('DELETE FROM playlist_tags WHERE playlist_id = ?').bind(playlistId).run();
      for (const tagStr of tags) {
        if (!tagStr || typeof tagStr !== 'string') continue;
        const tagName = tagStr.trim();
        const tagSlug = slugify(tagName);
        const tagId = 'tag-' + tagSlug;

        await context.env.DB
          .prepare('INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)')
          .bind(tagId, tagName, tagSlug)
          .run();

        await context.env.DB
          .prepare('INSERT OR IGNORE INTO playlist_tags (playlist_id, tag_id) VALUES (?, ?)')
          .bind(playlistId, tagId)
          .run();
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Playlist updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Update playlist error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE: Delete playlist
export const onRequestDelete: PagesFunction<Env, 'id'> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const playlistId = context.params.id as string;

  try {
    await context.env.DB.prepare('DELETE FROM playlists WHERE id = ?').bind(playlistId).run();
    return new Response(JSON.stringify({ success: true, message: 'Playlist deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to delete playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

