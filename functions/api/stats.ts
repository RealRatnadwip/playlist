import { getArchiveStats, Env } from './_db';
import { withEdgeCache } from './_cache';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withEdgeCache(
    context.request,
    context.waitUntil.bind(context),
    60,  // Cache at Edge for 60s
    180, // 3 min SWR
    async () => {
      try {
        const stats = await getArchiveStats(context.env.DB);

        return new Response(JSON.stringify(stats), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error: any) {
        console.error('Error in /api/stats:', error);
        return new Response(JSON.stringify({ error: 'Failed to load stats' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  );
};
