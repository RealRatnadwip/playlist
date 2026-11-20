import { getPlaylistBySlug, recordAnalyticsEvent, Env } from '../_db';

export const onRequestGet: PagesFunction<Env, 'slug'> = async (context) => {
  try {
    const slug = context.params.slug as string;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const playlist = await getPlaylistBySlug(context.env.DB, slug);

    if (!playlist) {
      return new Response(JSON.stringify({ error: 'Playlist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Record view asynchronously
    context.waitUntil(recordAnalyticsEvent(context.env.DB, 'playlist_view', playlist.id));

    return new Response(JSON.stringify({ playlist }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=180',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error(`Error in /api/playlists/${context.params.slug}:`, error);
    return new Response(JSON.stringify({ error: 'Failed to load playlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

