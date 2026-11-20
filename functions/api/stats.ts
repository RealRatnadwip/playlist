import { getArchiveStats, Env } from './_db';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const stats = await getArchiveStats(context.env.DB);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
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
};

