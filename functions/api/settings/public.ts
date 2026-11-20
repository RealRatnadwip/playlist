import { getPublicSettings, Env } from '../_db';
import { withEdgeCache } from '../_cache';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withEdgeCache(
    context.request,
    context.waitUntil.bind(context),
    300,  // 5 minutes Edge cache
    1800, // 30 min SWR
    async () => {
      try {
        const settings = await getPublicSettings(context.env.DB);

        return new Response(JSON.stringify({ settings }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error: any) {
        console.error('Error in /api/settings/public:', error);
        return new Response(JSON.stringify({ error: 'Failed to load settings' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  );
};
