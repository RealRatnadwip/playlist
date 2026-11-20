import { getPlaylistBySlug, Env } from '../_db';
import { withEdgeCache } from '../_cache';

export const onRequestGet: PagesFunction<Env, 'slug'> = async (context) => {
  return withEdgeCache(
    context.request,
    context.waitUntil.bind(context),
    60,  // 60s edge cache
    300, // 5 min SWR
    async () => {
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

        return new Response(JSON.stringify({ playlist }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
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
    }
  );
};
