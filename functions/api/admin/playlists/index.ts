import { Env } from '../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../_auth';
import { generateRandomToken } from '../../_crypto';

// Helper to convert title to URL slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET: List all playlists for admin (drafts, published, archived)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  try {
    const { results } = await context.env.DB
      .prepare(`
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
        GROUP BY p.id
        ORDER BY p.display_order ASC, p.updated_at DESC
      `)
      .all();

    const playlists = (results || []).map((row: any) => ({
      ...row,
      tags: row.tag_names ? row.tag_names.split(',').map((t: string) => t.trim()) : [],
    }));

    return new Response(JSON.stringify({ playlists }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Admin playlists get error:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve playlists' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST: Create a new playlist
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  try {
    const body = await context.request.json<any>();
    const {
      title,
      slug: customSlug,
      description,
      storyContent,
      coverImageUrl,
      spotifyPlaylistUrl,
      isFeatured = false,
      status = 'draft',
      displayOrder = 0,
      tags = [],
    } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: 'Playlist title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const playlistId = 'pl-' + generateRandomToken(8);
    const slug = (customSlug && customSlug.trim()) ? slugify(customSlug) : slugify(title);
    const now = Date.now();
    const publishedAt = status === 'published' ? now : null;

    // Check slug collision
    const existingSlug = await context.env.DB
      .prepare('SELECT id FROM playlists WHERE slug = ?')
      .bind(slug)
      .first<any>();

    const finalSlug = existingSlug ? `${slug}-${generateRandomToken(4)}` : slug;

    await context.env.DB
      .prepare(`
        INSERT INTO playlists (
          id, title, slug, description, story_content, cover_image_url, 
          spotify_playlist_url, is_featured, status, display_order, 
          created_at, updated_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        playlistId,
        title.trim(),
        finalSlug,
        description || null,
        storyContent || null,
        coverImageUrl || null,
        spotifyPlaylistUrl || null,
        isFeatured ? 1 : 0,
        status,
        Number(displayOrder) || 0,
        now,
        now,
        publishedAt
      )
      .run();

    // Assign tags
    if (Array.isArray(tags) && tags.length > 0) {
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

    return new Response(
      JSON.stringify({
        success: true,
        playlistId,
        slug: finalSlug,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Create playlist error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

