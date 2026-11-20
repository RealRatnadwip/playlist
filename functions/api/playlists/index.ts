import { getPublishedPlaylists, Env } from '../_db';
import { withEdgeCache } from '../_cache';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withEdgeCache(
    context.request,
    context.waitUntil.bind(context),
    60,  // Cache for 60s at the Cloudflare Edge
    300, // 5 min SWR
    async () => {
      try {
        const url = new URL(context.request.url);
        const tag = url.searchParams.get('tag');
        const sort = url.searchParams.get('sort') || 'order';

        const playlists = await getPublishedPlaylists(context.env.DB, tag, sort);

        return new Response(JSON.stringify({ playlists }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error: any) {
        console.error('Error in /api/playlists:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch playlists' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  );
};
